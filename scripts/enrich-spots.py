#!/usr/bin/env python3
"""
enrich-spots.py — Gaskuy Spot Enrichment Pipeline

Enrich spot data using free APIs:
  - OSM Overpass API (coordinates, opening hours, facilities)
  - Wikipedia API (descriptions, history, fun facts)

Usage:
  python enrich-spots.py                    # Run with default samples
  python enrich-spots.py --input spots.json # Enrich from JSON file
  python enrich-spots.py --single "Kawah Putih" -7.1660 107.4042
  python enrich-spots.py --batch 10 --region "Jawa Barat"

Output: enriched-spots.json (draft ready to merge into spots.ts)
"""

import json
import os
import re
import sys
import time
from typing import Any

import requests

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
WIKI_API = "https://id.wikipedia.org/w/api.php"
REQUEST_DELAY = 2.5  # seconds between API requests (rate limiting)

HEADERS = {
    "User-Agent": "Gaskuy/1.0 (+https://gaskuy.id) Python/3.13",
    "Accept": "application/json",
}


# ---------------------------------------------------------------------------
#  OSM Overpass API
# ---------------------------------------------------------------------------

def enrich_from_osm(lat: float, lng: float, name: str = "") -> dict[str, Any]:
    """Fetch OSM data (opening hours, phone, website, facilities) near a point."""
    query = f"""[out:json];(node(around:100,{lat},{lng});way(around:100,{lat},{lng}););out body 10;"""
    try:
        resp = requests.post(
            OVERPASS_URL,
            data={"data": query},
            headers=HEADERS,
            timeout=15,
        )
        resp.raise_for_status()
        elements = resp.json().get("elements", [])
    except Exception as e:
        print(f"  [OSM] Error for '{name}': {e}", file=sys.stderr)
        return {}

    if not elements:
        return {}

    tags = elements[0].get("tags", {})
    return {
        "opening_hours": tags.get("opening_hours", ""),
        "phone": tags.get("phone", ""),
        "website": tags.get("website", ""),
        "wheelchair": tags.get("wheelchair", ""),
        "toilets": tags.get("toilets", ""),
    }


def search_poi_by_category(category: str, lat: float, lng: float,
                           radius: int = 50000) -> list[dict]:
    """Bulk-search POIs by category around a location."""
    osm_tags = {
        "kuliner": '["amenity"="restaurant"]',
        "alam": '["tourism"="attraction"]["natural"]',
        "budaya": '["tourism"="museum"]',
        "spbu": '["amenity"="fuel"]',
        "bengkel": '["amenity"="car_repair"]',
    }
    tag = osm_tags.get(category, '["tourism"="attraction"]')

    query = f"""[out:json];node{tag}(around:{radius},{lat},{lng});out body 20;"""
    try:
        resp = requests.post(OVERPASS_URL, data={"data": query}, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        return resp.json().get("elements", [])
    except Exception as e:
        print(f"  [OSM] Search error: {e}", file=sys.stderr)
        return []


# ---------------------------------------------------------------------------
#  Wikipedia API
# ---------------------------------------------------------------------------

def fetch_from_wikipedia(spot_name: str) -> dict[str, Any]:
    """Fetch description, coordinates, and thumbnail from Wikipedia Indonesia."""
    params = {
        "action": "query",
        "format": "json",
        "titles": spot_name,
        "prop": "extracts|coordinates|pageimages",
        "exintro": True,
        "explaintext": True,
        "exsentences": 5,
        "pithumbsize": 500,
    }
    try:
        resp = requests.get(WIKI_API, params=params, headers=HEADERS, timeout=10)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"  [Wiki] Error for '{spot_name}': {e}", file=sys.stderr)
        return {}

    pages = data.get("query", {}).get("pages", {})
    for page_id, page in pages.items():
        if page_id == "-1":
            continue
        coords = None
        if page.get("coordinates"):
            c = page["coordinates"][0]
            coords = {"lat": c["lat"], "lon": c["lon"]}
        return {
            "description": page.get("extract", ""),
            "wikipedia_coordinates": coords,
            "thumbnail": page.get("thumbnail", {}).get("source", ""),
        }
    return {}


def extract_why_special(description: str) -> str:
    """Extract key facts from a Wikipedia description."""
    keywords = [
        "terbesar", "tertinggi", "tertua", "satu-satunya",
        "terbaik", "terkenal", "ikon", "warisan dunia",
        "terindah", "legendaris", "pertama", "terpanjang",
        "terpopuler", "terlengkap",
    ]
    sentences = re.split(r'(?<=[.!?])\s+', description)
    special = []
    for s in sentences:
        s_stripped = s.strip()
        if any(kw in s_stripped.lower() for kw in keywords) and len(s_stripped) > 20:
            special.append(s_stripped)
    return " ".join(special[:3]) if special else (description[:200] if description else "")


# ---------------------------------------------------------------------------
#  Main Enrichment Pipeline
# ---------------------------------------------------------------------------

def enrich_spot(name: str, lat: float, lng: float) -> dict[str, Any]:
    """Full enrichment pipeline: OSM + Wikipedia."""
    result: dict[str, Any] = {
        "name": name,
        "input_lat": lat,
        "input_lng": lng,
    }

    # 1. OSM
    print(f"  → OSM...", end=" ", flush=True)
    osm = enrich_from_osm(lat, lng, name)
    result["osm"] = osm
    print("done" if osm else "no data")

    time.sleep(REQUEST_DELAY)

    # 2. Wikipedia
    print(f"  → Wikipedia...", end=" ", flush=True)
    wiki = fetch_from_wikipedia(name)
    result["wikipedia"] = wiki
    if wiki.get("description"):
        result["why_special"] = extract_why_special(wiki["description"])
    print("done" if wiki else "no data")

    time.sleep(REQUEST_DELAY)

    return result


def enrich_batch(spots: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Enrich a list of spots. Each spot must have: 'name', 'lat', 'lng'."""
    results = []
    total = len(spots)
    for i, spot in enumerate(spots, 1):
        name = spot.get("name", f"Spot {i}")
        lat = spot.get("lat")
        lng = spot.get("lng")
        if lat is None or lng is None:
            print(f"[{i}/{total}] ⏭ Skipping '{name}' — missing coordinates")
            continue
        print(f"[{i}/{total}] Enriching: {name}...")
        result = enrich_spot(name, lat, lng)
        result["slug"] = spot.get("slug", "")
        result["region"] = spot.get("region", "")
        result["category"] = spot.get("category", "")
        results.append(result)
        print(f"  ✓ {name}")
        print()

    return results


# ---------------------------------------------------------------------------
#  CLI
# ---------------------------------------------------------------------------

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--single":
        if len(sys.argv) < 5:
            print("Usage: enrich-spots.py --single <name> <lat> <lng>")
            sys.exit(1)
        name = sys.argv[2]
        lat = float(sys.argv[3])
        lng = float(sys.argv[4])
        result = enrich_spot(name, lat, lng)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return

    if len(sys.argv) > 1 and sys.argv[1] == "--input":
        input_path = sys.argv[2]
        if not os.path.exists(input_path):
            print(f"File not found: {input_path}", file=sys.stderr)
            sys.exit(1)
        with open(input_path) as f:
            spots = json.load(f)
    else:
        # Default sample spots (Jawa Barat)
        spots = [
            {"name": "Kawah Putih", "lat": -7.1660, "lng": 107.4042, "slug": "kawah-putih-ciwidey", "region": "Bandung", "category": "alam"},
            {"name": "Gunung Tangkuban Perahu", "lat": -6.7694, "lng": 107.6050, "slug": "gunung-tangkuban-perahu", "region": "Bandung", "category": "alam"},
            {"name": "Pantai Pangandaran", "lat": -7.6953, "lng": 108.6480, "slug": "pantai-pangandaran", "region": "Pangandaran", "category": "alam"},
            {"name": "Sate Maranggi Cianjur", "lat": -6.8128, "lng": 107.1394, "slug": "sate-maranggi-cianjur", "region": "Cianjur", "category": "kuliner"},
            {"name": "Gedung Sate Bandung", "lat": -6.9011, "lng": 107.6186, "slug": "gedung-sate-bandung", "region": "Bandung", "category": "sejarah"},
            {"name": "Curug Cimahi", "lat": -6.8444, "lng": 107.5692, "slug": "curug-cimahi", "region": "Bandung", "category": "alam"},
        ]

    results = enrich_batch(spots)

    output_path = "enriched-spots.json"
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Done! {len(results)} spots enriched → {output_path}")
    print(f"   Review & merge the data into src/data/spots.ts")


if __name__ == "__main__":
    main()

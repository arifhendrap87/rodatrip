# Strategi Data Sourcing — Spot Istimewa Gaskuy

**Versi:** 2.0 | **Tanggal:** Mei 2026 | **Status:** MVP (25 spots, target 50 spots Jawa Barat)

Panduan lengkap mengumpulkan & mengelola data destinasi roadtrip Indonesia dengan metode 100% gratis.

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Arsitektur Data](#2-arsitektur-data)
3. [Metode Manual (Current)](#3-metode-manual-current)
4. [Proactive Research Workflow](#4-proactive-research-workflow)
5. [OpenStreetMap Overpass API](#5-openstreetmap-overpass-api)
6. [Wikipedia API](#6-wikipedia-api)
7. [Web Scraping (Opsional)](#7-web-scraping-opsional)
8. [Pipeline Automation](#8-pipeline-automation)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [Maintenance Guide](#10-maintenance-guide)
11. [Lampiran A — Data Schema](#lampiran-a--data-schema)
12. [Lampiran B — Province-to-City Mapping](#lampiran-b--province-to-city-mapping)
13. [Lampiran C — API Quotas & Limits](#lampiran-c--api-quotas--limits)
14. [Lampiran D — Jawa Barat Target List](#lampiran-d--jawa-barat-target-list)

---

## 1. Ringkasan Eksekutif

Halaman **`/spot-istimewa`** adalah fitur kurasi destinasi roadtrip Indonesia. Saat ini berisi **25 spots** yang diinput secara manual. Untuk scale ke ratusan hingga ribuan spots, diperlukan pipeline data yang sistematis.

Dokumen ini merangkum 3 metode pengumpulan data gratis plus 1 metode opsional yang bisa digunakan:

| Metode | Effort | Data Quality | Scalability | Best Untuk |
|--------|--------|--------------|-------------|------------|
| Manual Curation | 30 menit/spot | ⭐⭐⭐⭐⭐ | ❌ | Featured spots, quality control |
| OpenStreetMap API | 2-3 hari setup | ⭐⭐⭐ | ✅✅ | Bulk POI (koordinat, jam buka, fasilitas) |
| Wikipedia API | 1 hari setup | ⭐⭐⭐⭐ | ✅✅ | Deskripsi, sejarah, fakta unik |
| Travel Blog Research | 1-2 hari setup | ⭐⭐⭐ | ✅ | Tips, harga terkini, pengalaman |

> **Strategi:** Manual curation untuk 25-50 spots featured + Python enrichment pipeline (OSM + Wikipedia) untuk scale ke 100+ spots. Fokus pertama: **Jawa Barat**.

---

## 2. Arsitektur Data

### 2.1 Data Flow

```
┌──────────────────────────────────────────┐
│     Proactive Data Collection            │
│  (Kita yang riset & input, bukan tunggu) │
└──────────────┬───────────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌──────────────┐
│ Manual │ │  OSM   │ │  Wikipedia   │
│ Input  │ │ Overpass│ │    API       │
│(25 spots)│ │(Bulk)  │ │ (Deskripsi   │
│        │ │(Koordinat│ │  + Sejarah)  │
│        │ │,Jam Buka)│ │              │
└────┬───┘ └───┬────┘ └─────┬────────┘
     │         │            │
     └─────────┴────────────┘
               │
               ▼
     ┌─────────────────┐
     │  Manual Review  │
     │  (QC & Edit)    │
     └────────┬────────┘
              │
              ▼
     ┌─────────────────┐
     │   spots.ts      │
     │  (Data Final)   │
     └────────┬────────┘
              │ npm run build
              ▼
     ┌─────────────────┐
     │  Static Pages   │
     │  (36+ halaman)  │
     └─────────────────┘
```

---

## 3. Metode Manual (Current)

Metode yang dipakai untuk 25 spots saat ini. Ideal untuk featured spots berkualitas tinggi.

### 3.1 Workflow per Spot

1. **Riset:** Google Maps + blog travel Indonesia (jalantikus, pergi.com, traveloka blog)
2. **Verifikasi:** Cek jam buka, harga, koordinat di Google Maps
3. **Konten:** Tulis deskripsi, tips, whySpecial (3-5 kalimat)
4. **Foto:** Download dari Unsplash (resolusi 800px, simpan di `/public/images/spots/`)
5. **Input:** Tambah data ke `src/data/spots.ts`
6. **Build:** `npm run build` untuk generate halaman statis

### 3.2 Template Konten

```typescript
description: "Kalimat 1: Lokasi + daya tarik utama.
            Kalimat 2: Detail tambahan (suasana, aktivitas, keunikan)."

whySpecial: "Kenapa ini wajib dikunjungi?
             Fakta unik atau record yang membedakan dari tempat lain."
```

### 3.3 Sumber Riset Gratis

| Sumber | Data | Biaya |
|--------|------|-------|
| Google Maps | Jam buka, harga, rating, foto, review | Gratis (manual) |
| Wikipedia | Deskripsi, sejarah, koordinat | Gratis (API) |
| Blog Travel | Tips, pengalaman, harga terkini | Gratis (manual) |
| Instagram | Tags, hashtag, foto terkini | Gratis (manual) |
| Google Trends | Popularitas destinasi | Gratis |

---

## 4. Proactive Research Workflow

Kita tentukan target spots, riset sendiri, dan publish — tanpa menunggu submission dari community.

### 4.1 Target-Based Collection

| Step | Activity | Tools | Output |
|------|----------|-------|--------|
| 1. **Identify** | Cari destinasi populer per region | Google Trends, Instagram, TikTok, travel blogs | List 25-50 nama spots |
| 2. **Research** | Kumpulkan data mentah | Google Maps, Wikipedia, blog travel | Data mentah per spot |
| 3. **Enrich** | Auto-fill dengan Python script | OSM Overpass API + Wikipedia API | Koordinat, jam buka, deskripsi |
| 4. **Verify** | Cek akurasi data | Google Maps (manual cross-check) | Data terverifikasi |
| 5. **Write** | Tulis deskripsi + tips final | Manual editing | Konten berkualitas |
| 6. **Publish** | Input ke `spots.ts` + build | `npm run build` | Halaman statis live |

### 4.2 Target Region Priority

| Phase | Region | Target Spots | Timeline |
|-------|--------|--------------|----------|
| 1 | Jawa Barat (Bandung, Bogor, Cianjur, Garut) | 25 spots | ✅ Done (existing) |
| 2 | Jawa Barat (Pangandaran, Sukabumi, Cirebon) | +25 spots | Week 2-3 |
| 3 | Jawa Timur (Surabaya, Malang, Bromo, Ijen) | 25 spots | Week 4-6 |
| 4 | Bali & Nusa Tenggara | 25 spots | Month 2 |
| 5 | Sumatera, Sulawesi, Kalimantan | 25 spots | Month 3+ |

### 4.3 Sumber Riset Harian

| Sumber | Data | Biaya | Frekuensi |
|--------|------|-------|-----------|
| Google Maps | Jam buka, harga, rating, foto, review, koordinat | Gratis (manual) | Per batch |
| Wikipedia (API) | Deskripsi, sejarah, fakta unik | Gratis (API) | Per batch |
| Google Trends | Popularitas destinasi per region | Gratis | Mingguan |
| Instagram | Spot foto trending, hashtag, tags | Gratis (manual) | Mingguan |
| TikTok | Review viral, rekomendasi terbaru | Gratis (manual) | Mingguan |
| Blog Travel | Tips, pengalaman, harga terkini | Gratis (manual) | Per batch |

### 4.4 Quality Standards

Setiap spot harus memenuhi standar berikut sebelum publish:

- ✅ Koordinat akurat (max 10m error — verifikasi Google Maps)
- ✅ Jam buka update (cek Google Maps, bukan asumsi)
- ✅ Harga tiket valid (verifikasi Google Maps / sumber terpercaya)
- ✅ Deskripsi minimal 50 karakter, informatif
- ✅ Tips praktis (berdasarkan pengalaman visitor, bukan generic)
- ✅ Foto resolusi 800px, landscape orientation
- ✅ Slug unik (format: `nama-tempat-lokasi`)

### 4.5 Workflow per Batch (25 spots)

```
Day 1: Research — kumpulkan 25 nama spots (Google Maps + travel blogs)
Day 2-3: Enrich — jalankan Python script (OSM + Wikipedia)
Day 4: Verify — cross-check semua data di Google Maps
Day 5: Write — tulis deskripsi final, tips, whySpecial
Day 6: Photos — download/collect foto, resize 800px
Day 7: Publish — input ke spots.ts → build → deploy
```

> **Estimasi total per batch:** 1 minggu untuk 25 spots (setelah script setup selesai).

---

## 5. OpenStreetMap Overpass API

### 5.1 Overview

OpenStreetMap (OSM) adalah database geografis gratis dan open-source. Overpass API memungkinkan query data POI secara terstruktur. Cocok untuk mengambil data koordinat, jam buka, fasilitas, dan rating.

**Endpoint:** `https://overpass-api.de/api/interpreter`

### 5.2 Query Examples

#### Cari SPBU di Bandung:
```overpass
[out:json];
node
  ["amenity"="fuel"]
  ["name"~"pertamina",i]
  (area:searchArea);
out body 10;
```

#### Cari Restoran di Yogyakarta:
```overpass
[out:json];
node
  ["amenity"="restaurant"]
  (area:searchArea);
out body 20;
```

#### Cari Tempat Wisata Alam di Jawa Barat:
```overpass
[out:json];
(
  node["tourism"="attraction"](area:searchArea);
  node["leisure"="nature_reserve"](area:searchArea);
  node["waterway"="waterfall"](area:searchArea);
);
out body 15;
```

### 5.3 Python Script: Enrichment Pipeline

```python
import requests
import json

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

def enrich_spot(name: str, lat: float, lng: float) -> dict:
    """Enrich spot data from OSM."""
    query = f"""
    [out:json];
    (
      node(around:100,{lat},{lng});
      way(around:100,{lat},{lng});
    );
    out body 5;
    """
    resp = requests.get(OVERPASS_URL, params={"data": query},
                        timeout=15)

    elements = resp.json().get("elements", [])
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

# Contoh penggunaan
result = enrich_spot("Kawah Putih", -7.1660, 107.4042)
print(result)
```

### 5.4 Python Script: Bulk Search by Category

```python
import requests
import time

def search_poi_by_category(category: str, lat: float, lng: float,
                           radius: int = 50000):
    """Search POI by category around a location."""
    osm_tags = {
        "kuliner": '["amenity"="restaurant"]',
        "alam": '["tourism"="attraction"]["natural"]',
        "budaya": '["tourism"="museum"]',
        "spbu": '["amenity"="fuel"]',
        "bengkel": '["amenity"="car_repair"]',
    }
    tag_query = osm_tags.get(category, '["tourism"="attraction"]')

    query = f"""
    [out:json];
    node{tag_query}(around:{radius},{lat},{lng});
    out body 20;
    """
    resp = requests.get("https://overpass-api.de/api/interpreter",
                        params={"data": query})
    time.sleep(2)  # Rate limiting
    return resp.json().get("elements", [])

# Contoh: cari kuliner di sekitar Borobudur
spots = search_poi_by_category("kuliner", -7.6079, 110.2038)
for s in spots[:5]:
    name = s.get('tags', {}).get('name', '-')
    print(name)
```

> **Rate Limit:** Overpass API gratis, maksimal ~10 request per menit. Gunakan caching untuk production.

---

## 6. Wikipedia API

### 6.1 Overview

Wikipedia API gratis, tanpa rate limit ketat. Cocok untuk mengambil deskripsi, sejarah, dan fakta unik dari spot.

**Endpoint:** `https://id.wikipedia.org/w/api.php` (gunakan bahasa Indonesia)

### 6.2 Python Script: Fetch Description

```python
import requests

WIKI_API = "https://id.wikipedia.org/w/api.php"

def fetch_wikipedia_description(spot_name: str) -> dict:
    """Fetch description from Wikipedia Indonesia."""
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
    resp = requests.get(WIKI_API, params=params, timeout=10)
    data = resp.json()
    pages = data.get("query", {}).get("pages", {})

    for page_id, page in pages.items():
        if page_id == "-1":
            continue  # Page not found
        coords = page.get("coordinates", [{}])[0] if page.get("coordinates") else None
        return {
            "description": page.get("extract", ""),
            "coordinates": {"lat": coords["lat"], "lng": coords["lon"]} if coords else None,
            "thumbnail": page.get("thumbnail", {}).get("source", ""),
        }
    return {}

# Contoh: ambil deskripsi Borobudur
result = fetch_wikipedia_description("Candi Borobudur")
print(result["description"][:200])
```

### 6.3 Extract "Why Special" dari Wikipedia

```python
import re

def extract_why_special(description: str) -> str:
    """Extract key facts from Wikipedia description."""
    keywords = [
        "terbesar", "tertinggi", "tertua", "satu-satunya",
        "terbaik", "terkenal", "ikon", "warisan dunia",
        "terindah", "legendaris"
    ]
    sentences = re.split(r'(?<=[.!?])\s+', description)
    special = []
    for s in sentences:
        for kw in keywords:
            if kw in s.lower() and len(s) > 20:
                special.append(s.strip())
                break
    return " ".join(special[:3]) if special else description[:200]
```

---

## 7. Web Scraping (Opsional)

> **⚠️ Legal Disclaimer:** Scraping website bisa melanggar Terms of Service. Lakukan dengan bijak dan hormati `robots.txt`. Gunakan hanya untuk data publik dan rate limit yang wajar.

### 7.1 Target Websites

| Website | Data | Risiko | Notes |
|---------|------|--------|-------|
| Traveloka Blog | Destinasi, tips | Rendah | Content blog publik |
| Pergi.com | Destinasi, harga | Rendah | Public info |
| Wikipedia | Deskripsi | Tidak ada | API resmi tersedia ✅ |
| Google Maps | Rating, jam buka | Tinggi | Gunakan Places API |
| Instagram | Foto, tags | Tinggi | ToS violation risk |

### 7.2 Scraping dengan Python

```python
import requests
from bs4 import BeautifulSoup

def scrape_blog_articles(url: str) -> list:
    """Scrape travel blog articles."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    }
    resp = requests.get(url, headers=headers, timeout=10)
    soup = BeautifulSoup(resp.text, 'html.parser')

    articles = []
    for article in soup.select('article')[:5]:
        title = article.select_one('h2, h3')
        desc = article.select_one('p')
        if title:
            articles.append({
                'title': title.get_text(strip=True),
                'snippet': desc.get_text(strip=True) if desc else '',
            })
    return articles
```

### 7.3 Best Practices

- **Rate limit:** Max 1 request per 3 detik
- **User-Agent:** Gunakan identitas yang jelas
- **Robots.txt:** Cek `/robots.txt` sebelum scraping
- **Cache:** Simpan hasil scraping, jangan scrape ulang
- **Attribution:** Kredit sumber jika diperlukan

---

## 8. Pipeline Automation

### 8.1 Full Enrichment Script

```python
import requests
import json
import time
import re

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
WIKI_API = "https://id.wikipedia.org/w/api.php"
HEADERS = {
    "User-Agent": "Gaskuy/1.0 (+https://gaskuy.id) Python/3.13",
    "Accept": "application/json",
}

def enrich_spot(name: str, lat: float, lng: float) -> dict:
    """Full enrichment pipeline: OSM + Wikipedia."""
    result = {"name": name, "lat": lat, "lng": lng}

    # 1. OSM Enrichment
    query = f"[out:json];node(around:50,{lat},{lng});out body 5;"
    try:
        resp = requests.post(OVERPASS_URL, data={"data": query}, headers=HEADERS, timeout=10)
        elements = resp.json().get("elements", [])
        if elements:
            tags = elements[0].get("tags", {})
            result["opening_hours"] = tags.get("opening_hours", "")
            result["phone"] = tags.get("phone", "")
            result["website"] = tags.get("website", "")
    except Exception as e:
        print(f"  OSM error: {e}")
    time.sleep(2)  # Rate limit

    # 2. Wikipedia Enrichment
    params = {
        "action": "query", "format": "json",
        "titles": name, "prop": "extracts|coordinates",
        "exintro": True, "explaintext": True, "exsentences": 5,
    }
    try:
        resp = requests.get(WIKI_API, params=params, headers=HEADERS, timeout=10)
        pages = resp.json().get("query", {}).get("pages", {})
        for pid, page in pages.items():
            if pid != "-1":
                result["wikipedia_desc"] = page.get("extract", "")
                coords = page.get("coordinates", [{}])[0]
                if coords:
                    result["wiki_lat"] = coords.get("lat")
                    result["wiki_lng"] = coords.get("lon")
    except Exception as e:
        print(f"  Wiki error: {e}")

    return result

# --- BATCH PROCESS ---
SPOTS = [
    {"name": "Kawah Putih", "lat": -7.1660, "lng": 107.4042},
    {"name": "Candi Borobudur", "lat": -7.6079, "lng": 110.2038},
    {"name": "Gunung Bromo", "lat": -7.9425, "lng": 112.9530},
]

for spot in SPOTS:
    print(f"Enriching: {spot['name']}...")
    data = enrich_spot(spot["name"], spot["lat"], spot["lng"])
    print(json.dumps(data, indent=2))
    print("---")
```

### 8.2 Automation Workflow

```
Weekly Batch Script:
  1. Identify 10-20 new spots (target region: Jawa Barat)
  2. Run Python enrichment script (OSM + Wikipedia)
  3. Manual review & edit (QC)
  4. Generate draft spots.ts entries
  5. npm run build & verify (36+ pages)
  6. Manual git commit & push
```

> **Schedule:** Setiap Senin pagi, batch process 10-20 spots baru. Estimasi: 30-60 menit total (setelah enrichment script selesai).

---

## 9. Implementation Roadmap

### Phase 1: Launch (Sekarang ✅)

| Task | Status | Effort |
|------|--------|--------|
| 25 spots manual curation | ✅ Done | 1 minggu |
| Halaman listing + detail | ✅ Done | 2 hari |
| Region filter | ✅ Done | - |
| Rute Populer integration | ✅ Done | - |

### Phase 2: Jawa Barat Expansion (Minggu 2-4)

| Task | Effort | Priority |
|------|--------|----------|
| Python enrichment script setup (OSM + Wikipedia) | 2-3 hari | 🔥 High |
| Bulk enrich 25 spots existing (auto-fill data) | 1 hari | 🔥 High |
| Riset 25 spots baru (Jawa Barat: Pangandaran, Sukabumi, Cirebon, Garut) | 2 hari | 🔥 High |
| Manual review & QC (verifikasi Google Maps) | 2-3 jam | ⚡ Medium |
| Foto spesifik per spot (download + resize 800px) | 2 hari | 📸 Medium |
| Input ke spots.ts + build (50+ pages) | 1 hari | ✅ High |

### Phase 3: Scale (Bulan 2+)

| Task | Effort | Priority |
|------|--------|----------|
| Expand ke Jawa Timur (25 spots) | 1 minggu | 🔥 High |
| Expand ke Bali & Nusa Tenggara (25 spots) | 1 minggu | ⚡ Medium |
| Setup Supabase + backend database | 1 minggu | 📊 High |
| Build admin panel for data management | 1 minggu | 🛠️ Medium |
| 100+ spots total in database | 2 minggu | 🎯 High |

---

## 10. Maintenance Guide

### 10.1 Weekly Workflow Checklist

- [ ] Identify 10-20 new spots (target region: Jawa Barat)
- [ ] Run Python enrichment script (OSM + Wikipedia)
- [ ] Validate: cek koordinat, jam buka, harga via Google Maps
- [ ] Tulis deskripsi final (1-2 paragraf)
- [ ] Download foto dari Unsplash/Google Maps (800px, landscape)
- [ ] Update `src/data/spots.ts`
- [ ] `npm run build`
- [ ] Verify: buka localhost, cek 3-5 halaman random
- [ ] Git commit & push
- [ ] Deploy

### 10.2 Quality Control Checklist

- ✅ Nama tempat sesuai ejaan yang benar
- ✅ Koordinat akurat (cek di Google Maps)
- ✅ Deskripsi minimal 50 karakter, informatif
- ✅ Tips praktis, bukan generic
- ✅ Harga tiket update (cek bulan ini)
- ✅ Jam buka valid (cek Google Maps)
- ✅ Foto tidak pecah/blur
- ✅ Slug unik, tanpa duplikasi
- ✅ Build success (36+ pages)

### 10.3 Troubleshooting

| Masalah | Cause | Solution |
|---------|-------|----------|
| Image not found (404) | File tidak ada di `/public/images/spots/` | Cek path, download ulang dari Unsplash |
| Build error: duplicate key | Slug tidak unique | Gunakan slug generator: nama + lokasi |
| OSM API timeout | Rate limit exceeded | Tambahkan `sleep(3)` antar request |
| Wikipedia page not found | Judul berbeda di Wikipedia | Coba alternatif: "Kawah Putih" → "Kawah Putih Ciwidey" |
| Foto terlalu besar | Resolusi > 800px | Resize: `convert -resize 800x input.jpg output.jpg` |

---

## Lampiran A — Data Schema

```typescript
interface Spot {
  slug: string
  name: string
  category: "alam" | "kuliner" | "budaya" | "foto" | "petualangan" | "sejarah"
  province: string
  region: string
  location: { lat: number; lng: number }
  description: string
  whySpecial: string
  rating: number
  imageUrl: string
  imageCredit: string
  tags: string[]
  addedAt: Date
  tips: string
  bestTime: string
  openingHours: string
  estimatedTime: string
  ticketPrice: string
  roadAccess: string
  facilities: string[]
  distanceFromCity: string
  popularRoutes?: { from: string; duration: string }[]
  relatedProductIds?: string[]
}

type SpotCategory = "alam" | "kuliner" | "budaya" | "foto" | "petualangan" | "sejarah"

// Category config
const SPOT_CATEGORIES = {
  alam:        { label: "Alam",        icon: "🏞️", color: "emerald" },
  kuliner:     { label: "Kuliner",     icon: "🍜", color: "orange" },
  budaya:      { label: "Budaya",      icon: "🏛️", color: "purple" },
  foto:        { label: "Spot Foto",   icon: "📸", color: "pink" },
  petualangan: { label: "Petualangan", icon: "🧗", color: "blue" },
  sejarah:     { label: "Sejarah",     icon: "📜", color: "amber" },
}
```

---

## Lampiran B — Province-to-City Mapping

```typescript
const PROVINCE_ROUTES: Record<string, string[]> = {
  "Jakarta":        ["Jakarta", "Bandung"],
  "Jawa Barat":     ["Jakarta", "Bandung", "Bogor"],
  "Jawa Tengah":    ["Yogyakarta", "Semarang", "Solo"],
  "DIY":            ["Yogyakarta", "Semarang", "Solo"],
  "Jawa Timur":     ["Surabaya", "Malang"],
  "Bali":           ["Denpasar", "Canggu", "Kuta"],
  "Nusa Tenggara Barat":  ["Mataram", "Lombok Airport"],
  "Nusa Tenggara Timur":  ["Labuan Bajo"],
  "Sumatera Utara":  ["Medan"],
  "Sumatera Barat":  ["Padang", "Medan"],
  "Sulawesi Utara":  ["Manado"],
  "Sulawesi Selatan": ["Makassar"],
  "Kalimantan Timur": ["Balikpapan", "Tanjung Redeb"],
}
```

---

## Lampiran C — API Quotas & Limits

| API | Free Quota | Rate Limit | Notes |
|-----|------------|------------|-------|
| Overpass API | Unlimited | ~10 req/min | Turun drastis kalo overload |
| Wikipedia API | Unlimited | ~200 req/min | Fair use, jangan abuse |
| Google Places API | $200 credit/bln | ~180 req/min | Pilih yang gratis dulu |
| Unsplash API | 50 req/jam | 50 req/jam | Hanya untuk search, download unlimited |
| OSM Nominatim | Unlimited | 1 req/dtk | Gunakan User-Agent yang jelas |

---

## Lampiran D — Jawa Barat Target List

### D.1 Target Region & Spots Potensial

Jawa Barat dipilih sebagai fokus pertama karena:
- Dekat Jakarta (target market utama)
- Infrastruktur jalan terbaik di Indonesia
- Destinasi roadtrip terbanyak & variatif
- 25 spots existing sudah mencakup beberapa area

### D.2 Target Area per Kabupaten/Kota

| Region | Jenis Spot | Jumlah Target | Priority |
|--------|-----------|---------------|----------|
| **Bandung Raya** (Bandung, Lembang, Dago) | Alam, Kuliner, Spot Foto | 10 spots | 🔥 High |
| **Bogor & Puncak** (Cisarua, Megamendung) | Alam, Petualangan, Kuliner | 8 spots | 🔥 High |
| **Cianjur** (Kawasan Puncak, Cipanas) | Alam, Sejarah, Kuliner | 5 spots | 🔥 High |
| **Garut** (Cipanas, Pantai Santolo) | Alam, Kuliner, Petualangan | 5 spots | ⚡ Medium |
| **Pangandaran** (Pantai, Green Canyon) | Alam, Petualangan | 5 spots | ⚡ Medium |
| **Sukabumi** (Geopark, Ujung Genteng) | Alam, Petualangan | 5 spots | ⚡ Medium |
| **Cirebon** (Kota, Batik, Kuliner) | Kuliner, Sejarah, Budaya | 5 spots | 📸 Medium |
| **Tasikmalaya** (Kota, Pantai) | Kuliner, Alam | 3 spots | 📸 Medium |
| **Subang** (Ciater, Sari Ater) | Alam, Petualangan | 2 spots | 📸 Low |
| **Karawang** (Kuliner, UMKM) | Kuliner | 2 spots | 📸 Low |
| **Total** | | **~50 spots** | |

### D.3 Contoh Spot Potensial per Kategori

**Alam (15 spots):**
- Kawah Putih Ciwidey
- Gunung Tangkuban Perahu
- Pantai Pangandaran
- Green Canyon Cijulang
- Curug Cimahi
- Tebing Keraton
- Kawah Rengganis
- Pantai Karanghawu
- Situ Patenggang
- Curug Cilember
- Taman Safari Bogor
- Gunung Papandayan
- Pantai Batu Karas
- Cagar Alam Kamojang
- Pantai Pelabuhan Ratu

**Kuliner (12 spots):**
- Sate Maranggi Cianjur
- Nasi Timbel Gunung Agung
- Batagor Kingsley
- Mie Kocok Mang Dadeng
- Kupat Glabet
- Nasi Tutug Oncom
- Bandros Lembang
- Cireng Bojot
- Colenak Pak Edi
- Surabi Imut
- Soto Kuning Bogor
- Empal Gentong Cirebon

**Petualangan (8 spots):**
- Arung Jeram Citra Alam
- Paralayang Bukit Bintang
- ATV Gunung Padang
- Trekking Kawah Putih
- Camping Gunung Pancar
- Flying Fish Puncak
- Paintball Dago
- Rafting Cikandang

**Spot Foto (8 spots):**
- Bukit Bintang
- Tebing Keraton
- Jalan Braga
- Alun-Alun Bandung
- Kebun Teh Walini
- Orchid Forest Cikole
- Jembatan Pasupati
- Rainbow Garden Lembang

**Sejarah/Budaya (7 spots):**
- Gedung Sate
- Museum Geologi Bandung
- Keraton Kacirebonan
- Stasiun Bogor
- Goa Sunyaragi
- Kampung Naga
- Makam Keramat Cianjur

### D.4 Distribution Strategy

| Batch | Area | Jumlah | Timeline |
|-------|------|--------|----------|
| Batch 1 ✅ | Existing (mix Jawa Barat) | 25 spots | Done |
| Batch 2 | Bandung Raya + Lembang | 10 spots | Minggu 2 |
| Batch 3 | Bogor, Puncak, Cianjur | 10 spots | Minggu 3 |
| Batch 4 | Garut, Tasikmalaya, Pangandaran | 10 spots | Minggu 3-4 |
| Batch 5 | Sukabumi, Subang, Karawang | 10 spots | Minggu 4 |
| Batch 6 | Cirebon + Indramayu | 10 spots | Minggu 5 |

**Target final:** 50-75 spots Jawa Barat dalam 1 bulan

---

*Dokumen ini dibuat untuk proyek Gaskuy — Spot Istimewa — 2026*

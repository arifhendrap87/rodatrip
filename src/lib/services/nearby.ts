import type { NearbyPlace } from "@/lib/validators/nearby"

const OVERPASS_URL = "https://overpass-api.de/api/interpreter"
const TIMEOUT = 15

const CATEGORY_QUERIES: Record<string, string> = {
  hotel: `[out:json][timeout:TIMEOUT];(node["tourism"="hotel"](around:RADIUS,LAT,LNG);way["tourism"="hotel"](around:RADIUS,LAT,LNG);node["tourism"="motel"](around:RADIUS,LAT,LNG);way["tourism"="motel"](around:RADIUS,LAT,LNG);node["tourism"="hostel"](around:RADIUS,LAT,LNG);node["tourism"="guest_house"](around:RADIUS,LAT,LNG););out center body;`,
  restaurant: `[out:json][timeout:TIMEOUT];(node["amenity"="restaurant"](around:RADIUS,LAT,LNG);node["amenity"="cafe"](around:RADIUS,LAT,LNG);node["amenity"="fast_food"](around:RADIUS,LAT,LNG););out body;`,
  fuel: `[out:json][timeout:TIMEOUT];(node["amenity"="fuel"](around:RADIUS,LAT,LNG););out body;`,
  parking: `[out:json][timeout:TIMEOUT];(node["amenity"="parking"](around:RADIUS,LAT,LNG););out body;`,
  hospital: `[out:json][timeout:TIMEOUT];(node["amenity"="hospital"](around:RADIUS,LAT,LNG);node["amenity"="clinic"](around:RADIUS,LAT,LNG););out body;`,
  pharmacy: `[out:json][timeout:TIMEOUT];(node["amenity"="pharmacy"](around:RADIUS,LAT,LNG););out body;`,
  atm: `[out:json][timeout:TIMEOUT];(node["amenity"="atm"](around:RADIUS,LAT,LNG);node["amenity"="bank"](around:RADIUS,LAT,LNG););out body;`,
  mosque: `[out:json][timeout:TIMEOUT];(node["amenity"="place_of_worship"]["religion"="muslim"](around:RADIUS,LAT,LNG););out body;`,
  attraction: `[out:json][timeout:TIMEOUT];(node["tourism"="attraction"](around:RADIUS,LAT,LNG);node["tourism"="museum"](around:RADIUS,LAT,LNG);node["tourism"="viewpoint"](around:RADIUS,LAT,LNG););out body;`,
  all: `[out:json][timeout:TIMEOUT];(node["tourism"="hotel"](around:RADIUS,LAT,LNG);node["tourism"="guest_house"](around:RADIUS,LAT,LNG);node["amenity"="restaurant"](around:RADIUS,LAT,LNG);node["amenity"="cafe"](around:RADIUS,LAT,LNG);node["amenity"="fuel"](around:RADIUS,LAT,LNG);node["amenity"="parking"](around:RADIUS,LAT,LNG);node["amenity"="hospital"](around:RADIUS,LAT,LNG);node["amenity"="pharmacy"](around:RADIUS,LAT,LNG);node["amenity"="atm"](around:RADIUS,LAT,LNG);node["amenity"="place_of_worship"](around:RADIUS,LAT,LNG);node["tourism"="attraction"](around:RADIUS,LAT,LNG););out body;`,
}

function buildQuery(category: string, lat: number, lng: number, radius: number): string {
  const template = CATEGORY_QUERIES[category] || CATEGORY_QUERIES.all
  return template
    .replace(/LAT/g, String(lat))
    .replace(/LNG/g, String(lng))
    .replace(/RADIUS/g, String(radius))
    .replace(/TIMEOUT/g, String(TIMEOUT))
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

function parseStars(tags: Record<string, string>): number | null {
  if (tags.stars) {
    const s = parseInt(tags.stars, 10)
    if (!isNaN(s) && s >= 1 && s <= 5) return s
  }
  return null
}

function parseName(tags: Record<string, string>): string {
  return tags.name || tags["name:id"] || tags.brand || "Unknown"
}

function parseAddress(tags: Record<string, string>): string | null {
  const parts = [tags["addr:full"] || tags["addr:street"], tags["addr:city"]].filter(Boolean)
  return parts.length > 0 ? parts.join(", ") : null
}

function inferCategory(tags: Record<string, string>): string {
  if (tags.tourism === "hotel") return "hotel"
  if (tags.tourism === "motel") return "hotel"
  if (tags.tourism === "hostel") return "hotel"
  if (tags.tourism === "guest_house") return "hotel"
  if (tags.amenity === "restaurant" || tags.amenity === "cafe" || tags.amenity === "fast_food") return "restaurant"
  if (tags.amenity === "fuel") return "fuel"
  if (tags.amenity === "parking") return "parking"
  if (tags.amenity === "hospital" || tags.amenity === "clinic") return "hospital"
  if (tags.amenity === "pharmacy") return "pharmacy"
  if (tags.amenity === "atm" || tags.amenity === "bank") return "atm"
  if (tags.amenity === "place_of_worship") return "mosque"
  if (tags.tourism === "attraction" || tags.tourism === "museum" || tags.tourism === "viewpoint") return "attraction"
  return "other"
}

export async function queryNearbyPlaces(
  category: string,
  lat: number,
  lng: number,
  radius: number,
  limit: number
): Promise<NearbyPlace[]> {
  const query = buildQuery(category, lat, lng, radius)
  const body = `data=${encodeURIComponent(query)}`

  let raw: string
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT * 1000)

    const response = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "*/*",
      },
      body,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    raw = await response.text()
  } catch {
    return []
  }

  const data = JSON.parse(raw) as { elements: Array<{
    id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }
    tags?: Record<string, string>
  }> }

  const places: NearbyPlace[] = []

  for (const element of data.elements) {
    const elemLat = element.lat ?? element.center?.lat
    const elemLng = element.lon ?? element.center?.lon
    if (elemLat == null || elemLng == null) continue

    const tags = element.tags || {}
    const name = parseName(tags)
    if (!name || name === "Unknown") continue

    const distance = haversineDistance(lat, lng, elemLat, elemLng)

    places.push({
      id: element.id,
      name,
      category: inferCategory(tags),
      lat: elemLat,
      lng: elemLng,
      distance,
      address: parseAddress(tags),
      phone: tags.phone || null,
      website: tags.website || null,
      stars: parseStars(tags),
      tags,
    })
  }

  places.sort((a, b) => a.distance - b.distance)
  return places.slice(0, limit)
}

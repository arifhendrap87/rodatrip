import { db } from "@/lib/services/db"
import { parseLocation } from "./location"

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export interface DuplicateSpotResult {
  slug: string
  name: string
  distance: number
  matchType: "exact_slug" | "name_similar" | "coord_nearby" | "both"
}

export async function findDuplicateSpot(
  name: string,
  lat?: number,
  lng?: number,
  excludeSlug?: string
): Promise<DuplicateSpotResult | null> {
  if (!name) return null

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

  // 1. Cek exact slug
  const { data: exactMatch } = await db
    .from("spots")
    .select("slug, name, location")
    .eq("slug", slug)
    .maybeSingle()

  if (exactMatch && excludeSlug !== exactMatch.slug) {
    const parsed = parseLocation(exactMatch.location)
    const dist = parsed && lat && lng ? haversine(lat, lng, parsed.lat, parsed.lng) : 0
    return { slug: exactMatch.slug, name: exactMatch.name, distance: Math.round(dist * 1000) / 1000, matchType: "exact_slug" }
  }

  // 2. Ambil keywords untuk cari nama mirip
  const keywords = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((k) => k.length > 3)

  if (keywords.length === 0) return null

  const { data: similar } = await db
    .from("spots")
    .select("slug, name, location")
    .or(keywords.map((k) => `name.ilike.%${k}%`).join(","))
    .limit(10)

  if (!similar || similar.length === 0) return null

  let bestMatch: DuplicateSpotResult | null = null

  for (const spot of similar) {
    if (excludeSlug && spot.slug === excludeSlug) continue

    const parsed = parseLocation(spot.location)
    const dist = parsed && lat && lng ? haversine(lat, lng, parsed.lat, parsed.lng) : Infinity
    const nameSim = nameSimilarity(name.toLowerCase(), spot.name.toLowerCase())

    // Name similar + coord nearby = confirmed duplicate
    if (nameSim > 0.4 && dist < 1) {
      return { slug: spot.slug, name: spot.name, distance: Math.round(dist * 1000) / 1000, matchType: "both" }
    }

    // Coord very close even if name different
    if (lat && lng && parsed && dist < 0.3) {
      if (!bestMatch || dist < bestMatch.distance) {
        bestMatch = { slug: spot.slug, name: spot.name, distance: Math.round(dist * 1000) / 1000, matchType: "coord_nearby" }
      }
    }

    // Name very similar even without coord
    if (nameSim > 0.6 && !bestMatch) {
      bestMatch = { slug: spot.slug, name: spot.name, distance: Math.round(dist * 1000) / 1000, matchType: "name_similar" }
    }
  }

  return bestMatch
}

function nameSimilarity(a: string, b: string): number {
  const aWords = a.split(/\s+/).filter(Boolean)
  const bWords = b.split(/\s+/).filter(Boolean)
  if (aWords.length === 0 || bWords.length === 0) return 0

  // Jika kata terpanjang tidak cocok di kedua nama → bukan duplicate
  const longestInA = [...aWords].sort((x, y) => y.length - x.length)[0]
  const longestInB = [...bWords].sort((x, y) => y.length - x.length)[0]
  const longestWord = longestInA.length >= longestInB.length ? longestInA : longestInB
  if (!aWords.includes(longestWord) || !bWords.includes(longestWord)) {
    return 0
  }

  const matches = aWords.filter((w) => bWords.includes(w)).length
  return matches / Math.max(aWords.length, bWords.length)
}

import { success, internalError } from "@/lib/api/response"
import { db } from "@/lib/services/db"

export async function GET() {
  try {
    const { data: itineraries } = await db
      .from("itineraries")
      .select("id")
      .eq("is_published", true)

    if (!itineraries || itineraries.length === 0) return success({ provinces: [], cities: {} })

    const ids = itineraries.map((r: any) => r.id)

    const { data: stops } = await db
      .from("itinerary_stops")
      .select("spot:spots!inner(slug, province, city)")
      .in("itinerary_id", ids)

    if (!stops) return success({ provinces: [], cities: {} })

    const stopSpots = stops as unknown as { spot: { slug: string; province: string; city: string } }[]
    const provinces = [...new Set(stopSpots.map((s) => s.spot?.province).filter(Boolean))].sort() as string[]

    const cities: Record<string, string[]> = {}
    for (const s of stopSpots) {
      const p = s.spot?.province
      const c = s.spot?.city
      if (p && c) {
        if (!cities[p]) cities[p] = []
        if (!cities[p].includes(c)) cities[p].push(c)
      }
    }
    for (const p of Object.keys(cities)) cities[p].sort()

    return success({ provinces, cities })
  } catch {
    return success({ provinces: [], cities: {} })
  }
}

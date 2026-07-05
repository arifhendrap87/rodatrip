import { success, rateLimited } from "@/lib/api/response"
import { publicLimiter } from "@/lib/api/rate-limit"
import { db } from "@/lib/services/db"
import { getItineraries } from "@/lib/services/itineraries"

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = await publicLimiter(`itineraries:${ip}`)
  if (!allowed) return rateLimited(30)

  const { searchParams } = new URL(request.url)
  const province = searchParams.get("province")
  const city = searchParams.get("city")
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100)
  const offset = Number(searchParams.get("offset")) || 0

  try {
    if (province || city) {
      let stopsQuery = db
        .from("itinerary_stops")
        .select("itinerary_id, spot:spots!inner(province, city)")

      if (province) stopsQuery = stopsQuery.eq("spot.province", province) as any
      if (city) stopsQuery = stopsQuery.eq("spot.city", city) as any

      const { data: stops, error } = await stopsQuery
      if (error || !stops || stops.length === 0) return success([])

      const stopRows = stops as unknown as { itinerary_id: string }[]
      const matchingIds = [...new Set(stopRows.map((s) => s.itinerary_id))]
      const result = await getItineraries({ published: true, ids: matchingIds, limit, offset })

      return success(result)
    }

    const itineraries = await getItineraries({ published: true, limit, offset })
    return success(itineraries)
  } catch {
    return success([])
  }
}

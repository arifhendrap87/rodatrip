import { success, badRequest, internalError } from "@/lib/api/response"
import { publicLimiter } from "@/lib/api/rate-limit"
import { db } from "@/lib/services/db"
import { getItineraries } from "@/lib/services/itineraries"

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = await publicLimiter(`itineraries:${ip}`)
  if (!allowed) return success([])

  const { searchParams } = new URL(request.url)
  const province = searchParams.get("province")
  const city = searchParams.get("city")

  try {
    if (province || city) {
      let query = db
        .from("itineraries")
        .select("*")
        .eq("is_published", true)

      const { data: itineraryRows } = await query.order("created_at", { ascending: false })
      if (!itineraryRows || itineraryRows.length === 0) return success([])

      const ids = itineraryRows.map((r: any) => r.id)

      let stopsQuery = db
        .from("itinerary_stops")
        .select("itinerary_id, spot:spots!inner(slug, province, city)")
        .in("itinerary_id", ids)

      if (province) stopsQuery = stopsQuery.eq("spot.province", province)
      if (city) stopsQuery = stopsQuery.eq("spot.city", city)

      const { data: stops } = await stopsQuery
      if (!stops || stops.length === 0) return success([])

      const stopRows = stops as unknown as { itinerary_id: string }[]
      const matchingIds = [...new Set(stopRows.map((s) => s.itinerary_id))]
      const filtered = itineraryRows.filter((r: any) => matchingIds.includes(r.id))
      const fullItineraries = await getItineraries({ published: true })
      const result = fullItineraries.filter((i) => matchingIds.includes(i.id))

      return success(result)
    }

    const itineraries = await getItineraries({ published: true })
    return success(itineraries)
  } catch {
    return success([])
  }
}

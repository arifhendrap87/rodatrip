import { success, notFound } from "@/lib/api/response"
import { getItineraryBySlug } from "@/lib/services/itineraries"
import { db } from "@/lib/services/db"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const itinerary = await getItineraryBySlug(slug)

  if (!itinerary || !itinerary.isPublished) return notFound("Itinerary")

  const enriched = await Promise.all(
    itinerary.stops.map(async (stop) => {
      if (!stop.spotSlug) return stop

      const { data: spot } = await db
        .from("spots")
        .select("category, description, ticket_price, facilities, location")
        .eq("slug", stop.spotSlug)
        .maybeSingle()

      if (!spot) {
        return { ...stop, _err: "not found" }
      }

      const loc = spot.location as Record<string, unknown> | null
      const coords = loc?.coordinates as [number, number] | undefined

      return {
        ...stop,
        category: spot.category,
        description: spot.description || undefined,
        ticketPrice: spot.ticket_price || undefined,
        spotFacilities: spot.facilities || undefined,
        lat: coords?.[1],
        lng: coords?.[0],
        _loc: loc ? JSON.stringify(loc) : null,
      }

      const coords = (spot.location as { type: string; coordinates: [number, number] } | null)?.coordinates

      return {
        ...stop,
        category: spot.category,
        description: spot.description || undefined,
        ticketPrice: spot.ticket_price || undefined,
        spotFacilities: spot.facilities || undefined,
        lat: coords?.[1],
        lng: coords?.[0],
      }
    })
  )

  return success({ ...itinerary, stops: enriched })
}

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

  // Re-join spots in the API route for reliability
  const enriched = await Promise.all(
    itinerary.stops.map(async (stop) => {
      if (!stop.spotSlug) return stop
      const { data: spot } = await db
        .from("spots")
        .select("name, category, description, ticket_price, parking_fee, physical_effort, facilities, location")
        .eq("slug", stop.spotSlug)
        .maybeSingle()
      if (!spot) return stop

      const coords = spot.location?.coordinates
      return {
        ...stop,
        category: spot.category || stop.category,
        description: spot.description || stop.description,
        ticketPrice: spot.ticket_price || stop.ticketPrice,
        parkingFee: spot.parking_fee || stop.parkingFee,
        physicalEffort: spot.physical_effort || stop.physicalEffort,
        spotFacilities: spot.facilities || stop.spotFacilities,
        lat: coords?.[1] ?? stop.lat,
        lng: coords?.[0] ?? stop.lng,
      }
    })
  )

  return success({ ...itinerary, stops: enriched })
}

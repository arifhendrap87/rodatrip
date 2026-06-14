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
        .select("name, category, description, facilities, location, opening_hours, road_access, rating, image_url, nearby_hotels_jsonb, nearby_restaurants_jsonb")
        .eq("slug", stop.spotSlug)
        .maybeSingle()

      if (!spot) {
        return stop
      }

      const locData = spot.location as Record<string, unknown> | null
      const coordsArr = locData?.coordinates as [number, number] | undefined

      return {
        ...stop,
        name: spot.name || stop.name,
        category: spot.category,
        description: spot.description || undefined,
        openingHours: spot.opening_hours || undefined,
        roadAccess: spot.road_access || undefined,
        rating: spot.rating ?? undefined,
        imageUrl: spot.image_url || undefined,
        spotFacilities: spot.facilities || undefined,
        nearbyHotels: (spot.nearby_hotels_jsonb as { name: string; distance?: string; maps_url?: string }[]) || undefined,
        nearbyRestaurants: (spot.nearby_restaurants_jsonb as { name: string; distance?: string; maps_url?: string }[]) || undefined,
        lat: coordsArr?.[1],
        lng: coordsArr?.[0],
      }
    })
  )

  return success({ ...itinerary, stops: enriched })
}

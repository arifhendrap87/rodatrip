import { success, notFound } from "@/lib/api/response"
import { getItineraryBySlug } from "@/lib/services/itineraries"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const itinerary = await getItineraryBySlug(slug)

  if (!itinerary || !itinerary.isPublished) return notFound("Itinerary")
  return success(itinerary)
}

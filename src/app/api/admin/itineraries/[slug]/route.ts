import { success, badRequest, unauthorized, notFound, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { getItineraryBySlug, updateItinerary, deleteItinerary } from "@/lib/services/itineraries"
import { updateItinerarySchema } from "@/lib/validators/itinerary"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { slug } = await params
  const itinerary = await getItineraryBySlug(slug)
  if (!itinerary) return notFound("Itinerary")

  return success(itinerary)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { slug } = await params
  const existing = await getItineraryBySlug(slug)
  if (!existing) return notFound("Itinerary")

  const body = await request.json()
  const parsed = updateItinerarySchema.safeParse(body)
  if (!parsed.success) {
    return badRequest(parsed.error.issues.map(e => e.message).join(", "))
  }

  const result = await updateItinerary(slug, parsed.data)
  if (!result) return internalError("Failed to update itinerary")

  return success(result)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { slug } = await params
  const existing = await getItineraryBySlug(slug)
  if (!existing) return notFound("Itinerary")

  const deleted = await deleteItinerary(slug)
  if (!deleted) return internalError("Failed to delete itinerary")

  return success({ deleted: true })
}

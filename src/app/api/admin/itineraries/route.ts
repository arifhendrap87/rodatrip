import { success, badRequest, unauthorized, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { getItineraries, createItinerary } from "@/lib/services/itineraries"
import { createItinerarySchema } from "@/lib/validators/itinerary"

export async function GET(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const province = searchParams.get("province") || undefined
  const city = searchParams.get("city") || undefined

  try {
    const itineraries = await getItineraries({ province, city })
    return success(itineraries)
  } catch {
    return success([])
  }
}

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const body = await request.json()
  const parsed = createItinerarySchema.safeParse(body)
  if (!parsed.success) {
    return badRequest(parsed.error.issues.map(e => e.message).join(", "))
  }

  const slug = parsed.data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  const result = await createItinerary({ ...parsed.data, slug })
  if (!result) return internalError("Failed to create itinerary")

  return success(result, 201)
}

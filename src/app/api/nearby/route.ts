import { success, rateLimited, badRequest } from "@/lib/api/response"
import { publicLimiter } from "@/lib/api/rate-limit"
import { nearbyQuerySchema } from "@/lib/validators/nearby"
import { queryNearbyPlaces } from "@/lib/services/nearby"

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = await publicLimiter(`nearby:${ip}`)
  if (!allowed) return rateLimited(30)

  const { searchParams } = new URL(request.url)
  const parsed = nearbyQuerySchema.safeParse({
    lat: searchParams.get("lat"),
    lng: searchParams.get("lng"),
    category: searchParams.get("category") || "all",
    radius: searchParams.get("radius") || "5000",
    limit: searchParams.get("limit") || "20",
  })

  if (!parsed.success) {
    return badRequest(parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "))
  }

  const { lat, lng, category, radius, limit } = parsed.data
  const places = await queryNearbyPlaces(category, lat, lng, radius, limit)

  return success({
    category,
    center: { lat, lng },
    radius,
    count: places.length,
    places,
  })
}

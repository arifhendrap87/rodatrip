import { success, badRequest, unauthorized, internalError, rateLimited } from "@/lib/api/response"
import { adminLimiter } from "@/lib/api/rate-limit"
import { getServerAdmin } from "@/lib/api/auth"
import { saveScrapedSpots } from "@/services/scraper"

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = await adminLimiter(`admin-func:${ip}`)
  if (!allowed) return rateLimited(30)

  try {
    const body = await request.json()
    const spots = body?.spots

    if (!Array.isArray(spots) || spots.length === 0) {
      return badRequest("spots array is required and must not be empty")
    }

    const result = await saveScrapedSpots(spots)

    return success(result)
  } catch (err) {
    return internalError((err as Error).message)
  }
}

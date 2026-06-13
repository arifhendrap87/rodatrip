import { success, badRequest, unauthorized, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { scrapeProvince } from "@/services/scraper"

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  try {
    const body = await request.json()
    const province = body?.province

    if (!province || typeof province !== "string") {
      return badRequest("Province is required")
    }

    const result = await scrapeProvince(province)

    return success({
      province: result.province,
      totalFound: result.totalFound,
      new: result.new,
      skipped: result.skipped,
      errors: result.errors,
      noArticle: result.noArticle,
    })
  } catch (err) {
    return internalError((err as Error).message)
  }
}

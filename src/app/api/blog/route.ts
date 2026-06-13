import { success, badRequest } from "@/lib/api/response"
import { publicLimiter } from "@/lib/api/rate-limit"
import { getPosts } from "@/lib/services/blog"

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = await publicLimiter(`blog:${ip}`)
  if (!allowed) return badRequest("Rate limited")

  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category") || undefined
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100)

  try {
    const data = await getPosts({ category, limit })
    return success(data)
  } catch {
    return success([])
  }
}

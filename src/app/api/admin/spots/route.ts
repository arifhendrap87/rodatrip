import { success, unauthorized } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { getSpots } from "@/lib/services/spots"

export async function GET(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category") || undefined
  const province = searchParams.get("province") || undefined
  const city = searchParams.get("city") || undefined
  const search = searchParams.get("search") || undefined
  const sort = searchParams.get("sort") || undefined
  const roadtripId = searchParams.get("roadtrip") || undefined
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100)
  const offset = Number(searchParams.get("offset")) || 0

  const { data, total } = await getSpots({ category, province, city, search, sort, roadtripId, limit, offset })
  return success({ data, pagination: { total, limit, offset, hasMore: (offset + limit) < total } })
}

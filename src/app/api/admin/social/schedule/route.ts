import { success, created, badRequest, unauthorized, internalError, rateLimited } from "@/lib/api/response"
import { adminLimiter } from "@/lib/api/rate-limit"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

export async function GET(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const platform = searchParams.get("platform")
  const scheduledFrom = searchParams.get("scheduled_from")
  const scheduledTo = searchParams.get("scheduled_to")
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
  const offset = parseInt(searchParams.get("offset") || "0")

  let query = db
    .from("scheduled_posts")
    .select("*", { count: "exact" })
    .order("scheduled_at", { ascending: true })

  if (status) query = query.eq("status", status)
  if (platform) query = query.eq("platform", platform)
  if (scheduledFrom) query = query.gte("scheduled_at", scheduledFrom)
  if (scheduledTo) query = query.lte("scheduled_at", scheduledTo)

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) return internalError(error.message)

  return success({
    posts: data || [],
    pagination: {
      total: count || 0,
      limit,
      offset,
      hasMore: (offset + limit) < (count || 0),
    },
  })
}

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = await adminLimiter(`admin-func:${ip}`)
  if (!allowed) return rateLimited(30)

  const body = await request.json()
  const { draft_id, platform, scheduled_at } = body

  if (!draft_id || !platform || !scheduled_at) {
    return badRequest("draft_id, platform, dan scheduled_at wajib diisi")
  }

  const validPlatforms = ["twitter", "instagram", "facebook", "threads"]
  if (!validPlatforms.includes(platform)) {
    return badRequest("platform harus twitter, instagram, facebook, atau threads")
  }

  const { data, error } = await db
    .from("scheduled_posts")
    .insert({
      draft_id,
      platform,
      scheduled_at,
      status: "pending",
      created_by: admin.id,
    })
    .select()
    .single()

  if (error) return internalError(error.message)

  return created(data)
}

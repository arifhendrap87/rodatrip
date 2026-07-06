import { success, paginated, badRequest, unauthorized, conflict, rateLimited } from "@/lib/api/response"
import { publicLimiter, adminLimiter } from "@/lib/api/rate-limit"
import { createSpotSchema } from "@/lib/validators/spot"
import { getServerAdmin } from "@/lib/api/auth"
import { getSpots } from "@/lib/services/spots"
import { db } from "@/lib/services/db"

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = await publicLimiter(`spots:${ip}`)
  if (!allowed) return rateLimited(30)

  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category") || undefined
  const region = searchParams.get("region") || undefined
  const province = searchParams.get("province") || undefined
  const city = searchParams.get("city") || undefined
  const search = searchParams.get("search") || undefined
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100)
  const offset = Number(searchParams.get("offset")) || 0

  try {
    const { data, total } = await getSpots({ category, region, province, city, search, limit, offset })
    return paginated(data, total, limit, offset)
  } catch {
    return paginated([], 0, limit, offset)
  }
}

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = await adminLimiter(`spots:post:${ip}`)
  if (!allowed) return rateLimited(30)

  const body = await request.json()
  const parsed = createSpotSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(", "))

  const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

  const { data: existingSpot } = await db
    .from("spots")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle()

  if (existingSpot) return conflict(`Spot dengan slug "${slug}" sudah ada`)

  // Map camelCase from validator to snake_case for DB
  const { location, ...rest } = parsed.data
  const insertData: Record<string, unknown> = {
    slug,
    location: `POINT(${location.lng} ${location.lat})`,
    ...camelToSnake(rest),
  }

  const { data, error: dbError } = await db
    .from("spots")
    .insert(insertData)
    .select("id, slug, name, created_at")
    .single()

  if (dbError) return new Response(JSON.stringify({ error: { message: dbError.message } }), { status: 500 })

  const { logAudit } = await import("@/lib/api/audit")
  await logAudit({ userId: admin.id, action: "CREATE", entityType: "spots", entityId: data.id, newValue: parsed.data })

  return success(data, 201)
}

function camelToSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const JSONB_SUFFIX_KEYS = new Set(["nearby_hotels", "nearby_restaurants"])
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    result[JSONB_SUFFIX_KEYS.has(snakeKey) ? `${snakeKey}_jsonb` : snakeKey] = value
  }
  return result
}

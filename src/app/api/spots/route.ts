import { success, paginated, badRequest, unauthorized } from "@/lib/api/response"
import { publicLimiter, adminLimiter } from "@/lib/api/rate-limit"
import { createSpotSchema } from "@/lib/validators/spot"
import { getServerAdmin } from "@/lib/api/auth"
import { getSpots } from "@/lib/services/spots"
import { db } from "@/lib/services/db"

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = publicLimiter(`spots:${ip}`)
  if (!allowed) return unauthorized("Rate limited")

  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category") || undefined
  const region = searchParams.get("region") || undefined
  const province = searchParams.get("province") || undefined
  const search = searchParams.get("search") || undefined
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100)
  const offset = Number(searchParams.get("offset")) || 0

  try {
    const { data, total } = await getSpots({ category, region, province, search, limit, offset })
    return paginated(data, total, limit, offset)
  } catch {
    return paginated([], 0, limit, offset)
  }
}

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = adminLimiter(`spots:post:${ip}`)
  if (!allowed) return unauthorized("Rate limited")

  const body = await request.json()
  const parsed = createSpotSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(", "))

  const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

  const { data, error: dbError } = await db
    .from("spots")
    .insert([{ ...parsed.data, slug, location: `POINT(${parsed.data.location.lng} ${parsed.data.location.lat})` }])
    .select("id, slug, name, created_at")
    .single()

  if (dbError) return new Response(JSON.stringify({ error: { message: dbError.message } }), { status: 500 })

  const { logAudit } = await import("@/lib/api/audit")
  await logAudit({ userId: admin.id, action: "CREATE", entityType: "spots", entityId: data.id, newValue: parsed.data })

  return success(data, 201)
}

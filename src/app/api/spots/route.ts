import { createClient } from "@supabase/supabase-js"
import { success, paginated, badRequest, internalError, unauthorized } from "@/lib/api/response"
import { publicLimiter, adminLimiter } from "@/lib/api/rate-limit"
import { createSpotSchema } from "@/lib/validators/spot"
import { getServerAdmin } from "@/lib/api/auth"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = publicLimiter(`spots:${ip}`)
  if (!allowed) return unauthorized("Rate limited")

  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const region = searchParams.get("region")
  const province = searchParams.get("province")
  const search = searchParams.get("search")
  const featured = searchParams.get("featured")
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100)
  const offset = Number(searchParams.get("offset")) || 0

  let query = adminClient.from("spots").select("*", { count: "exact" })

  if (category) query = query.eq("category", category)
  if (region) query = query.eq("region", region)
  if (province) query = query.eq("province", province)
  if (featured === "true") query = query.eq("is_featured", true)
  if (search) query = query.ilike("name", `%${search}%`)

  const { data, count, error: dbError } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (dbError) return internalError(dbError.message)
  return paginated(data || [], count || 0, limit, offset)
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

  const { data, error: dbError } = await adminClient
    .from("spots")
    .insert([{ ...parsed.data, slug, location: `POINT(${parsed.data.location.lng} ${parsed.data.location.lat})` }])
    .select("id, slug, name, created_at")
    .single()

  if (dbError) return internalError(dbError.message)

  const { logAudit } = await import("@/lib/api/audit")
  await logAudit({
    userId: admin.id,
    action: "CREATE",
    entityType: "spots",
    entityId: data.id,
    newValue: parsed.data,
  })

  return success(data, 201)
}

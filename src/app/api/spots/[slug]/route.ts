import { createClient } from "@supabase/supabase-js"
import { success, notFound, badRequest, internalError, unauthorized } from "@/lib/api/response"
import { adminLimiter } from "@/lib/api/rate-limit"
import { updateSpotSchema } from "@/lib/validators/spot"
import { getServerAdmin } from "@/lib/api/auth"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data, error: dbError } = await adminClient
    .from("spots")
    .select("*")
    .eq("slug", slug)
    .single()

  if (dbError || !data) return notFound("Spot")
  return success(data)
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = adminLimiter(`spots:put:${ip}`)
  if (!allowed) return unauthorized("Rate limited")

  const { slug } = await params
  const body = await request.json()
  const parsed = updateSpotSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(", "))

  const updateData: Record<string, unknown> = { ...parsed.data }
  if (parsed.data.location) {
    updateData.location = `POINT(${parsed.data.location.lng} ${parsed.data.location.lat})`
  }

  const { data, error: dbError } = await adminClient
    .from("spots")
    .update(updateData)
    .eq("slug", slug)
    .select("id, slug, updated_at")
    .single()

  if (dbError) return internalError(dbError.message)

  const { logAudit } = await import("@/lib/api/audit")
  await logAudit({
    userId: admin.id,
    action: "UPDATE",
    entityType: "spots",
    entityId: data.id,
    newValue: updateData,
  })

  return success(data)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = adminLimiter(`spots:delete:${ip}`)
  if (!allowed) return unauthorized("Rate limited")

  const { slug } = await params

  const { data: existing } = await adminClient
    .from("spots")
    .select("id, name")
    .eq("slug", slug)
    .single()

  if (!existing) return notFound("Spot")

  const { error: dbError } = await adminClient.from("spots").delete().eq("slug", slug)
  if (dbError) return internalError(dbError.message)

  const { logAudit } = await import("@/lib/api/audit")
  await logAudit({
    userId: admin.id,
    action: "DELETE",
    entityType: "spots",
    entityId: existing.id,
    oldValue: existing,
  })

  return success({ deleted: true })
}

import { success, notFound, badRequest, unauthorized } from "@/lib/api/response"
import { adminLimiter } from "@/lib/api/rate-limit"
import { updateSpotSchema } from "@/lib/validators/spot"
import { getServerAdmin } from "@/lib/api/auth"
import { getSpotBySlug } from "@/lib/services/spots"
import { db } from "@/lib/services/db"

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const spot = await getSpotBySlug(slug)
  if (!spot) return notFound("Spot")
  return success(spot)
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { slug } = await params
  const body = await request.json()
  const parsed = updateSpotSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(", "))

  const { data: existing } = await db.from("spots").select("id, slug, name, view_count").eq("slug", slug).single()
  if (!existing) return notFound("Spot")

  const { error } = await db.from("spots").update(parsed.data).eq("slug", slug)
  if (error) return new Response(JSON.stringify({ error: { message: error.message } }), { status: 500 })

  const { logAudit } = await import("@/lib/api/audit")
  await logAudit({ userId: admin.id, action: "UPDATE", entityType: "spots", entityId: existing.id, oldValue: existing, newValue: parsed.data })

  return success({ id: existing.id, slug, updated_at: new Date().toISOString() })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { slug } = await params
  const { data: existing, error: fetchError } = await db.from("spots").select("id, slug, name").eq("slug", slug).single()
  if (fetchError || !existing) return notFound("Spot")

  const { error: dbError } = await db.from("spots").delete().eq("slug", slug)
  if (dbError) return new Response(JSON.stringify({ error: { message: dbError.message } }), { status: 500 })

  const { logAudit } = await import("@/lib/api/audit")
  await logAudit({ userId: admin.id, action: "DELETE", entityType: "spots", entityId: existing.id, oldValue: existing })

  return success({ deleted: true })
}

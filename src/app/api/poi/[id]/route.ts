import { createClient } from "@supabase/supabase-js"
import { success, notFound, badRequest, internalError, unauthorized } from "@/lib/api/response"
import { updatePOISchema } from "@/lib/validators/poi"
import { getServerAdmin } from "@/lib/api/auth"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await adminClient.from("poi").select("*").eq("id", id).single()
  if (error || !data) return notFound("POI")
  return success(data)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { id } = await params
  const body = await request.json()
  const parsed = updatePOISchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(", "))

  const updateData: Record<string, unknown> = { ...parsed.data }
  if (parsed.data.latitude && parsed.data.longitude) {
    updateData.location = `POINT(${parsed.data.longitude} ${parsed.data.latitude})`
  }

  const { data, error } = await adminClient.from("poi").update(updateData).eq("id", id).select("id, name, updated_at").single()
  if (error) return internalError(error.message)
  return success(data)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()
  const { id } = await params
  const { error } = await adminClient.from("poi").delete().eq("id", id)
  if (error) return internalError(error.message)
  return success({ deleted: true })
}

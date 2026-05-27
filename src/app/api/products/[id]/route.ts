import { createClient } from "@supabase/supabase-js"
import { success, notFound, badRequest, internalError, unauthorized } from "@/lib/api/response"
import { updateProductSchema } from "@/lib/validators/product"
import { getServerAdmin } from "@/lib/api/auth"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await adminClient.from("products").select("*").eq("id", id).single()
  if (error || !data) return notFound("Product")
  return success(data)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { id } = await params
  const body = await request.json()
  const parsed = updateProductSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(", "))

  const { data, error } = await adminClient.from("products").update(parsed.data).eq("id", id).select("id, slug, updated_at").single()
  if (error) return internalError(error.message)
  return success(data)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { id } = await params
  const { error } = await adminClient.from("products").delete().eq("id", id)
  if (error) return internalError(error.message)
  return success({ deleted: true })
}

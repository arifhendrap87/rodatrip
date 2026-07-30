import { success, badRequest, unauthorized, notFound, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { id } = await params
  if (!id) return badRequest("id wajib diisi")

  const body = await request.json()
  const updates: Record<string, unknown> = {}

  if (body.scheduled_at) updates.scheduled_at = body.scheduled_at
  if (body.platform) {
    const validPlatforms = ["twitter", "instagram", "facebook", "threads"]
    if (!validPlatforms.includes(body.platform)) {
      return badRequest("platform harus twitter, instagram, facebook, atau threads")
    }
    updates.platform = body.platform
  }

  if (Object.keys(updates).length === 0) {
    return badRequest("Tidak ada data yang diubah")
  }

  updates.updated_at = new Date().toISOString()

  const { data, error } = await db
    .from("scheduled_posts")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) return internalError(error.message)
  if (!data) return notFound("Scheduled post")

  return success(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { id } = await params
  if (!id) return badRequest("id wajib diisi")

  const { data, error } = await db
    .from("scheduled_posts")
    .delete()
    .eq("id", id)
    .select()
    .single()

  if (error) return internalError(error.message)
  if (!data) return notFound("Scheduled post")

  return success({ deleted: true })
}

import { success, notFound, unauthorized, badRequest } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { deleteImage } from "@/lib/storage"
import { db } from "@/lib/services/db"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { id } = await params
  const body = await request.json()
  const { filename, folder } = body

  const { data: existing, error: findError } = await db
    .from("media")
    .select("id, filename, folder")
    .eq("id", id)
    .single()

  if (findError || !existing) return notFound("Media")

  const updates: Record<string, unknown> = {}
  if (filename !== undefined) updates.filename = filename
  if (folder !== undefined) updates.folder = folder

  if (Object.keys(updates).length === 0) return badRequest("Tidak ada field yang diupdate")

  const { data, error } = await db
    .from("media")
    .update(updates)
    .eq("id", id)
    .select("id, url, filename, key, folder, created_at, updated_at")
    .single()

  if (error) return badRequest(error.message)

  return success(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { id } = await params

  const { data: media, error: findError } = await db
    .from("media")
    .select("id, url, key")
    .eq("id", id)
    .single()

  if (findError || !media) return notFound("Media")

  try {
    await deleteImage(media.key)
  } catch {
    // proceed even if storage delete fails
  }

  await db.from("media").delete().eq("id", id)

  return success({ deleted: true })
}

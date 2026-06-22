import { success, notFound, unauthorized } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { deleteImage } from "@/lib/storage"
import { db } from "@/lib/services/db"

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

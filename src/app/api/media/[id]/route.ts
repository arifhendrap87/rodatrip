import { success, notFound, unauthorized } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { deleteImage } from "@/lib/r2"
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

  const keyParts = media.key.split("/")
  const r2Key = keyParts.length >= 3 ? keyParts.slice(0, 3).join("/") : media.key

  try {
    await deleteImage(r2Key)
  } catch {
    // proceed even if R2 delete fails
  }

  await db.from("media").delete().eq("id", id)

  return success({ deleted: true })
}

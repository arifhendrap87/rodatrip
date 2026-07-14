import { success, badRequest, unauthorized, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

export async function GET() {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { data, error } = await db
    .from("media")
    .select("folder")

  if (error) return success([])

  const folderMap = new Map<string, number>()
  for (const row of (data || []) as { folder: string }[]) {
    folderMap.set(row.folder, (folderMap.get(row.folder) || 0) + 1)
  }

  const result = Array.from(folderMap.entries()).map(([name, count]) => ({ name, count }))
  return success(result)
}

export async function PUT(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { oldName, newName } = await request.json()
  if (!oldName || !newName) return badRequest("oldName dan newName wajib diisi")

  const { error } = await db
    .from("media")
    .update({ folder: newName })
    .eq("folder", oldName)

  if (error) return internalError(error.message)

  return success({ updated: true, oldName, newName })
}

export async function DELETE(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { name } = await request.json()
  if (!name) return badRequest("name wajib diisi")
  if (name === "spots" || name === "cover") return badRequest("Tidak bisa menghapus folder default")

  // Delete all items in the folder from storage + DB
  const { data: items } = await db.from("media").select("key").eq("folder", name)
  if (items && items.length > 0) {
    const { deleteImage } = await import("@/lib/storage")
    for (const item of items) {
      try { await deleteImage(item.key) } catch { /* continue */ }
    }
  }

  const { error } = await db.from("media").delete().eq("folder", name)
  if (error) return internalError(error.message)

  return success({ deleted: true, folder: name, count: items?.length || 0 })
}

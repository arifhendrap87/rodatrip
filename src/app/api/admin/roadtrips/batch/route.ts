import { success, badRequest, unauthorized } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { action, slugs } = await request.json()
  if (!action || !slugs || !Array.isArray(slugs) || slugs.length === 0) {
    return badRequest("action dan slugs wajib diisi")
  }

  if (action === "delete") {
    await db.from("itineraries").delete().in("slug", slugs)
  } else if (action === "publish") {
    await db.from("itineraries").update({ is_published: true }).in("slug", slugs)
  } else if (action === "unpublish") {
    await db.from("itineraries").update({ is_published: false }).in("slug", slugs)
  } else {
    return badRequest("action tidak valid. Gunakan: publish, unpublish, delete")
  }

  return success({ affected: slugs.length })
}

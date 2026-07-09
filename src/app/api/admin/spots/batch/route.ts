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

  if (action !== "delete") return badRequest("Spot hanya support action: delete")

  await db.from("spots").delete().in("slug", slugs)
  return success({ affected: slugs.length })
}

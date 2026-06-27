import { success, badRequest, unauthorized } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const body = await request.json()
  const { productId, description, images } = body

  if (!productId) return badRequest("productId required")

  const updateData: Record<string, unknown> = {}
  if (description) updateData.description = description
  if (images && Array.isArray(images)) {
    updateData.image_url = images[0] || null
    updateData.images = images
  }

  if (Object.keys(updateData).length === 0) {
    return badRequest("No data to update")
  }

  const { error } = await db.from("products").update(updateData).eq("id", productId)
  if (error) return badRequest(error.message)

  return success({ updated: true, fields: Object.keys(updateData) })
}

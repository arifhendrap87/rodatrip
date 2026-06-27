import { success, badRequest, unauthorized, notFound } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { code } = await params
  const body = await request.json()

  const updateData: Record<string, unknown> = {}
  if (body.image_url !== undefined) updateData.image_url = body.image_url || null
  if (body.description !== undefined) updateData.description = body.description || null

  if (Object.keys(updateData).length === 0) {
    return badRequest("No data to update")
  }

  const { data, error } = await db
    .from("regions")
    .update(updateData)
    .eq("code", code)
    .select("code, name, image_url, description")
    .single()

  if (error) return notFound("Region")
  return success(data)
}

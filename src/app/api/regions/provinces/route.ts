import { success, unauthorized } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { data, error } = await db
    .from("regions")
    .select("code, name, image_url")
    .eq("type", "province")
    .order("name")

  if (error) return success([])
  return success(data || [])
}

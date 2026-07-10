import { success, unauthorized } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

export async function GET() {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { data } = await db
    .from("itineraries")
    .select("id, title, slug")
    .order("title", { ascending: true })

  return success(data || [])
}

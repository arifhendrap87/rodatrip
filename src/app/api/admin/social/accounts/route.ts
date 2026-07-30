import { success, unauthorized } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

export async function GET() {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { data } = await db
    .from("social_accounts")
    .select("*")
    .order("platform", { ascending: true })

  return success(data || [])
}

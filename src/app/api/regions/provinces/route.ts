import { success } from "@/lib/api/response"
import { db } from "@/lib/services/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const { data, error } = await db
    .from("regions")
    .select("code, name, image_url")
    .eq("type", "province")
    .order("name")

  if (error) return success([])
  return success(data || [])
}

import { success } from "@/lib/api/response"
import { db } from "@/lib/services/db"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  if (!code) return success([])

  const { data, error } = await db
    .from("regions")
    .select("code, name, image_url")
    .eq("type", "regency")
    .eq("parent_code", code)
    .order("name")

  if (error) return success([])
  return success(data || [])
}

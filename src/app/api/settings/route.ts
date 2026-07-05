import { success } from "@/lib/api/response"
import { db } from "@/lib/services/db"

export async function GET() {
  const { data } = await db.from("settings").select("*")
  const map: Record<string, string> = {}
  for (const row of data || []) {
    map[(row as { key: string; value: string }).key] = (row as { key: string; value: string }).value
  }
  if (!map.site_name) map.site_name = "RodaTrip"
  return success(map)
}

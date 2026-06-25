import { success, badRequest, unauthorized } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
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

export async function PUT(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const body = await request.json()
  if (!body.site_name || typeof body.site_name !== "string") {
    return badRequest("site_name required")
  }

  await db.from("settings").upsert(
    { key: "site_name", value: body.site_name.trim() },
    { onConflict: "key" }
  )

  return success({ site_name: body.site_name.trim() })
}

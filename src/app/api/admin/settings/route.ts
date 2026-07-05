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
  const upserts: { key: string; value: string }[] = []

  if (body.site_name && typeof body.site_name === "string") {
    upserts.push({ key: "site_name", value: body.site_name.trim() })
  }

  const socialKeys = ["instagram", "tiktok", "twitter"] as const
  for (const key of socialKeys) {
    if (body[key] !== undefined) {
      upserts.push({ key: `${key}_url`, value: String(body[key]).trim() })
    }
  }

  if (upserts.length === 0) return badRequest("Tidak ada data yang diubah")

  for (const item of upserts) {
    await db.from("settings").upsert(item, { onConflict: "key" })
  }

  return success(Object.fromEntries(upserts.map((u) => [u.key.replace("_url", ""), u.value])))
}

import { db } from "./db"

export async function getSiteName(): Promise<string> {
  try {
    const { data } = await db.from("settings").select("value").eq("key", "site_name").maybeSingle()
    return data?.value || "RodaTrip"
  } catch {
    return "RodaTrip"
  }
}

export async function getSettings(): Promise<Record<string, string>> {
  try {
    const { data } = await db.from("settings").select("*")
    const map: Record<string, string> = {}
    for (const row of data || []) {
      map[(row as { key: string; value: string }).key] = (row as { key: string; value: string }).value
    }
    if (!map.site_name) map.site_name = "RodaTrip"
    return map
  } catch {
    return { site_name: "RodaTrip" }
  }
}

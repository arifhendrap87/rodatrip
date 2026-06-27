import { success } from "@/lib/api/response"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const res = await fetch("https://wilayah.id/api/provinces.json", {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(10000),
    })
    const data = await res.json()
    return success(data.data || [])
  } catch {
    return success([])
  }
}

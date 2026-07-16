import { success, unauthorized } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

export async function GET() {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  // Get all provinces
  const { data: provinces } = await db
    .from("regions")
    .select("code, name")
    .eq("type", "province")

  // Get all regencies with their parent_code
  const { data: regencies } = await db
    .from("regions")
    .select("code, name, parent_code")
    .eq("type", "regency")

  // Total cities per province
  const totalByProvCode: Record<string, number> = {}
  const cityToProvCode: Record<string, string> = {}
  const provCodeToName: Record<string, string> = {}

  for (const p of (provinces || []) as { code: string; name: string }[]) {
    provCodeToName[p.code] = p.name
  }

  for (const r of (regencies || []) as { code: string; name: string; parent_code: string }[]) {
    totalByProvCode[r.parent_code] = (totalByProvCode[r.parent_code] || 0) + 1
    cityToProvCode[r.name] = r.parent_code
  }

  // Get all itineraries and extract cities from titles
  const { data: itineraries } = await db
    .from("itineraries")
    .select("title")

  const citiesWithRoadtrip = new Set<string>()
  for (const it of (itineraries || []) as { title: string }[]) {
    const match = it.title?.match(/Road Trip (.*?):/)
    if (match) citiesWithRoadtrip.add(match[1].trim())
  }

  // Compute stats per province
  const byProvince: Record<string, { provinceName: string; total: number; withRoadtrip: number; percentage: number }> = {}

  for (const p of (provinces || []) as { code: string; name: string }[]) {
    byProvince[p.name] = {
      provinceName: p.name,
      total: totalByProvCode[p.code] || 0,
      withRoadtrip: 0,
      percentage: 0,
    }
  }

  for (const city of citiesWithRoadtrip) {
    // Try full city name first, then try without "Kabupaten/Kota" prefix
    let provCode = cityToProvCode[city]
    if (!provCode) {
      const clean = city.replace(/^(Kabupaten |Kota )/, "")
      provCode = cityToProvCode[clean]
    }
    if (provCode) {
      const provName = provCodeToName[provCode]
      if (provName && byProvince[provName]) {
        byProvince[provName].withRoadtrip++
      }
    }
  }

  const totalCities = regencies?.length || 0
  const citiesWithRt = citiesWithRoadtrip.size

  for (const provName of Object.keys(byProvince)) {
    const p = byProvince[provName]
    p.percentage = p.total > 0 ? Math.round((p.withRoadtrip / p.total) * 100) : 0
  }

  return success({
    byProvince,
    overall: {
      totalCities,
      citiesWithRoadtrip: citiesWithRt,
      percentage: totalCities > 0 ? Math.round((citiesWithRt / totalCities) * 100) : 0,
    },
  })
}

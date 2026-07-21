import { success, badRequest, unauthorized } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { findDuplicateSpot } from "@/lib/utils/detect-duplicate-spot"
import { db } from "@/lib/services/db"

function generateSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { stops } = await request.json()
  if (!stops || !Array.isArray(stops) || stops.length === 0) {
    return badRequest("stops wajib diisi (array)")
  }

  const results: {
    stopNumber: number
    name: string
    slug: string
    exists: boolean
    matchType?: string
    duplicateName?: string
  }[] = []

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i]
    const name = (stop.name as string) || ""
    const slug = generateSlug(name)

    const { data: existing } = await db
      .from("spots")
      .select("slug, name")
      .eq("slug", slug)
      .maybeSingle()

    if (existing) {
      results.push({
        stopNumber: i + 1,
        name,
        slug,
        exists: true,
        matchType: "exact_slug",
        duplicateName: existing.name,
      })
      continue
    }

    const duplicate = await findDuplicateSpot(
      name,
      stop.lat as number | undefined,
      stop.lng as number | undefined
    )

    if (duplicate) {
      results.push({
        stopNumber: i + 1,
        name,
        slug: duplicate.slug,
        exists: true,
        matchType: duplicate.matchType,
        duplicateName: duplicate.name,
      })
      continue
    }

    results.push({
      stopNumber: i + 1,
      name,
      slug,
      exists: false,
    })
  }

  return success(results)
}

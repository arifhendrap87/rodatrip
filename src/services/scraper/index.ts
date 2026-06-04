import { fetchProvinceSpots, type WikiPage } from "./wikipedia"
import { transformWikiPage, type ScrapedSpot } from "./transform"
import { db } from "@/lib/services/db"

export interface ScrapeResult {
  province: string
  totalFound: number
  new: ScrapedSpot[]
  skipped: string[]
  errors: string[]
}

export async function scrapeProvince(province: string): Promise<ScrapeResult> {
  const errors: string[] = []
  let pages: WikiPage[] = []

  try {
    pages = await fetchProvinceSpots(province)
  } catch (err) {
    return {
      province,
      totalFound: 0,
      new: [],
      skipped: [],
      errors: [(err as Error).message],
    }
  }

  const transformed = pages.map((p) => transformWikiPage(p, province))
  const existingSlugs = await getExistingSlugs(province)

  const newSpots: ScrapedSpot[] = []
  const skipped: string[] = []

  for (const spot of transformed) {
    if (existingSlugs.has(spot.slug)) {
      skipped.push(spot.name)
    } else {
      newSpots.push(spot)
    }
  }

  return {
    province,
    totalFound: pages.length,
    new: newSpots,
    skipped,
    errors,
  }
}

export async function saveScrapedSpots(spots: ScrapedSpot[]): Promise<{ saved: number; errors: string[] }> {
  const errors: string[] = []
  let saved = 0

  for (const spot of spots) {
    try {
      const { error } = await db.from("spots").upsert(
        {
          slug: spot.slug,
          name: spot.name,
          category: spot.category,
          province: spot.province,
          region: spot.region,
          location: `POINT(${spot.longitude} ${spot.latitude})`,
          description: spot.description,
          why_special: "",
          image_url: spot.image_url,
          image_credit: spot.image_credit,
          tags: spot.tags,
          rating: spot.rating,
          is_featured: false,
        },
        { onConflict: "slug" }
      )

      if (error) {
        errors.push(`${spot.name}: ${error.message}`)
      } else {
        saved++
      }
    } catch (err) {
      errors.push(`${spot.name}: ${(err as Error).message}`)
    }
  }

  return { saved, errors }
}

async function getExistingSlugs(province: string): Promise<Set<string>> {
  try {
    const { data } = await db
      .from("spots")
      .select("slug")
      .eq("province", province)

    return new Set(data?.map((s: { slug: string }) => s.slug) || [])
  } catch {
    return new Set()
  }
}

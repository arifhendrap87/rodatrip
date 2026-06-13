import { fetchDaftarList, batchFetchDetails, type WikiPage, type DaftarSpot } from "./wikipedia"
import { transformWikiPage, type ScrapedSpot } from "./transform"
import { db } from "@/lib/services/db"

export interface ScrapeResult {
  province: string
  totalFound: number
  new: ScrapedSpot[]
  skipped: string[]
  errors: string[]
  noArticle: number
}

export async function scrapeProvince(province: string): Promise<ScrapeResult> {
  const errors: string[] = []

  try {
    const allSpots = await fetchDaftarList()
    const spots = allSpots.filter((s) => s.province === province)

    const withArticle = spots.filter((s) => s.title)
    const noArticle = spots.length - withArticle.length

    const titles = withArticle.map((s) => s.title!).filter(Boolean)

    if (titles.length === 0) {
      return {
        province,
        totalFound: spots.length,
        new: [],
        skipped: [],
        errors: [],
        noArticle,
      }
    }

    const pages = await batchFetchDetails(titles)
    const existingSlugs = await getExistingSlugs(province)

    const newSpots: ScrapedSpot[] = []
    const skipped: string[] = []
    let noCoords = 0

    for (const spot of withArticle) {
      const page = pages.get(spot.title!)
      if (!page) {
        errors.push(`${spot.name}: no page data returned`)
        continue
      }

      if (!page.coordinates || page.coordinates.length === 0) {
        noCoords++
        continue
      }

      const transformed = transformWikiPage(page, province, spot.city)
      if (existingSlugs.has(transformed.slug)) {
        skipped.push(transformed.name)
      } else {
        newSpots.push(transformed)
      }
    }

    return {
      province,
      totalFound: spots.length,
      new: newSpots,
      skipped,
      errors,
      noArticle: noArticle + noCoords,
    }
  } catch (err) {
    return {
      province,
      totalFound: 0,
      new: [],
      skipped: [],
      errors: [(err as Error).message],
      noArticle: 0,
    }
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
    const { data } = await db.from("spots").select("slug").eq("province", province)
    return new Set(data?.map((s: { slug: string }) => s.slug) || [])
  } catch {
    return new Set()
  }
}

const WIKIPEDIA_API = "https://id.wikipedia.org/w/api.php"

export interface WikiPage {
  pageid: number
  title: string
  extract?: string
  thumbnail?: { source: string; width: number; height: number }
  coordinates?: { lat: number; lon: number }[]
  categories?: { title: string }[]
}

interface WikiResponse {
  query?: {
    pages?: Record<string, WikiPage>
  }
  continue?: { gcmcontinue?: string; continue?: string }
}

export async function fetchProvinceSpots(province: string): Promise<WikiPage[]> {
  const category = `Kategori:Tempat_wisata_di_${province.replace(/\s+/g, "_")}`
  const pages: WikiPage[] = []
  let gcmcontinue: string | undefined

  do {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      generator: "categorymembers",
      gcmtitle: category,
      gcmlimit: "50",
      prop: "extracts|pageimages|coordinates|categories",
      exintro: "1",
      explaintext: "1",
      exsentences: "3",
      pithumbsize: "800",
      origin: "*",
    })

    if (gcmcontinue) params.set("gcmcontinue", gcmcontinue)

    const res = await fetch(`${WIKIPEDIA_API}?${params}`, {
      headers: { "User-Agent": "Gaskuy/1.0 (roadtrip-app)" },
    })

    if (!res.ok) {
      throw new Error(`Wikipedia API error: ${res.status} ${res.statusText}`)
    }

    const data: WikiResponse = await res.json()

    if (data.query?.pages) {
      for (const page of Object.values(data.query.pages)) {
        if (page.pageid < 0) continue
        if (!page.extract) continue
        if (!page.coordinates || page.coordinates.length === 0) continue
        pages.push(page)
      }
    }

    gcmcontinue = data.continue?.gcmcontinue
  } while (gcmcontinue)

  return pages
}

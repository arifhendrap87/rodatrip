const WIKIPEDIA_API = "https://id.wikipedia.org/w/api.php"
const DAFTAR_PAGE = "Daftar_tempat_wisata_di_Indonesia"

const NORMALIZE_PROVINCE: Record<string, string> = {
  Jakarta: "DKI Jakarta",
  Yogyakarta: "DI Yogyakarta",
}

export interface WikiPage {
  pageid: number
  title: string
  extract?: string
  thumbnail?: { source: string; width: number; height: number }
  coordinates?: { lat: number; lon: number }[]
  categories?: { title: string }[]
}

export interface DaftarSpot {
  name: string
  title: string | null
  city: string
  province: string
}

export async function fetchDaftarList(): Promise<DaftarSpot[]> {
  const html = await fetchPageHTML(DAFTAR_PAGE)
  return parseDaftarHTML(html)
}

async function fetchPageHTML(page: string): Promise<string> {
  const params = new URLSearchParams({
    action: "parse",
    page,
    prop: "text",
    format: "json",
    origin: "*",
  })

  const res = await fetch(`${WIKIPEDIA_API}?${params}`, {
    headers: { "User-Agent": "Gaskuy/1.0 (roadtrip-app)" },
  })

  if (!res.ok) throw new Error(`Wikipedia parse API error: ${res.status}`)

  const data = await res.json()
  const html = data.parse?.text?.["*"]
  if (!html) throw new Error("No HTML returned from parse API")

  return html
}

function parseDaftarHTML(html: string): DaftarSpot[] {
  const result: DaftarSpot[] = []
  const skipProvinces = new Set(["Daftar isi", "Pranala luar", "Catatan kaki", "Referensi", "Catatan"])

  const headingRegex = /<div class="mw-heading mw-heading([23])">[\s\S]*?<\/div>/g
  const headings: { level: number; html: string; index: number }[] = []
  let match: RegExpExecArray | null

  while ((match = headingRegex.exec(html)) !== null) {
    headings.push({ level: Number(match[1]), html: match[0], index: match.index })
  }

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i]
    if (heading.level !== 2) continue

    const rawProvince = extractHeadingText(heading.html)
    if (!rawProvince || skipProvinces.has(rawProvince)) continue
    const province = NORMALIZE_PROVINCE[rawProvince] || rawProvince

    const nextIndex = getNextHeadingIndex(headings, i)
    const sectionHtml = html.substring(heading.index + heading.html.length, nextIndex)

    const spots = parseProvinceSection(sectionHtml, province)
    result.push(...spots)
  }

  return result
}

function getNextHeadingIndex(headings: { level: number; index: number; html: string }[], current: number): number {
  for (let j = current + 1; j < headings.length; j++) {
    if (headings[j].level === 2) return headings[j].index
  }
  return Infinity
}

function parseProvinceSection(html: string, province: string): DaftarSpot[] {
  const result: DaftarSpot[] = []
  const cityRegex = /<div class="mw-heading mw-heading3">[\s\S]*?<\/div>/g
  let match: RegExpExecArray | null
  const cityHeadings: { html: string; index: number }[] = []

  while ((match = cityRegex.exec(html)) !== null) {
    cityHeadings.push({ html: match[0], index: match.index })
  }

  if (cityHeadings.length === 0) {
    result.push(...extractSpotsFromHtml(html, province, ""))
    return result
  }

  for (let i = 0; i < cityHeadings.length; i++) {
    const city = extractHeadingText(cityHeadings[i].html) || ""
    const start = cityHeadings[i].index + cityHeadings[i].html.length
    const end = i + 1 < cityHeadings.length ? cityHeadings[i + 1].index : html.length
    const sectionHtml = html.substring(start, end)

    result.push(...extractSpotsFromHtml(sectionHtml, province, city))
  }

  return result
}

function extractSpotsFromHtml(html: string, province: string, city: string): DaftarSpot[] {
  const result: DaftarSpot[] = []
  const ulRegex = /<ul>([\s\S]*?)<\/ul>/g
    let match: RegExpExecArray | null

    while ((match = ulRegex.exec(html)) !== null) {
      const ulHtml = match[1]
      const liRegex = /<li>([\s\S]*?)<\/li>/g
    let liMatch: RegExpExecArray | null

    while ((liMatch = liRegex.exec(ulHtml)) !== null) {
      const spot = extractSpotFromLi(liMatch[1])
      if (spot) {
        result.push({ ...spot, city, province })
      }
    }
  }

  return result
}

function extractSpotFromLi(liHtml: string): { name: string; title: string | null } | null {
  const text = liHtml.replace(/<[^>]+>/g, "").trim()
  if (!text) return null

  const validLinkMatch = liHtml.match(/<a\s+href="\/wiki\/([^"]+)"[^>]*>(.*?)<\/a>/)
  const redLinkMatch = liHtml.match(/<a[^>]*class="new"[^>]*>/)

  if (validLinkMatch && !redLinkMatch) {
    const rawTitle = validLinkMatch[1]
    const title = decodeURIComponent(rawTitle).replace(/_/g, " ")
    const linkText = validLinkMatch[2].replace(/<[^>]+>/g, "").trim()
    return { name: linkText || title, title }
  }

  if (redLinkMatch) {
    const redLinkText = liHtml.replace(/<[^>]+>/g, "").trim()
    return { name: redLinkText, title: null }
  }

  return { name: text, title: null }
}

function extractHeadingText(headingHtml: string): string {
  const idMatch = headingHtml.match(/<h[23][^>]*id="([^"]+)"/)
  if (idMatch) {
    return idMatch[1].replace(/_/g, " ")
  }
  return headingHtml.replace(/<[^>]+>/g, "").trim()
}

export async function batchFetchDetails(titles: string[]): Promise<Map<string, WikiPage>> {
  const result = new Map<string, WikiPage>()
  const batchSize = 50

  for (let i = 0; i < titles.length; i += batchSize) {
    const batch = titles.slice(i, i + batchSize)

    const params = new URLSearchParams({
      action: "query",
      format: "json",
      titles: batch.join("|"),
      prop: "extracts|pageimages|coordinates|categories",
      exintro: "1",
      explaintext: "1",
      exsentences: "3",
      pithumbsize: "800",
      origin: "*",
    })

    const res = await fetch(`${WIKIPEDIA_API}?${params}`, {
      headers: { "User-Agent": "Gaskuy/1.0 (roadtrip-app)" },
    })

    if (!res.ok) throw new Error(`Wikipedia query API error: ${res.status}`)

    const data = await res.json()
    if (data.query?.pages) {
      for (const page of Object.values(data.query.pages) as WikiPage[]) {
        if (page.pageid && page.pageid > 0) {
          result.set(page.title, page)
        }
      }
    }
  }

  return result
}

export async function fetchProvinceSpots(_province: string): Promise<WikiPage[]> {
  return []
}

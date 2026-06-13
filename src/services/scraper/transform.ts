import type { WikiPage } from "./wikipedia"

const PROVINCE_MAP: Record<string, string> = {
  Jakarta: "DKI Jakarta",
  Yogyakarta: "DI Yogyakarta",
}

const REGION_MAP: Record<string, string> = {
  Aceh: "Sumatera",
  "Sumatera Utara": "Sumatera",
  "Sumatera Barat": "Sumatera",
  Riau: "Sumatera",
  "Kepulauan Riau": "Sumatera",
  Jambi: "Sumatera",
  "Sumatera Selatan": "Sumatera",
  Bengkulu: "Sumatera",
  Lampung: "Sumatera",
  "Kepulauan Bangka Belitung": "Sumatera",
  Banten: "Jawa",
  "Jawa Barat": "Jawa",
  Jakarta: "Jawa",
  "DKI Jakarta": "Jawa",
  "Jawa Tengah": "Jawa",
  Yogyakarta: "Jawa",
  "DI Yogyakarta": "Jawa",
  "Daerah Istimewa Yogyakarta": "Jawa",
  "Jawa Timur": "Jawa",
  Bali: "Bali & Nusa Tenggara",
  "Nusa Tenggara Barat": "Bali & Nusa Tenggara",
  "Nusa Tenggara Timur": "Bali & Nusa Tenggara",
  "Kalimantan Barat": "Kalimantan",
  "Kalimantan Tengah": "Kalimantan",
  "Kalimantan Selatan": "Kalimantan",
  "Kalimantan Timur": "Kalimantan",
  "Kalimantan Utara": "Kalimantan",
  "Sulawesi Utara": "Sulawesi",
  "Sulawesi Tengah": "Sulawesi",
  "Sulawesi Barat": "Sulawesi",
  "Sulawesi Selatan": "Sulawesi",
  "Sulawesi Tenggara": "Sulawesi",
  Gorontalo: "Sulawesi",
  Maluku: "Maluku & Papua",
  "Maluku Utara": "Maluku & Papua",
  Papua: "Maluku & Papua",
  "Papua Barat": "Maluku & Papua",
}

type SpotCategory = "alam" | "kuliner" | "budaya" | "foto" | "petualangan" | "sejarah"

const CATEGORY_KEYWORDS: Record<SpotCategory, string[]> = {
  sejarah: ["candi", "museum", "benteng", "monumen", "heritage", "kolonial", "keraton", "istana", "rumah adat", "bangunan bersejarah", "situs", "arkeologi", "prasasti"],
  alam: ["air terjun", "curug", "pantai", "danau", "gunung", "bukit", "lembah", "ngarai", "kawah", "taman nasional", "cagar alam", "kebun raya", "hutan", "pulau", "goa", "gua", "terumbu karang", "situ", "waduk", "taman wisata alam", "suaka margasatwa", "taman laut"],
  budaya: ["pura", "masjid", "gereja", "klenteng", "vihara", "tradisi", "upacara", "desa wisata", "kampung adat", "kesenian", "tari", "pagelaran", "museum budaya"],
  petualangan: ["trekking", "hiking", "camping", "diving", "snorkeling", "surfing", "panjat tebing", "rafting", "off-road", "pendakian", "susur sungai"],
  kuliner: ["kuliner", "makanan", "masakan", "kafe", "restoran", "jajanan", "pasar kuliner"],
  foto: ["spot foto", "instagramable", "panorama", "pemandangan"],
}

function detectCategory(categories: { title: string }[] | undefined): SpotCategory {
  if (!categories || categories.length === 0) return "alam"

  const catTitles = categories.map((c) => c.title.toLowerCase())
  const scores: Record<SpotCategory, number> = { alam: 0, kuliner: 0, budaya: 0, foto: 0, petualangan: 0, sejarah: 0 }

  for (const title of catTitles) {
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const kw of keywords) {
        if (title.includes(kw)) {
          scores[cat as SpotCategory]++
        }
      }
    }
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  return best && best[1] > 0 ? (best[0] as SpotCategory) : "alam"
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export interface ScrapedSpot {
  slug: string
  name: string
  category: SpotCategory
  province: string
  region: string
  latitude: number
  longitude: number
  description: string
  image_url: string
  image_credit: string
  tags: string[]
  rating: number
  why_special: string
  tips: string
  best_time: string
  opening_hours: string
  estimated_time: string
  ticket_price: string
  road_access: string
  facilities: string[]
  distance_from_city: string
}

function normalizeProvince(province: string): string {
  return PROVINCE_MAP[province] || province
}

export function transformWikiPage(page: WikiPage, province: string, _city?: string): ScrapedSpot {
  const normalizedProvince = normalizeProvince(province)
  const coord = page.coordinates![0]

  const description = page.extract || ""
  const category = detectCategory(page.categories)
  const slug = generateSlug(page.title)
  const region = REGION_MAP[normalizedProvince] || "Jawa"

  const tags: string[] = []
  if (page.categories) {
    for (const cat of page.categories) {
      const clean = cat.title
        .replace(/^Kategori:/, "")
        .replace(/di Indonesia$/, "")
        .replace(/di Jawa/, "")
        .trim()
      if (clean && !clean.startsWith("Tempat") && !clean.startsWith("Wikipedia") && !clean.startsWith("Artikel")) {
        tags.push(clean.toLowerCase())
      }
    }
  }

  return {
    slug,
    name: page.title,
    category,
    province: normalizedProvince,
    region,
    latitude: coord.lat,
    longitude: coord.lon,
    description,
    image_url: page.thumbnail?.source || "",
    image_credit: "Wikipedia",
    tags: tags.slice(0, 10),
    rating: 4.0,
    why_special: "",
    tips: "",
    best_time: "",
    opening_hours: "",
    estimated_time: "",
    ticket_price: "",
    road_access: "",
    facilities: [],
    distance_from_city: "",
  }
}

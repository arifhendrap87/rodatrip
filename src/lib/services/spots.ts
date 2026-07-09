import { db } from "./db"

export interface SpotData {
  id: string
  slug: string
  name: string
  category: string
  province: string
  region: string
  description: string
  why_special: string
  rating: number
  image_url: string
  image_credit: string
  tags: string[]
  tips: string
  best_time: string
  opening_hours: string
  estimated_time: string
  ticket_price: string
  road_access: string
  facilities: string[]
  distance_from_city: string
  popular_routes: Record<string, unknown>[]
  related_product_ids: string[]
  is_featured: boolean
  view_count: number
  created_at: string
  updated_at: string
  location?: { type: "Point"; coordinates: [number, number] }
}

export function getSpotCoordinates(spot: SpotData): { lat: number; lng: number } | null {
  if (spot.location?.coordinates) {
    return { lng: spot.location.coordinates[0], lat: spot.location.coordinates[1] }
  }
  return null
}

export async function getSpots(options?: {
  category?: string
  region?: string
  province?: string
  city?: string
  search?: string
  featured?: boolean
  limit?: number
  offset?: number
  sort?: string
}): Promise<{ data: SpotData[]; total: number }> {
  try {
    let query = db.from("spots").select("*", { count: "exact" })

    if (options?.category) query = query.eq("category", options.category)
    if (options?.region) query = query.eq("region", options.region)
    if (options?.province) query = query.eq("province", options.province)
    if (options?.city) query = query.eq("city", options.city)
    if (options?.search) query = query.ilike("name", `%${options.search}%`)
    if (options?.featured) query = query.eq("is_featured", true)

    const limit = options?.limit || 20
    const offset = options?.offset || 0

    let orderColumn = "created_at"
    let orderAsc = false
    if (options?.sort === "nama") { orderColumn = "name"; orderAsc = true }
    else if (options?.sort === "rating") { orderColumn = "rating"; orderAsc = false }
    else if (options?.sort === "dilihat") { orderColumn = "view_count"; orderAsc = false }

    const { data, count, error } = await query
      .order(orderColumn, { ascending: orderAsc })
      .range(offset, offset + limit - 1)

    if (error) return { data: [], total: 0 }
    return { data: (data || []) as SpotData[], total: count || 0 }
  } catch {
    return { data: [], total: 0 }
  }
}

export async function getSpotBySlug(slug: string): Promise<SpotData | null> {
  try {
    const { data, error } = await db
      .from("spots")
      .select("*")
      .eq("slug", slug)
      .single()

    if (error) return null
    return data as SpotData
  } catch {
    return null
  }
}

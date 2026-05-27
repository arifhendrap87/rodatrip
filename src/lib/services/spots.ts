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
}

export async function getSpots(options?: {
  category?: string
  region?: string
  province?: string
  search?: string
  featured?: boolean
  limit?: number
  offset?: number
}): Promise<{ data: SpotData[]; total: number }> {
  let query = db.from("spots").select("*", { count: "exact" })

  if (options?.category) query = query.eq("category", options.category)
  if (options?.region) query = query.eq("region", options.region)
  if (options?.province) query = query.eq("province", options.province)
  if (options?.search) query = query.ilike("name", `%${options.search}%`)
  if (options?.featured) query = query.eq("is_featured", true)

  const limit = options?.limit || 20
  const offset = options?.offset || 0

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { data: (data || []) as SpotData[], total: count || 0 }
}

export async function getSpotBySlug(slug: string): Promise<SpotData | null> {
  const { data, error } = await db
    .from("spots")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }
  return data as SpotData
}

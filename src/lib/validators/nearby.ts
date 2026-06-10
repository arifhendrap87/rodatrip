import { z } from "zod"

export const NEARBY_CATEGORIES = [
  "hotel",
  "restaurant",
  "fuel",
  "parking",
  "hospital",
  "pharmacy",
  "atm",
  "mosque",
  "attraction",
  "all",
] as const

export const nearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  category: z.enum(NEARBY_CATEGORIES).default("all"),
  radius: z.coerce.number().int().min(500).max(20000).default(5000),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export type NearbyQuery = z.infer<typeof nearbyQuerySchema>

export interface NearbyPlace {
  id: number
  name: string
  category: string
  lat: number
  lng: number
  distance: number
  address: string | null
  phone: string | null
  website: string | null
  stars: number | null
  tags: Record<string, string>
}

export interface NearbyResponse {
  category: string
  center: { lat: number; lng: number }
  radius: number
  count: number
  places: NearbyPlace[]
}

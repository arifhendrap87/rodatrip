import { z } from "zod"

export const SPOT_CATEGORIES = ["alam", "kuliner", "budaya", "foto", "petualangan", "sejarah"] as const
export const REGIONS = ["Jawa", "Sumatera", "Bali & Nusa Tenggara", "Sulawesi", "Kalimantan"] as const

export const geoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export const createSpotSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.enum(SPOT_CATEGORIES),
  province: z.string().min(1),
  region: z.enum(REGIONS),
  location: geoPointSchema,
  description: z.string().min(1),
  whySpecial: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  imageCredit: z.string().optional(),
  tags: z.array(z.string()).optional(),
  tips: z.string().optional(),
  bestTime: z.string().optional(),
  openingHours: z.string().optional(),
  estimatedTime: z.string().optional(),
  ticketPrice: z.string().optional(),
  roadAccess: z.string().optional(),
  facilities: z.array(z.string()).optional(),
  distanceFromCity: z.string().optional(),
  isFeatured: z.boolean().optional(),
})

export const updateSpotSchema = createSpotSchema.partial()

export type CreateSpotInput = z.infer<typeof createSpotSchema>
export type UpdateSpotInput = z.infer<typeof updateSpotSchema>

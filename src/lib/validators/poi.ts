import { z } from "zod"

export const POI_CATEGORIES = ["spbu", "kuliner", "bengkel", "spot_foto", "info_jalan"] as const

export const createPOISchema = z.object({
  name: z.string().min(1).max(255),
  category: z.enum(POI_CATEGORIES),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
})

export const updatePOISchema = createPOISchema.partial()

export type CreatePOIInput = z.infer<typeof createPOISchema>
export type UpdatePOIInput = z.infer<typeof updatePOISchema>

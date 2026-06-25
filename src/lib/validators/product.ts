import { z } from "zod"

export const PRODUCT_CATEGORIES = [
  "Safety & Darurat", "Comfort", "Gadget & Mount",
  "Organizer", "Lifestyle & Merch", "Maintenance", "Bundle Hemat",
] as const

export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.enum(PRODUCT_CATEGORIES),
  price: z.number().int().min(0),
  originalPrice: z.number().int().min(0).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  images: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  stockQuantity: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
  source: z.string().optional(),
  external_id: z.string().optional(),
  weight: z.number().int().optional(),
  dimensions: z.string().optional(),
  tokopedia_url: z.string().url().optional().or(z.literal("")),
})

export const updateProductSchema = createProductSchema.partial()

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>

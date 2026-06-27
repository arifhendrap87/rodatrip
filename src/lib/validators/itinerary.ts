import { z } from "zod"

export const itineraryStopSchema = z.object({
  stopNumber: z.number().int().min(1),
  spotSlug: z.string().min(1),
})

export const createItinerarySchema = z.object({
  title: z.string().min(1),
  itineraryDuration: z.string().optional(),
  totalDistance: z.string().optional(),
  roadCondition: z.string().optional(),
  estimatedCost: z.string().optional(),
  bestDrivingTime: z.string().optional(),
  routeFacilities: z.array(z.string()).optional(),
  mapsEmbedUrl: z.string().optional(),
  drivingSafetyTips: z.string().optional(),
  culinaryNotes: z.string().optional(),
  coverImage: z.string().optional(),
  isPublished: z.boolean().optional(),
  stops: z.array(itineraryStopSchema).optional(),
})

export const updateItinerarySchema = createItinerarySchema.partial()

export type CreateItineraryInput = z.infer<typeof createItinerarySchema>
export type UpdateItineraryInput = z.infer<typeof updateItinerarySchema>

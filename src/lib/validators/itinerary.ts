import { z } from "zod"

export const itineraryStopSchema = z.object({
  stopNumber: z.number().int().min(1),
  name: z.string().min(1),
  category: z.string().optional(),
  visitDuration: z.string().optional(),
  bestVisitHour: z.string().optional(),
  ticketPrice: z.string().optional(),
  parkingFee: z.string().optional(),
  additionalCost: z.string().optional(),
  physicalEffort: z.string().optional(),
  spotFacilities: z.array(z.string()).optional(),
  spotImportantNote: z.string().optional(),
  description: z.string().optional(),
  spotSlug: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
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

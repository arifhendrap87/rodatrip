import { z } from "zod"

export const geoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export const createRouteSchema = z.object({
  name: z.string().min(1),
  origin: z.string().min(1),
  destination: z.string().min(1),
  distanceKm: z.number().min(0).optional(),
  durationHours: z.number().min(0).optional(),
  polyline: z.array(geoPointSchema).optional(),
  poiIds: z.array(z.string().uuid()).optional(),
})

export const updateRouteSchema = createRouteSchema.partial()

export type CreateRouteInput = z.infer<typeof createRouteSchema>
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>

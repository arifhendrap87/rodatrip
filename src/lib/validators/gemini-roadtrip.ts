import { z } from "zod"

const geminiNearbyRestaurantSchema = z.object({
  name: z.string().min(1),
  distance: z.string().optional(),
  price: z.string().optional(),
  maps_url: z.string().optional(),
})

const geminiNearbyHotelSchema = z.object({
  name: z.string().min(1),
  distance: z.string().optional(),
  price: z.string().optional(),
  maps_url: z.string().optional(),
  nearby_restaurants: z.array(geminiNearbyRestaurantSchema).optional(),
})

const geminiStopSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["alam", "kuliner", "budaya", "foto", "petualangan", "sejarah"]),
  province: z.string().min(1),
  city: z.string().optional(),
  description: z.string().optional(),
  ticket_price: z.string().optional(),
  parking_fee: z.string().optional(),
  visit_duration: z.string().optional(),
  best_visit_hour: z.string().optional(),
  additional_cost: z.string().optional(),
  spot_important_note: z.string().optional(),
  opening_hours: z.string().optional(),
  physical_effort: z.string().optional(),
  road_access: z.string().optional(),
  rating: z.number().optional(),
  image_url: z.string().optional(),
  tips: z.string().optional(),
  facilities: z.array(z.string()).optional(),
  nearby_hotels: z.array(geminiNearbyHotelSchema).optional(),
  nearby_restaurants: z.array(geminiNearbyRestaurantSchema).optional(),
})

export const geminiRoadtripSchema = z.object({
  title: z.string().min(1),
  province: z.string().optional(),
  city: z.string().optional(),
  itinerary_duration: z.string().optional(),
  total_distance: z.string().optional(),
  road_condition: z.string().optional(),
  estimated_cost: z.string().optional(),
  best_driving_time: z.string().optional(),
  route_facilities: z.array(z.string()).optional(),
  maps_embed_url: z.string().optional(),
  driving_safety_tips: z.string().optional(),
  culinary_notes: z.string().optional(),
  cover_image: z.string().optional(),
  stops: z.array(geminiStopSchema).min(1),
})

export type GeminiRoadtrip = z.infer<typeof geminiRoadtripSchema>
export type GeminiStop = z.infer<typeof geminiStopSchema>

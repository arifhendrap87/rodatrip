export interface POI {
  id: string
  name: string
  category: "spbu" | "kuliner" | "bengkel" | "spot_foto" | "info_jalan"
  latitude: number
  longitude: number
  rating: number
  address: string
  image_url?: string
  description?: string
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  image_url: string
  description: string
  rating: number
  margin_pct?: number
}

export interface Route {
  id: string
  name: string
  slug: string
  origin: string
  destination: string
  distance_km: number
  duration_hours?: number
  polyline: [number, number][]
  poi_ids?: string[]
}

export interface TripEstimate {
  bbm: number
  tol: number
  makan: number
  total: number
}

export interface NavLink {
  href: string
  label: string
}

export type SpotCategory = "alam" | "kuliner" | "budaya" | "foto" | "petualangan" | "sejarah"

export interface Spot {
  slug: string
  name: string
  category: SpotCategory
  province: string
  region: string
  location: { lat: number; lng: number }
  description: string
  whySpecial: string
  rating: number
  imageUrl: string
  imageCredit: string
  tags: string[]
  addedAt: Date
  tips: string
  bestTime: string
  openingHours: string
  estimatedTime: string
  ticketPrice: string
  roadAccess: string
  facilities: string[]
  distanceFromCity: string
  popularRoutes?: { from: string; duration: string }[]
  relatedProductIds?: string[]
}

export interface Itinerary {
  id: string
  slug: string
  title: string
  itineraryDuration?: string
  totalDistance?: string
  roadCondition?: string
  estimatedCost?: string
  bestDrivingTime?: string
  routeFacilities?: string[]
  mapsEmbedUrl?: string
  drivingSafetyTips?: string
  culinaryNotes?: string
  coverImage?: string
  stops: ItineraryStop[]
  isPublished?: boolean
  createdAt: string
  updatedAt: string
}

export interface ItineraryStop {
  id: string
  stopNumber: number
  name: string
  category?: string
  visitDuration?: string
  bestVisitHour?: string
  ticketPrice?: string
  parkingFee?: string
  additionalCost?: string
  physicalEffort?: string
  spotFacilities?: string[]
  spotImportantNote?: string
  description?: string
  spotSlug?: string
  lat?: number
  lng?: number
}

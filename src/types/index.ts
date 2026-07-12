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
  source?: string
  external_id?: string
  weight?: number
  dimensions?: string
  tokopedia_url?: string
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

export type SpotCategory = "alam" | "kuliner" | "budaya" | "foto" | "petualangan" | "sejarah" | "hotel" | "restaurant"

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
  coverImagePrompt?: string
  stops: ItineraryStop[]
  isPublished?: boolean
  createdAt: string
  updatedAt: string
}

export interface NearbyPlace {
  name: string
  distance?: string
  maps_url?: string
  price?: string
  nearby_restaurants?: NearbyPlace[]
}

export interface ImageItem {
  url: string
  alt?: string
  sort_order?: number
}

export interface ItineraryStop {
  id: string
  stopNumber: number
  name: string
  category?: string
  description?: string
  openingHours?: string
  facilities?: string[]
  roadAccess?: string
  rating?: number
  imageUrl?: string
  imagePrompt?: string
  province?: string
  tips?: string
  lat?: number
  lng?: number
  physicalEffort?: string
  ticketPrice?: string
  parkingFee?: string
  visitDuration?: string
  bestVisitHour?: string
  additionalCost?: string
  spotImportantNote?: string
  spotSlug?: string
  nearbyHotels?: NearbyPlace[]
  nearbyRestaurants?: NearbyPlace[]
  images?: ImageItem[]
}

import { db } from "./db"
import type { Itinerary, ItineraryStop } from "@/types"

export interface ItineraryRow {
  id: string
  slug: string
  title: string
  itinerary_duration: string | null
  total_distance: string | null
  road_condition: string | null
  estimated_cost: string | null
  best_driving_time: string | null
  route_facilities: string[] | null
  maps_embed_url: string | null
  driving_safety_tips: string | null
  culinary_notes: string | null
  cover_image: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

interface SpotJoin {
  id: string
  slug: string
  name: string
  category: string
  description: string | null
  ticket_price: string | null
  parking_fee: string | null
  physical_effort: string | null
  facilities: string[] | null
  location: { type: "Point"; coordinates: [number, number] } | null
}

export interface ItineraryStopRow {
  id: string
  itinerary_id: string
  stop_number: number
  name: string
  visit_duration: string | null
  best_visit_hour: string | null
  additional_cost: string | null
  spot_important_note: string | null
  spot_slug: string | null
  spot: SpotJoin | null
  created_at: string
  updated_at: string
}

function rowToItinerary(row: ItineraryRow, stops: ItineraryStopRow[]): Itinerary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    itineraryDuration: row.itinerary_duration || undefined,
    totalDistance: row.total_distance || undefined,
    roadCondition: row.road_condition || undefined,
    estimatedCost: row.estimated_cost || undefined,
    bestDrivingTime: row.best_driving_time || undefined,
    routeFacilities: row.route_facilities || undefined,
    mapsEmbedUrl: row.maps_embed_url || undefined,
    drivingSafetyTips: row.driving_safety_tips || undefined,
    culinaryNotes: row.culinary_notes || undefined,
    coverImage: row.cover_image || undefined,
    isPublished: row.is_published,
    stops: stops.map(stopToItineraryStop).sort((a, b) => a.stopNumber - b.stopNumber),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function getSpotCoordinates(spot: SpotJoin | null): { lat: number; lng: number } | null {
  if (spot?.location?.coordinates) {
    return { lng: spot.location.coordinates[0], lat: spot.location.coordinates[1] }
  }
  return null
}

function stopToItineraryStop(row: ItineraryStopRow): ItineraryStop {
  const s = row.spot
  return {
    id: row.id,
    stopNumber: row.stop_number,
    name: s?.name || row.name,
    category: s?.category || undefined,
    description: s?.description || undefined,
    ticketPrice: s?.ticket_price || undefined,
    parkingFee: s?.parking_fee || undefined,
    physicalEffort: s?.physical_effort || undefined,
    spotFacilities: s?.facilities || undefined,
    ...getSpotCoordinates(s),
    visitDuration: row.visit_duration || undefined,
    bestVisitHour: row.best_visit_hour || undefined,
    additionalCost: row.additional_cost || undefined,
    spotImportantNote: row.spot_important_note || undefined,
    spotSlug: row.spot_slug || undefined,
  }
}

async function getStopsForItinerary(itineraryId: string): Promise<ItineraryStopRow[]> {
  const { data } = await db
    .from("itinerary_stops")
    .select("id, itinerary_id, stop_number, name, visit_duration, best_visit_hour, additional_cost, spot_important_note, spot_slug, spot:spots!spot_slug(id, slug, name, category, description, ticket_price, parking_fee, physical_effort, facilities, location)")
    .eq("itinerary_id", itineraryId)
    .order("stop_number", { ascending: true })

  return (data || []) as ItineraryStopRow[]
}

export async function getItineraries(options?: {
  published?: boolean
}): Promise<Itinerary[]> {
  try {
    let query = db.from("itineraries").select("*")

    if (options?.published) {
      query = query.eq("is_published", true)
    }

    const { data, error } = await query.order("created_at", { ascending: false })
    if (error) return []

    const rows = data as ItineraryRow[]
    const itineraries: Itinerary[] = []

    for (const row of rows) {
      const stops = await getStopsForItinerary(row.id)
      itineraries.push(rowToItinerary(row, stops))
    }

    return itineraries
  } catch {
    return []
  }
}

export async function getItineraryBySlug(slug: string): Promise<Itinerary | null> {
  try {
    const { data: row, error } = await db
      .from("itineraries")
      .select("*")
      .eq("slug", slug)
      .single()

    if (error || !row) return null

    const stops = await getStopsForItinerary((row as ItineraryRow).id)
    return rowToItinerary(row as ItineraryRow, stops)
  } catch {
    return null
  }
}

export async function createItinerary(data: {
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
  isPublished?: boolean
  stops?: Omit<ItineraryStop, "id">[]
}): Promise<{ id: string; slug: string } | null> {
  try {
    const { data: row, error } = await db
      .from("itineraries")
      .insert({
        slug: data.slug,
        title: data.title,
        itinerary_duration: data.itineraryDuration || null,
        total_distance: data.totalDistance || null,
        road_condition: data.roadCondition || null,
        estimated_cost: data.estimatedCost || null,
        best_driving_time: data.bestDrivingTime || null,
        route_facilities: data.routeFacilities || null,
        maps_embed_url: data.mapsEmbedUrl || null,
        driving_safety_tips: data.drivingSafetyTips || null,
        culinary_notes: data.culinaryNotes || null,
        cover_image: data.coverImage || null,
        is_published: data.isPublished || false,
      })
      .select("id, slug")
      .single()

    if (error || !row) return null

    if (data.stops && data.stops.length > 0) {
      const stopRows = data.stops.map((stop) => ({
        itinerary_id: (row as { id: string }).id,
        stop_number: stop.stopNumber,
        name: stop.name,
        visit_duration: stop.visitDuration || null,
        best_visit_hour: stop.bestVisitHour || null,
        additional_cost: stop.additionalCost || null,
        spot_important_note: stop.spotImportantNote || null,
        spot_slug: stop.spotSlug || null,
      }))

      const { error: stopsError } = await db
        .from("itinerary_stops")
        .insert(stopRows)

      if (stopsError) return null
    }

    return row as { id: string; slug: string }
  } catch {
    return null
  }
}

export async function updateItinerary(
  slug: string,
  data: {
    title?: string
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
    isPublished?: boolean
    stops?: Omit<ItineraryStop, "id">[]
  }
): Promise<{ id: string; slug: string } | null> {
  try {
    const updateData: Record<string, unknown> = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.itineraryDuration !== undefined) updateData.itinerary_duration = data.itineraryDuration
    if (data.totalDistance !== undefined) updateData.total_distance = data.totalDistance
    if (data.roadCondition !== undefined) updateData.road_condition = data.roadCondition
    if (data.estimatedCost !== undefined) updateData.estimated_cost = data.estimatedCost
    if (data.bestDrivingTime !== undefined) updateData.best_driving_time = data.bestDrivingTime
    if (data.routeFacilities !== undefined) updateData.route_facilities = data.routeFacilities
    if (data.mapsEmbedUrl !== undefined) updateData.maps_embed_url = data.mapsEmbedUrl
    if (data.drivingSafetyTips !== undefined) updateData.driving_safety_tips = data.drivingSafetyTips
    if (data.culinaryNotes !== undefined) updateData.culinary_notes = data.culinaryNotes
    if (data.coverImage !== undefined) updateData.cover_image = data.coverImage
    if (data.isPublished !== undefined) updateData.is_published = data.isPublished

    const { data: row, error } = await db
      .from("itineraries")
      .update(updateData)
      .eq("slug", slug)
      .select("id, slug")
      .single()

    if (error || !row) return null

    if (data.stops !== undefined) {
      await db.from("itinerary_stops").delete().eq("itinerary_id", (row as { id: string }).id)

      if (data.stops.length > 0) {
        const stopRows = data.stops.map((stop) => ({
          itinerary_id: (row as { id: string }).id,
          stop_number: stop.stopNumber,
          name: stop.name,
          visit_duration: stop.visitDuration || null,
          best_visit_hour: stop.bestVisitHour || null,
          additional_cost: stop.additionalCost || null,
          spot_important_note: stop.spotImportantNote || null,
          spot_slug: stop.spotSlug || null,
        }))

        const { error: stopsError } = await db
          .from("itinerary_stops")
          .insert(stopRows)

        if (stopsError) return null
      }
    }

    return row as { id: string; slug: string }
  } catch {
    return null
  }
}

export async function deleteItinerary(slug: string): Promise<boolean> {
  try {
    const { error } = await db
      .from("itineraries")
      .delete()
      .eq("slug", slug)

    return !error
  } catch {
    return false
  }
}

export async function getItinerariesBySpotSlug(spotSlug: string): Promise<Itinerary[]> {
  try {
    const { data: stops } = await db
      .from("itinerary_stops")
      .select("itinerary_id")
      .eq("spot_slug", spotSlug)

    if (!stops || stops.length === 0) return []

    const itineraryIds = [...new Set(stops.map((s: { itinerary_id: string }) => s.itinerary_id))]

    const { data: rows } = await db
      .from("itineraries")
      .select("*")
      .in("id", itineraryIds)
      .eq("is_published", true)

    if (!rows) return []

    const itineraries: Itinerary[] = []
    for (const row of rows as ItineraryRow[]) {
      const stopRows = await getStopsForItinerary(row.id)
      itineraries.push(rowToItinerary(row, stopRows))
    }

    return itineraries
  } catch {
    return []
  }
}

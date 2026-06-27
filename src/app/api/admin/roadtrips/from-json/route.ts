import { success, badRequest, unauthorized, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { adminLimiter } from "@/lib/api/rate-limit"
import { geminiRoadtripSchema } from "@/lib/validators/gemini-roadtrip"
import { db } from "@/lib/services/db"

const PROVINCE_TO_REGION: Record<string, string> = {
  "Jawa Barat": "Jawa",
  "Jawa Tengah": "Jawa",
  "DIY": "Jawa",
  "Jawa Timur": "Jawa",
  "Banten": "Jawa",
  "Bali": "Bali & Nusa Tenggara",
  "Nusa Tenggara Barat": "Bali & Nusa Tenggara",
  "Nusa Tenggara Timur": "Bali & Nusa Tenggara",
  "Sumatera Utara": "Sumatera",
  "Sumatera Barat": "Sumatera",
  "Lampung": "Sumatera",
  "Sulawesi Utara": "Sulawesi",
  "Sulawesi Selatan": "Sulawesi",
  "Kalimantan Timur": "Kalimantan",
}

const PROVINCE_COORDS: Record<string, { lat: number; lng: number }> = {
  "Jawa Barat": { lat: -6.9175, lng: 107.6191 },
  "Jawa Tengah": { lat: -7.1509, lng: 110.1403 },
  "DIY": { lat: -7.7971, lng: 110.3702 },
  "Jawa Timur": { lat: -7.5361, lng: 112.2384 },
  "Banten": { lat: -6.1214, lng: 106.1500 },
  "Bali": { lat: -8.3405, lng: 115.0920 },
  "Nusa Tenggara Barat": { lat: -8.6529, lng: 117.3617 },
  "Nusa Tenggara Timur": { lat: -9.6994, lng: 124.0571 },
  "Sumatera Utara": { lat: 3.5952, lng: 98.6722 },
  "Sumatera Barat": { lat: -0.7399, lng: 100.3519 },
  "Lampung": { lat: -5.4511, lng: 105.2643 },
  "Sulawesi Utara": { lat: 1.4748, lng: 124.8421 },
  "Sulawesi Selatan": { lat: -5.1477, lng: 119.4312 },
  "Kalimantan Timur": { lat: -1.1516, lng: 116.5805 },
}

function generateSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

function getRegion(province: string): string {
  return PROVINCE_TO_REGION[province] || "Jawa"
}

function getCoords(province: string): { lat: number; lng: number } {
  return PROVINCE_COORDS[province] || { lat: -6.2, lng: 106.8 }
}

function transformStopForDb(stop: Record<string, unknown>, province: string) {
  const { nearby_hotels, nearby_restaurants, ...fields } = stop
  const name = (fields.name as string) || ""
  const description = (fields.description as string) || name
  const coords = getCoords(province)
  return {
    ...fields,
    description,
    why_special: description,
    location: `POINT(${coords.lng} ${coords.lat})`,
    region: getRegion(province),
    city: (fields.city as string) || null,
    nearby_hotels_jsonb: nearby_hotels || [],
    nearby_restaurants_jsonb: nearby_restaurants || [],
  }
}

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = await adminLimiter(`roadtrip-import:${ip}`)
  if (!allowed) return unauthorized("Rate limited")

  const body = await request.json()
  const parsed = geminiRoadtripSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest(parsed.error.issues.map(e => `[${e.path.join(".")}] ${e.message}`).join("; "))
  }

  const { stops, ...itineraryFields } = parsed.data
  const itinerarySlug = generateSlug(parsed.data.title)

  const spotResults: { stopNumber: number; name: string; slug: string; status: string }[] = []

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i]
    const slug = generateSlug(stop.name)

    const { data: existing } = await db
      .from("spots")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle()

    if (existing) {
      spotResults.push({ stopNumber: i + 1, name: stop.name, slug, status: "skipped (already exists)" })
      continue
    }

    const insertData: Record<string, unknown> = {
      ...transformStopForDb(stop as unknown as Record<string, unknown>, stop.province),
      slug,
      tags: [stop.category],
    }

    const { error } = await db
      .from("spots")
      .insert(insertData)
      .select("slug")
      .single()

    if (error) {
      return internalError(`Gagal membuat spot "${stop.name}": ${error.message}`)
    }

    spotResults.push({ stopNumber: i + 1, name: stop.name, slug, status: "created" })
  }

  const allSpotSlugs = stops.map((stop, i) => {
    const slug = generateSlug(stop.name)
    return { stopNumber: i + 1, spotSlug: slug }
  })

  const { data: existingItinerary } = await db
    .from("itineraries")
    .select("slug")
    .eq("slug", itinerarySlug)
    .maybeSingle()

  if (existingItinerary) {
    return success({
      itinerary: { slug: itinerarySlug, status: "skipped (already exists)" },
      spots: spotResults,
    })
  }

  const firstStop = stops[0]
  const { data: itinerary, error: itError } = await db
    .from("itineraries")
    .insert({
      slug: itinerarySlug,
      title: itineraryFields.title,
      province: itineraryFields.province || firstStop?.province || null,
      city: itineraryFields.city || firstStop?.city || null,
      itinerary_duration: itineraryFields.itinerary_duration || null,
      total_distance: itineraryFields.total_distance || null,
      road_condition: itineraryFields.road_condition || null,
      estimated_cost: itineraryFields.estimated_cost || null,
      best_driving_time: itineraryFields.best_driving_time || null,
      route_facilities: itineraryFields.route_facilities || null,
      maps_embed_url: itineraryFields.maps_embed_url || null,
      driving_safety_tips: itineraryFields.driving_safety_tips || null,
      culinary_notes: itineraryFields.culinary_notes || null,
      cover_image: itineraryFields.cover_image || null,
      is_published: false,
    })
    .select("id, slug")
    .single()

  if (itError || !itinerary) {
    return internalError(`Gagal membuat itinerary: ${itError?.message}`)
  }

  const stopRows = allSpotSlugs.map((s) => ({
    itinerary_id: itinerary.id,
    stop_number: s.stopNumber,
    spot_slug: s.spotSlug,
  }))

  const { error: stopsError } = await db
    .from("itinerary_stops")
    .insert(stopRows)

  if (stopsError) {
    return internalError(`Gagal menautkan stops: ${stopsError.message}`)
  }

  const { logAudit } = await import("@/lib/api/audit")
  await logAudit({
    userId: admin.id,
    action: "CREATE",
    entityType: "itineraries",
    entityId: itinerary.id,
    newValue: { source: "gemini-import", title: itineraryFields.title, spots: stops.length },
  })

  return success({
    itinerary: { id: itinerary.id, slug: itinerary.slug, status: "created" },
    spots: spotResults,
  })
}

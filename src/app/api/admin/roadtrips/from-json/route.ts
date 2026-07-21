import { success, rateLimited, badRequest, unauthorized, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { adminLimiter } from "@/lib/api/rate-limit"
import { geminiRoadtripSchema } from "@/lib/validators/gemini-roadtrip"
import { db } from "@/lib/services/db"
import { findDuplicateSpot } from "@/lib/utils/detect-duplicate-spot"

const PROVINCE_TO_REGION: Record<string, string> = {
  "Aceh": "Sumatera",
  "Sumatera Utara": "Sumatera",
  "Sumatera Barat": "Sumatera",
  "Riau": "Sumatera",
  "Kepulauan Riau": "Sumatera",
  "Jambi": "Sumatera",
  "Sumatera Selatan": "Sumatera",
  "Bengkulu": "Sumatera",
  "Lampung": "Sumatera",
  "Bangka Belitung": "Sumatera",
  "DKI Jakarta": "Jawa",
  "Jawa Barat": "Jawa",
  "Jawa Tengah": "Jawa",
  "DIY": "Jawa",
  "Jawa Timur": "Jawa",
  "Banten": "Jawa",
  "Bali": "Bali & Nusa Tenggara",
  "Nusa Tenggara Barat": "Bali & Nusa Tenggara",
  "Nusa Tenggara Timur": "Bali & Nusa Tenggara",
  "Kalimantan Barat": "Kalimantan",
  "Kalimantan Tengah": "Kalimantan",
  "Kalimantan Selatan": "Kalimantan",
  "Kalimantan Timur": "Kalimantan",
  "Kalimantan Utara": "Kalimantan",
  "Sulawesi Utara": "Sulawesi",
  "Sulawesi Tengah": "Sulawesi",
  "Sulawesi Selatan": "Sulawesi",
  "Sulawesi Tenggara": "Sulawesi",
  "Gorontalo": "Sulawesi",
  "Sulawesi Barat": "Sulawesi",
  "Maluku": "Maluku",
  "Maluku Utara": "Maluku",
  "Papua": "Papua",
  "Papua Barat": "Papua",
  "Papua Barat Daya": "Papua",
  "Papua Pegunungan": "Papua",
  "Papua Selatan": "Papua",
  "Papua Tengah": "Papua",
}

const PROVINCE_COORDS: Record<string, { lat: number; lng: number }> = {
  "Aceh": { lat: 4.6951, lng: 96.7494 },
  "Sumatera Utara": { lat: 2.1154, lng: 99.5451 },
  "Sumatera Barat": { lat: -0.7399, lng: 100.3519 },
  "Riau": { lat: 0.5797, lng: 102.1510 },
  "Kepulauan Riau": { lat: -0.1547, lng: 104.5820 },
  "Jambi": { lat: -1.5879, lng: 103.0039 },
  "Sumatera Selatan": { lat: -3.3194, lng: 104.3737 },
  "Bengkulu": { lat: -3.8005, lng: 102.2562 },
  "Lampung": { lat: -5.4511, lng: 105.2643 },
  "Bangka Belitung": { lat: -2.7411, lng: 106.4406 },
  "DKI Jakarta": { lat: -6.2088, lng: 106.8456 },
  "Jawa Barat": { lat: -6.9175, lng: 107.6191 },
  "Jawa Tengah": { lat: -7.1509, lng: 110.1403 },
  "DIY": { lat: -7.7971, lng: 110.3702 },
  "Jawa Timur": { lat: -7.5361, lng: 112.2384 },
  "Banten": { lat: -6.1214, lng: 106.1500 },
  "Bali": { lat: -8.3405, lng: 115.0920 },
  "Nusa Tenggara Barat": { lat: -8.6529, lng: 117.3617 },
  "Nusa Tenggara Timur": { lat: -9.6994, lng: 124.0571 },
  "Kalimantan Barat": { lat: -0.3150, lng: 110.4226 },
  "Kalimantan Tengah": { lat: -1.6818, lng: 113.3823 },
  "Kalimantan Selatan": { lat: -3.0914, lng: 115.2836 },
  "Kalimantan Timur": { lat: -1.1516, lng: 116.5805 },
  "Kalimantan Utara": { lat: 2.9309, lng: 116.5604 },
  "Sulawesi Utara": { lat: 1.4748, lng: 124.8421 },
  "Sulawesi Tengah": { lat: -1.4300, lng: 121.4456 },
  "Sulawesi Selatan": { lat: -5.1477, lng: 119.4312 },
  "Sulawesi Tenggara": { lat: -4.0839, lng: 122.0702 },
  "Gorontalo": { lat: 0.6092, lng: 122.3578 },
  "Sulawesi Barat": { lat: -2.8441, lng: 119.2315 },
  "Maluku": { lat: -3.2385, lng: 130.1135 },
  "Maluku Utara": { lat: 0.6303, lng: 127.5252 },
  "Papua": { lat: -4.2699, lng: 138.0804 },
  "Papua Barat": { lat: -1.3361, lng: 133.1745 },
  "Papua Barat Daya": { lat: -1.1925, lng: 132.5081 },
  "Papua Pegunungan": { lat: -4.4997, lng: 139.4761 },
  "Papua Selatan": { lat: -6.5059, lng: 139.9347 },
  "Papua Tengah": { lat: -3.8587, lng: 136.2387 },
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
  const { nearby_hotels, nearby_restaurants, lat, lng, ...fields } = stop
  const name = (fields.name as string) || ""
  const description = (fields.description as string) || name
  const coords = (lat && lng)
    ? { lat: Number(lat), lng: Number(lng) }
    : getCoords(province)
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
  if (!allowed) return rateLimited(30)

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

    // Cek duplicate by slug
    const { data: existing } = await db
      .from("spots")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle()

    if (existing) {
      spotResults.push({ stopNumber: i + 1, name: stop.name, slug, status: "skipped (already exists)" })
      continue
    }

    // Cek duplicate by nama mirip + koordinat
    const duplicate = await findDuplicateSpot(stop.name, stop.lat as number | undefined, stop.lng as number | undefined)
    if (duplicate) {
      spotResults.push({ stopNumber: i + 1, name: stop.name, slug: `${generateSlug(stop.name)} (duplicate of: ${duplicate.slug})`, status: `skipped (similar to: ${duplicate.name} — ${duplicate.matchType})` })
      continue
    }

    const insertData: Record<string, unknown> = {
      ...transformStopForDb(stop as unknown as Record<string, unknown>, stop.province),
      slug,
      tags: [stop.category],
      is_published: false,
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

  const allSpotSlugs = spotResults.map((r) => ({
    stopNumber: r.stopNumber,
    spotSlug: r.slug,
  }))

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

  const { data: itinerary, error: itError } = await db
    .from("itineraries")
    .insert({
      slug: itinerarySlug,
      title: itineraryFields.title,
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
      prompt_gambar: null,
      cover_image_prompt: itineraryFields.cover_image_prompt || null,
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

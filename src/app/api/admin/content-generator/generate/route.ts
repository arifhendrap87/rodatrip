import { success, badRequest, unauthorized, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"
import { renderTemplate, generateAIPrompt, getAutoTone } from "@/app/admin/content-generator/data"

const PLATFORMS = ["facebook", "instagram", "tiktok"] as const

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const body = await request.json()
  const { sourceType, sourceId, platforms } = body

  if (!sourceType || !["roadtrip", "spot", "blog"].includes(sourceType)) {
    return badRequest("sourceType harus 'roadtrip', 'spot', atau 'blog'")
  }
  if (!sourceId) {
    return badRequest("sourceId wajib diisi")
  }
  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    return badRequest("platforms wajib diisi (array)")
  }

  const invalidPlatforms = platforms.filter((p: string) => !PLATFORMS.includes(p as any))
  if (invalidPlatforms.length > 0) {
    return badRequest(`Platform tidak valid: ${invalidPlatforms.join(", ")}`)
  }

  let source: Record<string, unknown> | null = null

  if (sourceType === "spot") {
    const { data } = await db.from("spots").select("*").eq("slug", sourceId).maybeSingle()
    source = data
    if (!source) return badRequest(`Spot dengan slug "${sourceId}" tidak ditemukan`)
  } else if (sourceType === "blog") {
    const { data } = await db.from("blog_posts").select("*").eq("slug", sourceId).maybeSingle()
    source = data
    if (!source) return badRequest(`Blog dengan slug "${sourceId}" tidak ditemukan`)
  } else {
    const { data } = await db.from("itineraries").select("*, itinerary_stops(*, spot:spots(*))").eq("slug", sourceId).maybeSingle()
    source = data
    if (!source) return badRequest(`Roadtrip dengan slug "${sourceId}" tidak ditemukan`)
  }

  const contentSource = sourceType === "spot" ? {
    type: "spot" as const,
    id: source!.slug as string,
    title: source!.name as string,
    description: source!.description as string,
    whySpecial: source!.why_special as string,
    category: source!.category as string,
    province: source!.province as string,
    city: source!.city as string,
    region: source!.region as string,
    price: source!.ticket_price as string,
    parkingFee: source!.parking_fee as string,
    additionalCost: source!.additional_cost as string,
    tips: source!.tips as string,
    rating: source!.rating as number,
    bestTime: source!.best_time as string,
    bestVisitHour: source!.best_visit_hour as string,
    visitDuration: source!.visit_duration as string,
    physicalEffort: source!.physical_effort as string,
    openingHours: source!.opening_hours as string,
    roadAccess: source!.road_access as string,
    spotImportantNote: source!.spot_important_note as string,
    distanceFromCity: source!.distance_from_city as string,
    facilities: source!.facilities as string[],
    popularRoutes: source!.popular_routes as { from: string; duration: string }[],
    nearbyHotels: JSON.stringify(source!.nearby_hotels_jsonb || source!.nearby_hotels || []),
    nearbyRestaurants: JSON.stringify(source!.nearby_restaurants_jsonb || source!.nearby_restaurants || []),
    images: source!.images as { url: string; alt?: string }[],
  } : sourceType === "blog" ? {
    type: "spot" as const,
    id: source!.slug as string,
    title: source!.title as string,
    description: source!.excerpt as string || source!.content as string,
    whySpecial: "",
    category: source!.category as string,
    province: "",
    city: "",
    region: "",
    price: "",
    parkingFee: "",
    additionalCost: "",
    tips: source!.content ? ((source!.content as string).replace(/<[^>]+>/g, "").slice(0, 300)) : "",
    rating: 0,
    bestTime: "",
    bestVisitHour: "",
    visitDuration: "",
    physicalEffort: "",
    openingHours: "",
    roadAccess: "",
    spotImportantNote: "",
    distanceFromCity: "",
    facilities: [],
    popularRoutes: [],
    nearbyHotels: "",
    nearbyRestaurants: "",
    images: source!.image_url ? [{ url: source!.image_url as string }] : [],
  } : {
    type: "roadtrip" as const,
    id: source!.slug as string,
    title: source!.title as string,
    description: (source!.description as string) || (source!.driving_safety_tips as string),
    province: (source as any)?.stops?.[0]?.spot?.province as string,
    city: (source as any)?.stops?.[0]?.spot?.city as string,
    duration: source!.itinerary_duration as string,
    totalDistance: source!.total_distance as string,
    estimatedCost: source!.estimated_cost as string,
    tips: source!.driving_safety_tips as string,
    stops: ((source as any)?.itinerary_stops || []).map((is: any) => ({
      name: is.spot?.name || "",
      category: is.spot?.category || "",
    })).filter((s: any) => s.name),
  }

  const results: Record<string, { caption: string; hashtags: string; skrip_tiktok: string; visual_prompt: string }> = {}

  for (const platform of platforms) {
    const tone = getAutoTone(contentSource)
    const prompt = generateAIPrompt(contentSource, platform, tone)
    try {
      const aiRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/ai/generate-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
      const aiData = await aiRes.json()
      const caption = aiData?.data?.text || ""
      if (platform === "tiktok") {
        results[platform] = { caption: "", hashtags: "", skrip_tiktok: caption, visual_prompt: "" }
      } else {
        const template = renderTemplate(contentSource, platform, tone)
        results[platform] = { caption, hashtags: template.hashtags, skrip_tiktok: "", visual_prompt: "" }
      }
    } catch {
      results[platform] = renderTemplate(contentSource, platform, tone)
    }
  }

  return success({
    source: contentSource,
    results,
  })
}

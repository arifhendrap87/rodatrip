import { success, badRequest, unauthorized, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"
import { generateViralPrompt } from "@/app/admin/content-generator/data"
import type { ContentSource } from "@/app/admin/content-generator/data"

const API_KEY = process.env.DEEPSEEK_API_KEY
const API_URL = "https://api.deepseek.com/chat/completions"

async function callDeepSeek(prompt: string): Promise<string> {
  if (!API_KEY) throw new Error("AI API key not configured")
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "Kamu adalah content writer RodaTrip. Output HANYA JSON valid." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 2048,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || `AI API error (${res.status})`)
  return data?.choices?.[0]?.message?.content || ""
}

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const body = await request.json()
  const { sourceType, sourceId, slideCount = 5 } = body

  if (!sourceType || !["roadtrip", "spot", "blog"].includes(sourceType)) {
    return badRequest("sourceType harus 'roadtrip', 'spot', atau 'blog'")
  }
  if (!sourceId) return badRequest("sourceId wajib diisi")

  let source: Record<string, unknown> | null = null

  if (sourceType === "spot") {
    const { data } = await db.from("spots").select("*").eq("slug", sourceId).maybeSingle()
    source = data
    if (!source) return badRequest("Spot tidak ditemukan")
  } else if (sourceType === "blog") {
    const { data } = await db.from("blog_posts").select("*").eq("slug", sourceId).maybeSingle()
    source = data
    if (!source) return badRequest("Blog tidak ditemukan")
  } else {
    const { data } = await db.from("itineraries").select("*, itinerary_stops(*, spot:spots(*))").eq("slug", sourceId).maybeSingle()
    source = data
    if (!source) return badRequest("Roadtrip tidak ditemukan")
  }

  const contentSource: ContentSource = sourceType === "spot" ? {
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
    description: (source!.excerpt as string) || (source!.content as string),
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

  const prompt = generateViralPrompt(contentSource, slideCount)

  try {
    const aiText = await callDeepSeek(prompt)
    let parsed: Record<string, unknown> = {}
    try {
      const cleaned = aiText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim()
      parsed = JSON.parse(cleaned)
    } catch {
      return success({ data: { text_overlays: [], image_prompts: [], caption: aiText.slice(0, 150), hashtags: "" } })
    }

    return success({
      data: {
        text_overlays: (parsed.text_overlays as string[]) || [],
        image_prompts: (parsed.image_prompts as string[]) || [],
        caption: (parsed.caption as string) || "",
        hashtags: (parsed.hashtags as string) || "",
      },
    })
  } catch (err) {
    return internalError(err instanceof Error ? err.message : "Gagal generate carousel")
  }
}

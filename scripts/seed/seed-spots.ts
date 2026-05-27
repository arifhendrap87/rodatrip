import { spots } from "../../src/data/spots"
import { supabase, log, divider } from "./config"

export async function seedSpots() {
  log("🏞️", "Seeding spots...")

  let inserted = 0
  let skipped = 0
  let errors = 0

  for (const spot of spots) {
    const { data: existing } = await supabase
      .from("spots")
      .select("id")
      .eq("slug", spot.slug)
      .maybeSingle()

    if (existing) {
      skipped++
      continue
    }

    const { error } = await supabase.from("spots").insert({
      slug: spot.slug,
      name: spot.name,
      category: spot.category,
      province: spot.province,
      region: spot.region,
      location: `POINT(${spot.location.lng} ${spot.location.lat})`,
      description: spot.description,
      why_special: spot.whySpecial || "",
      rating: spot.rating || null,
      image_url: spot.imageUrl || null,
      image_credit: spot.imageCredit || "Unsplash",
      tags: spot.tags || [],
      tips: spot.tips || null,
      best_time: spot.bestTime || null,
      opening_hours: spot.openingHours || null,
      estimated_time: spot.estimatedTime || null,
      ticket_price: spot.ticketPrice || null,
      road_access: spot.roadAccess || null,
      facilities: spot.facilities || [],
      distance_from_city: spot.distanceFromCity || null,
      popular_routes: spot.popularRoutes ? JSON.parse(JSON.stringify(spot.popularRoutes)) : [],
      is_featured: false,
      view_count: 0,
    })

    if (error) {
      log("❌", `Failed to insert spot "${spot.name}": ${error.message}`)
      errors++
    } else {
      inserted++
    }
  }

  divider()
  log("📊", `Spots: ${inserted} inserted, ${skipped} skipped, ${errors} errors`)
  return { inserted, skipped, errors }
}

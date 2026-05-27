import { mockRoutes } from "../../src/lib/mock/routes"
import { supabase, log, divider } from "./config"

export async function seedRoutes() {
  log("🗺️", "Seeding routes...")

  let inserted = 0
  let skipped = 0
  let errors = 0

  for (const route of mockRoutes) {
    const { data: existing } = await supabase
      .from("routes")
      .select("id")
      .eq("slug", route.slug)
      .maybeSingle()

    if (existing) {
      skipped++
      continue
    }

    const distanceKm = route.distance_km
    const durationHours = Math.round((distanceKm / 60) * 10) / 10

    const { error } = await supabase.from("routes").insert({
      slug: route.slug,
      name: route.name,
      origin: route.origin,
      destination: route.destination,
      distance_km: distanceKm,
      duration_hours: durationHours,
      polyline: route.polyline,
    })

    if (error) {
      log("❌", `Failed to insert route "${route.name}": ${error.message}`)
      errors++
    } else {
      inserted++
    }
  }

  divider()
  log("📊", `Routes: ${inserted} inserted, ${skipped} skipped, ${errors} errors`)
  return { inserted, skipped, errors }
}

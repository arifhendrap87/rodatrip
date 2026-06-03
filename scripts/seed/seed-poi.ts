import { mockPOI } from "../../src/lib/mock/poi"
import { supabase, log, divider } from "./config"

export async function seedPOI() {
  log("📍", "Seeding POI...")

  let inserted = 0
  let skipped = 0
  let errors = 0

  for (const poi of mockPOI) {
    const { data: existing } = await supabase
      .from("poi")
      .select("id")
      .eq("name", poi.name)
      .maybeSingle()

    if (existing) {
      skipped++
      continue
    }

    const { error } = await supabase.from("poi").insert({
      name: poi.name,
      category: poi.category,
      location: `POINT(${poi.longitude} ${poi.latitude})`,
      address: poi.address || null,
      rating: poi.rating || null,
      image_url: (poi as Record<string, unknown>).image_url || null,
      verified: false,
    })

    if (error) {
      log("❌", `Failed to insert POI "${poi.name}": ${error.message}`)
      errors++
    } else {
      inserted++
    }
  }

  divider()
  log("📊", `POI: ${inserted} inserted, ${skipped} skipped, ${errors} errors`)
  return { inserted, skipped, errors }
}

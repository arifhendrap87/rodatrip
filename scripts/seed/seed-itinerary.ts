import { supabase, log, divider } from "./config"

export async function seedItinerary() {
  log("🏎️", "Seeding roadtrip itineraries...")
  log("⏭️", "Kosong — isi melalui CMS Admin > Roadtrips")
  divider()
  log("📊", "Itineraries: 0 inserted, 0 skipped, 0 errors")
  return { inserted: 0, skipped: 0, errors: 0 }
}

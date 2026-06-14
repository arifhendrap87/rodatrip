import { supabase, log, divider } from "./config"

export async function seedSpots() {
  log("🏞️", "Seeding spots...")
  log("⏭️", "Kosong — isi melalui CMS Admin > Spots")
  divider()
  log("📊", "Spots: 0 inserted, 0 skipped, 0 errors")
  return { inserted: 0, skipped: 0, errors: 0 }
}

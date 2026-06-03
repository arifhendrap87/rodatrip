import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const cache = JSON.parse(fs.readFileSync(path.resolve("scripts/seed/image-urls.json"), "utf-8"))

async function main() {
  console.log("")
  console.log("  ╔═══════════════════════════════════════════╗")
  console.log("  ║   Update image_url in Supabase            ║")
  console.log("  ╚═══════════════════════════════════════════╝")
  console.log("")

  // Update spots by slug
  let spotUpdated = 0
  for (const [slug, url] of Object.entries(cache.spots) as [string, string][]) {
    const { error } = await supabase.from("spots").update({ image_url: url }).eq("slug", slug)
    if (!error) spotUpdated++
    else console.log(`  ⚠️ Spot "${slug}": ${error.message}`)
  }
  console.log(`  🏞️  Spots: ${spotUpdated}/${Object.keys(cache.spots).length} updated`)

  // Update products by id
  let prodUpdated = 0
  for (const [id, url] of Object.entries(cache.products) as [string, string][]) {
    const { error } = await supabase.from("products").update({ image_url: url }).eq("id", id)
    if (!error) prodUpdated++
    else console.log(`  ⚠️ Product "${id}": ${error.message}`)
  }
  console.log(`  🛒 Products: ${prodUpdated}/${Object.keys(cache.products).length} updated`)

  // Update POI by name (mock id like "spbu-1" doesn't match DB UUID)
  const poiNameMap: Record<string, string> = {
    "spbu-1": "SPBU Pertamina Km 45",
    "spbu-2": "SPBU Shell Cikampek",
    "spbu-3": "SPBU Pertamina Nagreg",
    "spbu-4": "SPBU BP Baturraden",
    "spbu-5": "SPBU Pertamina Sleman",
    "kuliner-1": "Sate Maranggi Cianjur",
    "kuliner-2": "Nasi Jamblang Mang Eman",
    "kuliner-3": "Ayam Goreng Suharti",
    "kuliner-4": "Gudeg Yu Djum",
    "kuliner-5": "Bakso Solo Samrat",
    "bengkel-1": "Bengkel Aki & Ban Karawang",
    "bengkel-2": "Auto2000 Cirebon",
    "bengkel-3": "Bengkel Las & Rantas Purwokerto",
    "spot-1": "Telaga Warna",
    "spot-2": "Kebun Teh Walini",
    "spot-3": "Curug Ciputri",
    "spot-4": "Ladang Jagung Gamblok",
    "spot-5": "Malioboro Night",
    "info-1": "⚠️ Perbaikan Jalan Km 80",
    "info-2": "⚠️ Longsor Cimanggung",
    "info-3": "⚠️ Banjir Genangan Brebes",
  }
  let poiUpdated = 0
  for (const [id, url] of Object.entries(cache.poi) as [string, string][]) {
    const name = poiNameMap[id]
    if (!name) continue
    const { error } = await supabase.from("poi").update({ image_url: url }).eq("name", name)
    if (!error) poiUpdated++
    else console.log(`  ⚠️ POI "${name}": ${error.message}`)
  }
  console.log(`  📍 POI: ${poiUpdated}/${Object.keys(cache.poi).length} updated`)

  // Update blog by slug
  let blogUpdated = 0
  for (const [slug, url] of Object.entries(cache.blog) as [string, string][]) {
    const { error } = await supabase.from("blog_posts").update({ image_url: url }).eq("slug", slug)
    if (!error) blogUpdated++
    else console.log(`  ⚠️ Blog "${slug}": ${error.message}`)
  }
  console.log(`  📝 Blog: ${blogUpdated}/${Object.keys(cache.blog).length} updated`)

  console.log("")
  console.log("  ✅ Done!")
  console.log("")
}

main()

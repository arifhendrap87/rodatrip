import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const BUCKET = process.env.CLOUDFLARE_R2_PUBLIC_BUCKET || "gaskuy-spot-images"
const PREFIX = "dev"

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const R2_BASE = `https://${BUCKET}.r2.cloudflarestorage.com/${PREFIX}`

async function main() {
  console.log("")
  console.log("  ╔═══════════════════════════════════════╗")
  console.log("  ║     Update image_url to R2 URLs      ║")
  console.log("  ╚═══════════════════════════════════════╝")
  console.log("")

  // Update spots
  const { data: spots, error: spotErr } = await supabase.from("spots").select("id, slug, image_url")
  if (spotErr) { console.error("  ❌ Spots fetch error:", spotErr.message); return }

  let spotUpdated = 0
  for (const spot of spots) {
    if (!spot.image_url || spot.image_url.startsWith("http")) continue
    const filename = spot.image_url.split("/").pop()
    const newUrl = `${R2_BASE}/spots/${filename}`
    const { error } = await supabase.from("spots").update({ image_url: newUrl }).eq("id", spot.id)
    if (!error) spotUpdated++
  }

  console.log(`  🏞️ Spots: ${spotUpdated}/${spots.length} updated`)

  // Update products
  const { data: products, error: prodErr } = await supabase.from("products").select("id, slug, image_url")
  if (prodErr) { console.error("  ❌ Products fetch error:", prodErr.message); return }

  let prodUpdated = 0
  for (const product of products) {
    if (!product.image_url || product.image_url.startsWith("http")) continue
    const filename = product.image_url.split("/").pop()
    const newUrl = `${R2_BASE}/products/${filename}`
    const { error } = await supabase.from("products").update({ image_url: newUrl }).eq("id", product.id)
    if (!error) prodUpdated++
  }

  console.log(`  🛒 Products: ${prodUpdated}/${products.length} updated`)
  console.log("")
  console.log("  ✅ Done!")
  console.log("")
}

main()

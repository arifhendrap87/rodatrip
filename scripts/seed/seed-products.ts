import { mockProducts } from "../../src/lib/mock/products"
import { supabase, log, divider } from "./config"

export async function seedProducts() {
  log("🛒", "Seeding products...")

  let inserted = 0
  let skipped = 0
  let errors = 0

  for (const product of mockProducts) {
    const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle()

    if (existing) {
      skipped++
      continue
    }

    const { error } = await supabase.from("products").insert({
      slug,
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      image_url: product.image_url || null,
      rating: product.rating || null,
      stock_quantity: 10,
    })

    if (error) {
      log("❌", `Failed to insert product "${product.name}": ${error.message}`)
      errors++
    } else {
      inserted++
    }
  }

  divider()
  log("📊", `Products: ${inserted} inserted, ${skipped} skipped, ${errors} errors`)
  return { inserted, skipped, errors }
}

import { seedSpots } from "./seed-spots"
import { seedProducts } from "./seed-products"
import { seedPOI } from "./seed-poi"
import { seedRoutes } from "./seed-routes"
import { seedBlog } from "./seed-blog"

async function main() {
  console.log("")
  console.log("  ╔═══════════════════════════════════════╗")
  console.log("  ║       Gaskuy — Database Seeder        ║")
  console.log("  ╚═══════════════════════════════════════╝")
  console.log("")

  const results = {
    spots: await seedSpots(),
    products: await seedProducts(),
    poi: await seedPOI(),
    routes: await seedRoutes(),
    blog: await seedBlog(),
  }

  console.log("")
  console.log("  ╔═══════════════════════════════════════╗")
  console.log("  ║            Final Summary              ║")
  console.log("  ╚═══════════════════════════════════════╝")
  console.log("")

  const totalInserted = Object.values(results).reduce((sum, r) => sum + r.inserted, 0)
  const totalSkipped = Object.values(results).reduce((sum, r) => sum + r.skipped, 0)
  const totalErrors = Object.values(results).reduce((sum, r) => sum + r.errors, 0)

  for (const [key, val] of Object.entries(results)) {
    const icon = { spots: "🏞️", products: "🛒", poi: "📍", routes: "🗺️", blog: "📝" }[key] || "•"
    console.log(`  ${icon} ${key.padEnd(10)} → ${val.inserted} inserted, ${val.skipped} skipped, ${val.errors} errors`)
  }

  console.log("")
  console.log(`  ${"─".repeat(50)}`)
  console.log(`  📊 Total: ${totalInserted} inserted | ${totalSkipped} skipped | ${totalErrors} errors`)
  console.log("")

  if (totalErrors > 0) {
    console.log("  ⚠️  Some errors occurred. Check logs above.")
    process.exit(1)
  }

  console.log("  ✅ Seed completed successfully!")
  console.log("")
}

main().catch((err) => {
  console.error("  ❌ Fatal error:", err.message)
  process.exit(1)
})

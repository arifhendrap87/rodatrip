/**
 * Sync database from staging to production
 * Usage: npx tsx scripts/seed/sync-staging-to-prod.ts
 *
 * Reads from .env.local (staging). Production credentials from env vars:
 *   PROD_SUPABASE_URL, PROD_SUPABASE_SERVICE_KEY
 * WARNING: This will OVERWRITE production data with staging data.
 */

import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const PROD_URL = process.env.PROD_SUPABASE_URL
const PROD_SERVICE_KEY = process.env.PROD_SUPABASE_SERVICE_KEY

if (!PROD_URL || !PROD_SERVICE_KEY) {
  console.error("  ❌ PROD_SUPABASE_URL and PROD_SUPABASE_SERVICE_KEY must be set in environment")
  process.exit(1)
}

const staging = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const production = createClient(PROD_URL, PROD_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const TABLES = ["spots", "products", "poi", "routes", "itineraries", "blog_posts"] as const

async function main() {
  console.log("")
  console.log("  ╔═══════════════════════════════════════════╗")
  console.log("  ║   Sync Staging → Production              ║")
  console.log("  ╚═══════════════════════════════════════════╝")
  console.log("")
  console.log("  WARNING: This will OVERWRITE production data!")
  console.log("")

  for (const table of TABLES) {
    process.stdout.write(`  📦 ${table}... `)

    // Fetch from staging
    const { data: rows, error: fetchError } = await staging.from(table).select("*")
    if (fetchError) {
      console.log("❌ Fetch error:", fetchError.message)
      continue
    }
    if (!rows || rows.length === 0) {
      console.log("⚠️ Empty, skipping")
      continue
    }

    // Delete all from production
    const { error: deleteError } = await production.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000")
    if (deleteError) {
      console.log("❌ Delete error:", deleteError.message)
      continue
    }

    // Insert to production
    const { error: insertError } = await production.from(table).insert(rows)
    if (insertError) {
      console.log("❌ Insert error:", insertError.message)
      continue
    }

    console.log(`✅ ${rows.length} records synced`)
  }

  console.log("")
  console.log("  ✅ Sync complete!")
  console.log("")
}

main().catch((err) => {
  console.error("  ❌ Error:", err.message)
  process.exit(1)
})

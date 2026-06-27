import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseUrl || !serviceKey) {
  console.error("Missing SUPABASE env vars")
  process.exit(1)
}

const db = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log("")
  console.log("  ╔══════════════════════════════════════╗")
  console.log("  ║   Seed: Regions (Provinsi + Kota)   ║")
  console.log("  ╚══════════════════════════════════════╝")
  console.log("")

  // Fetch provinces
  console.log("  📡 Fetching provinces...")
  const provRes = await fetch("https://wilayah.id/api/provinces.json")
  const provJson = await provRes.json()
  const provinces = provJson.data || []
  console.log(`  ✅ ${provinces.length} provinces found`)

  for (const p of provinces) {
    const { error } = await db.from("regions").upsert(
      { code: p.code, name: p.name, type: "province" },
      { onConflict: "code" }
    )
    if (error) console.log(`  ❌ ${p.name}: ${error.message}`)
  }
  console.log(`  ✅ ${provinces.length} provinces inserted`)
  console.log("")

  // Fetch regencies for each province
  let totalRegencies = 0
  for (const p of provinces) {
    const res = await fetch(`https://wilayah.id/api/regencies/${p.code}.json`)
    const json = await res.json()
    const regencies = json.data || []

    for (const r of regencies) {
      const { error } = await db.from("regions").upsert(
        { code: r.code, name: r.name, type: "regency", parent_code: p.code },
        { onConflict: "code" }
      )
      if (error) console.log(`  ❌ ${r.name}: ${error.message}`)
    }
    totalRegencies += regencies.length
    console.log(`  ✅ ${p.name}: ${regencies.length} regencies`)
  }

  console.log("")
  console.log("  ═══════════════════════════════════════")
  console.log(`  ✅ Total: ${provinces.length} provinces + ${totalRegencies} regencies`)
  console.log("")
}

main().catch(console.error)

import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment")
  console.error("   Copy .env.local or set env vars manually")
  process.exit(1)
}

export const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

export async function ensureTable(tableName: string, sql: string) {
  const { error } = await supabase.from(tableName).select("id").limit(1).maybeSingle()
  if (error && error.message.includes("does not exist")) {
    await runRawSQL(sql)
  }
}

async function runRawSQL(sql: string) {
  const projectRef = SUPABASE_URL.match(/https:\/\/(.+)\.supabase\.co/)?.[1]
  if (!projectRef) throw new Error("Cannot parse project ref from URL")

  const { Client } = await import("pg")
  const client = new Client({
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: process.env.SUPABASE_DB_PASSWORD || "Gaskuy2024!",
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()
    await client.query(sql)
  } finally {
    await client.end()
  }
}

export function log(emoji: string, message: string) {
  console.log(`  ${emoji} ${message}`)
}

export function divider() {
  console.log("")
  console.log("  " + "─".repeat(50))
  console.log("")
}

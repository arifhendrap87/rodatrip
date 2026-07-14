import pg from "pg"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF
const PASSWORD = process.env.SUPABASE_DB_PASSWORD
const MIGRATION_FILE = path.join(__dirname, "..", "supabase", "migrations", "000_combined.sql")

if (!PROJECT_REF || !PASSWORD) {
  console.error("SUPABASE_PROJECT_REF and SUPABASE_DB_PASSWORD must be set in environment")
  process.exit(1)
}

async function main() {
  console.log(`Connecting to db.${PROJECT_REF}.supabase.co ...`)

  const client = new pg.Client({
    host: `db.${PROJECT_REF}.supabase.co`,
    port: 6543,
    user: "postgres",
    password: PASSWORD,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  })

  try {
    await client.connect()
    console.log("Connected! Cleaning and running migration...")

    // Drop existing tables for clean slate
    await client.query(`
      DROP TABLE IF EXISTS analytics CASCADE;
      DROP TABLE IF EXISTS profiles CASCADE;
      DROP TABLE IF EXISTS waitlist CASCADE;
      DROP TABLE IF EXISTS routes CASCADE;
      DROP TABLE IF EXISTS poi CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS spots CASCADE;
    `)
    console.log("Cleaned existing tables")

    const sql = fs.readFileSync(MIGRATION_FILE, "utf8")
    await client.query(sql)
    console.log("Migration completed successfully!")

    // Verify tables
    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)
    console.log("Tables created:", rows.map((r) => r.table_name).join(", "))
  } catch (err) {
    console.error("Error:", err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()

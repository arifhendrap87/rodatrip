import { db } from "../src/lib/services/db"
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3"
import * as fs from "fs"
import * as path from "path"

const TABLES = ["spots", "itineraries", "itinerary_stops", "media", "products", "settings", "blog"]
const BACKUP_DIR = "/tmp/rodatrip-backup"

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.CLOUDFLARE_R2_PUBLIC_BUCKET || "gaskuy-spot-images"
const RETENTION_DAYS = 7

async function backup() {
  const date = new Date().toISOString().slice(0, 10)
  const backupKey = `backup/${date}`

  console.log(`📦 Backup ${date} — ${TABLES.length} tables`)

  // Ensure temp dir
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true })

  for (const table of TABLES) {
    try {
      const { data, error } = await db.from(table).select("*")
      if (error) {
        console.log(`  ❌ ${table}: ${error.message}`)
        continue
      }
      const filePath = path.join(BACKUP_DIR, `${table}.json`)
      fs.writeFileSync(filePath, JSON.stringify(data || [], null, 2))
      console.log(`  ✅ ${table}: ${(data || []).length} rows`)

      // Upload to R2
      const fileBuffer = fs.readFileSync(filePath)
      await r2Client.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: `${backupKey}/${table}.json`,
          Body: fileBuffer,
          ContentType: "application/json",
        })
      )
    } catch (e) {
      console.log(`  ❌ ${table}: ${(e as Error).message}`)
    }
  }

  // Cleanup old backups
  const { Contents } = await r2Client.send(
    new ListObjectsV2Command({ Bucket: BUCKET, Prefix: "backup/" })
  )

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS)

  for (const obj of Contents || []) {
    if (obj.Key && obj.LastModified && obj.LastModified < cutoff) {
      await r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: obj.Key }))
      console.log(`  🗑️ Deleted old: ${obj.Key}`)
    }
  }

  // Cleanup temp dir
  fs.rmSync(BACKUP_DIR, { recursive: true, force: true })

  console.log(`✅ Backup selesai: ${backupKey}`)
}

backup().catch((e) => {
  console.error("❌ Backup gagal:", e.message)
  process.exit(1)
})

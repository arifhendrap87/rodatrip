import { S3Client, ListObjectsV2Command, CopyObjectCommand } from "@aws-sdk/client-s3"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!
const bucketName = process.env.CLOUDFLARE_R2_PUBLIC_BUCKET || "gaskuy-spot-images"

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
})

async function main() {
  console.log("")
  console.log("  ╔═══════════════════════════════════════╗")
  console.log("  ║   Copy R2 Images: dev/ → prod/       ║")
  console.log("  ╚═══════════════════════════════════════╝")
  console.log("")

  const folders = ["spots", "products", "poi", "blog"]
  let total = 0

  for (const folder of folders) {
    const prefix = `dev/${folder}/`
    console.log(`  📁 Listing ${prefix}...`)

    const { Contents } = await r2Client.send(
      new ListObjectsV2Command({ Bucket: bucketName, Prefix: prefix })
    )

    if (!Contents || Contents.length === 0) {
      console.log(`     ⚠️ No files found`)
      continue
    }

    console.log(`     Found ${Contents.length} files`)

    for (const obj of Contents) {
      if (!obj.Key) continue
      const newKey = obj.Key.replace("dev/", "prod/")

      await r2Client.send(
        new CopyObjectCommand({
          Bucket: bucketName,
          CopySource: `${bucketName}/${obj.Key}`,
          Key: newKey,
          CacheControl: "public, max-age=31536000, immutable",
        })
      )

      process.stdout.write(".")
      total++
    }
    console.log(` ✅ ${Contents.length} copied`)
  }

  console.log("")
  console.log(`  ───────────────────────────────────────`)
  console.log(`  ✅ Total: ${total} images copied from dev/ → prod/`)
  console.log("")
}

main().catch((err) => {
  console.error("  ❌ Error:", err.message)
  process.exit(1)
})

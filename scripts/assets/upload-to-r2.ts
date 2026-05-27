import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!
const bucketName = process.env.CLOUDFLARE_R2_PUBLIC_BUCKET!
const publicDomain = process.env.R2_PUBLIC_DOMAIN || `pub-1a37d792e7bc411380f4fed507dc7100.r2.dev`

const PREFIX = "dev" // change to "staging" or "prod" as needed

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
})

const SPOTS_DIR = path.resolve("public/images/spots")
const PRODUCTS_DIR = path.resolve("public/images/products")
const FEATURES_DIR = path.resolve("public/images")

function getContentType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase()
  const types: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
  }
  return types[ext || ""] || "image/jpeg"
}

async function uploadFile(filePath: string, key: string): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath)
  const contentType = getContentType(path.basename(filePath))

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    })
  )

  return `https://${publicDomain}/${key}`
}

async function uploadDir(dir: string, prefix: string): Promise<{ count: number; urls: string[] }> {
  if (!fs.existsSync(dir)) return { count: 0, urls: [] }

  const files = fs.readdirSync(dir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
  let count = 0
  const urls: string[] = []

  for (const file of files) {
    const filePath = path.join(dir, file)
    const key = `${PREFIX}/${prefix}/${file}`
    const url = await uploadFile(filePath, key)
    urls.push(url)
    count++
    process.stdout.write(".")
  }

  return { count, urls }
}

async function main() {
  console.log("")
  console.log("  ╔═══════════════════════════════════════╗")
  console.log("  ║     Gaskuy — R2 Asset Uploader       ║")
  console.log(`  ║     Prefix: ${PREFIX.padEnd(32)}║`)
  console.log("  ╚═══════════════════════════════════════╝")
  console.log("")

  console.log("  Uploading spots images...")
  const spots = await uploadDir(SPOTS_DIR, "spots")
  console.log(` ${spots.count} uploaded`)

  console.log("  Uploading product images...")
  const products = await uploadDir(PRODUCTS_DIR, "products")
  console.log(` ${products.count} uploaded`)

  console.log("  Uploading feature images...")
  const features = await uploadDir(FEATURES_DIR, "")
  const featureFiles = features.urls.filter((u) => !u.includes("/spots/") && !u.includes("/products/"))
  console.log(` ${featureFiles.length} uploaded`)

  const total = spots.count + products.count + featureFiles.length

  console.log("")
  console.log(`  ─────────────────────────────────────────`)
  console.log(`  ✅ Total: ${total} images uploaded to R2 (${PREFIX}/)`)
  console.log("")

  // Print sample URLs
  if (spots.urls.length > 0) {
    console.log("  Sample spot URL:")
    console.log(`    ${spots.urls[0]}`)
  }
  if (products.urls.length > 0) {
    console.log("  Sample product URL:")
    console.log(`    ${products.urls[0]}`)
  }
  console.log("")
}

main().catch((err) => {
  console.error("  ❌ Error:", err.message)
  process.exit(1)
})

import sharp from "sharp"
import path from "path"
import fs from "fs"

const SPOTS_DIR = path.resolve("public/images/spots")
const PRODUCTS_DIR = path.resolve("public/images/products")

const COLORS = [
  ["#f97316", "#ea580c"],
  ["#06b6d4", "#0891b2"],
  ["#a855f7", "#7c3aed"],
  ["#10b981", "#059669"],
  ["#f43f5e", "#e11d48"],
  ["#eab308", "#ca8a04"],
  ["#3b82f6", "#2563eb"],
  ["#14b8a6", "#0d9488"],
]

interface PlaceholderConfig {
  dir: string
  filename: string
  label: string
  width?: number
  height?: number
}

export async function generatePlaceholder({ dir, filename, label, width = 800, height = 600 }: PlaceholderConfig): Promise<boolean> {
  const filepath = path.join(dir, filename)
  if (fs.existsSync(filepath)) return false

  const colorIdx = Math.abs(hashCode(label)) % COLORS.length
  const [c1, c2] = COLORS[colorIdx]

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${c1};stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:${c2};stop-opacity:0.9" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)" />
    <rect x="${width/2-60}" y="${height/2-60}" width="120" height="120" rx="20" fill="rgba(255,255,255,0.15)" />
    <text x="${width/2}" y="${height/2+8}" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" dominant-baseline="middle">🚗</text>
    <text x="${width/2}" y="${height - 40}" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" opacity="0.8">${escapeXml(label)}</text>
  </svg>`

  await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toFile(filepath)
  return true
}

export async function generateAllPlaceholders() {
  if (!fs.existsSync(SPOTS_DIR)) fs.mkdirSync(SPOTS_DIR, { recursive: true })
  if (!fs.existsSync(PRODUCTS_DIR)) fs.mkdirSync(PRODUCTS_DIR, { recursive: true })

  const dataDir = path.resolve("src/data")
  const mockDir = path.resolve("src/lib/mock")

  // Dynamic import data
  const spotsModule = await import(path.resolve("src/data/spots.ts"))
  const productsModule = await import(path.resolve("src/lib/mock/products.ts"))

  const spots = spotsModule.spots as Array<{ slug: string; name: string; category: string; imageUrl: string }>
  const products = productsModule.mockProducts as Array<{ id: string; name: string; category: string; image_url: string }>

  let generated = 0
  let skipped = 0

  // Generate spot placeholders
  for (const spot of spots) {
    const filename = path.basename(spot.imageUrl)
    const created = await generatePlaceholder({
      dir: SPOTS_DIR,
      filename,
      label: spot.name,
    })
    if (created) {
      generated++
      process.stdout.write(".")
    } else {
      skipped++
    }
  }

  // Generate product placeholders
  for (const product of products) {
    const filename = path.basename(product.image_url)
    const created = await generatePlaceholder({
      dir: PRODUCTS_DIR,
      filename,
      label: product.name,
    })
    if (created) {
      generated++
      process.stdout.write(".")
    } else {
      skipped++
    }
  }

  return { generated, skipped }
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

// Run if executed directly
const isMain = process.argv[1]?.includes("generate-placeholders")
if (isMain) {
  generateAllPlaceholders().then((r) => {
    console.log(`\n  ✅ Placeholders: ${r.generated} generated, ${r.skipped} skipped`)
  })
}

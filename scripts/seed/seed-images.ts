import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!
const bucketName = process.env.CLOUDFLARE_R2_PUBLIC_BUCKET || "gaskuy-spot-images"
const publicDomain = process.env.R2_PUBLIC_DOMAIN || "pub-1a37d792e7bc411380f4fed507dc7100.r2.dev"

const PREFIX = "dev"
const CACHE_FILE = path.resolve("scripts/seed/image-urls.json")

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
})

function getContentType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase()
  const types: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
  }
  return types[ext || ""] || "image/jpeg"
}

async function downloadFromUnsplash(photoId: string): Promise<Buffer | null> {
  const url = `https://images.unsplash.com/${photoId}?w=800&h=600&fit=crop&q=80`
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GaskuyBot/1.0)" },
      redirect: "follow",
    })
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

async function uploadToR2(buffer: Buffer, key: string): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: getContentType(key),
    })
  )
  return `https://${publicDomain}/${key}`
}

// Unsplash photo IDs — verified working
const P = {
  // Landscapes / Nature
  VOLCANO: "photo-1588668214407-6ea9a6d8c272",
  MOUNTAIN: "photo-1506905925346-21bda4d32df4",
  GREEN_LANDSCAPE: "photo-1469474968028-56623f02e42e",
  NATURE_MISTY: "photo-1470071459604-3b5ec3a7fe05",
  FOREST_PATH: "photo-1441974231531-c6227db76b6e",
  NATURE_GREEN: "photo-1472214103451-9374bd1c798e",
  FLOWER_YELLOW: "photo-1465146344425-f00d5f5c8f07",
  WATERFALL: "photo-1433086966358-54859d0ed716",
  LAKE_VIEW: "photo-1501785888041-af3ef285b470",
  LAKE_MOUNTAINS: "photo-1476514525535-07fb3b4ae5f1",
  ROAD_TRIP: "photo-1469854523086-cc02fe5d8800",
  CAMPING: "photo-1488646953014-85cb44e25828",
  TENT_NIGHT: "photo-1504280390367-361c6d9f38f4",
  SUNSET: "photo-1507525428034-b723cf961d3e",
  NIGHT_SKY: "photo-1519681393784-d120267933ba",
  BEACH_SUNSET: "photo-1510414842594-a61c69b5ae57",
  OCEAN: "photo-1519046904884-53103b34b206",
  STAR_TRAILS: "photo-1470252649378-9c29740c9fa8",
  RICE_FIELD: "photo-1580655653885-65763b2597d0",
  TEMPLE: "photo-1596422846543-75c6fc197f07",
  COLORFUL_BUILDINGS: "photo-1548013146-72479768bada",
  STREET_NIGHT: "photo-1517248135467-4c7edcad34c4",
  COLONIAL: "photo-1542314831-068cd1dbfeeb",
  TRADITIONAL_HOUSE: "photo-1570710891163-6d3b5c47248b",
  WILDLIFE: "photo-1518495973542-4542c06a5843",
  CLOCK_TOWER: "photo-1590076215667-875d4ef2d7de",
  CANYON: "photo-1465146344425-f00d5f5c8f07",
  ISLAND: "photo-1468413253725-0d5181091126",
  FOREST_DARK: "photo-1540202404-a2f29016b523",
  MUSEUM: "photo-1571003123894-1f0594d2b5d9",
  BOTANICAL: "photo-1441974231531-c6227db76b6e",
  FARMHOUSE: "photo-1586023492125-27b2c045efd7",
  HOT_SPRING: "photo-1582555172866-f73bb12a2ab3",
  RIVER: "photo-1504674900247-0877df9cc836",
  // Food
  INDONESIAN_FOOD: "photo-1512621776951-a57141f2eefd",
  SATAY: "photo-1555939594-58d7cb561ad1",
  FOOD_PLATE: "photo-1546069901-ba9599a7e63c",
  FOOD_TABLE: "photo-1414235077428-338989a2e8c0",
  COOKING: "photo-1555939594-58d7cb561ad1",
  // Cars / Accessories
  CAR_DASH: "photo-1625047509248-ec889cbff17f",
  PHONE_MOUNT: "photo-1611821064430-0d40291d0f0b",
  DASHCAM: "photo-1580273916550-e323be2ae537",
  CAR_INTERIOR: "photo-1615811361523-6bd03d7748e7",
  TRAVEL_GEAR: "photo-1622185135505-2d795003994a",
  TIRE: "photo-1558981403-c5f9899a28bc",
  CAR_ACCESSORIES: "photo-1583121274602-3e2820c69888",
  ORGANIZER: "photo-1619405399517-d7fce0f13302",
  STICKER: "photo-1517524008697-84bbe3c3fd98",
  TUMBLER: "photo-1609521263047-f8f205293f24",
  BUNDLE: "photo-1503376780353-7e6692767b70",
  LUXURY_CAR: "photo-1492144534655-ae79c964c9d7",
  CAR_ROAD: "photo-1544636331-e26879cd4d9b",
  COOLER: "photo-1502877338535-766e1452684a",
  PILLOW: "photo-1494976388531-d1058494cdd8",
  FIRST_AID: "photo-1542362567-b07e54358753",
  // Gas station / POI
  GAS_STATION: "photo-1569383746724-6f1b882b8f46",
  WORKSHOP: "photo-1590077428593-a55bb07c4665",
  FOOD_WARM: "photo-1567620905732-2d1ec7ab7445",
  CITY_VIEW: "photo-1517248135467-4c7edcad34c4",
  // Blog
  ROAD_ADVENTURE: "photo-1469854523086-cc02fe5d8800",
  MAP: "photo-1488646953014-85cb44e25828",
  PACKING: "photo-1504280390367-361c6d9f38f4",
  FUEL: "photo-1569383746724-6f1b882b8f46",
  CAR_TRUNK: "photo-1619405399517-d7fce0f13302",
  INDONESIAN_DISH: "photo-1498837167922-ddd27525d352",
}

// ===== SPOTS (41) =====
const SPOTS_IMAGES: Record<string, string> = {
  "kawah-putih-ciwidey": P.VOLCANO,
  "nasi-goreng-kambing-kebon-sirih": P.INDONESIAN_FOOD,
  "candi-borobudur": P.TEMPLE,
  "pantai-parangtritis": P.BEACH_SUNSET,
  "sate-klathak-pak-pong": P.SATAY,
  "gunung-bromo": P.MOUNTAIN,
  "kampung-warna-warni-jodipan": P.COLORFUL_BUILDINGS,
  "kebun-teh-gunung-mas": P.NATURE_MISTY,
  "danau-toba": P.LAKE_VIEW,
  "gunung-ijen": P.VOLCANO,
  "malioboro": P.STREET_NIGHT,
  "taman-laut-bunaken": P.OCEAN,
  "curug-cilember": P.WATERFALL,
  "bukit-bintang": P.NIGHT_SKY,
  "jalan-braga": P.COLONIAL,
  "pantai-kuta-lombok": P.BEACH_SUNSET,
  "pura-tanah-lot": P.TEMPLE,
  "tana-toraja": P.TRADITIONAL_HOUSE,
  "taman-nasional-komodo": P.WILDLIFE,
  "jam-gadang": P.CLOCK_TOWER,
  "ngarai-sianok": P.CANYON,
  "pulau-derawan": P.ISLAND,
  "gunung-rinjani": P.MOUNTAIN,
  "ubud-monkey-forest": P.FOREST_DARK,
  "gunung-tangkuban-perahu": P.VOLCANO,
  "curug-cimahi": P.WATERFALL,
  "tebing-keraton": P.MOUNTAIN,
  "gedung-sate-bandung": P.COLONIAL,
  "museum-geologi-bandung": P.MUSEUM,
  "alun-alun-bandung": P.CITY_VIEW,
  "orchid-forest-cikole": P.FOREST_PATH,
  "situ-patenggang": P.LAKE_VIEW,
  "farmhouse-lembang": P.FARMHOUSE,
  "kawah-rengganis": P.HOT_SPRING,
  "taman-safari-bogor": P.WILDLIFE,
  "kebun-raya-bogor": P.BOTANICAL,
  "curug-cigamea": P.WATERFALL,
  "gunung-pancar": P.NATURE_GREEN,
  "telaga-warna-puncak": P.LAKE_VIEW,
  "sate-maranggi-cianjur": P.SATAY,
  "cipanas-hot-spring": P.HOT_SPRING,
  "gunung-gede-pangrango": P.MOUNTAIN,
  "pantai-santolo": P.SUNSET,
  "cipanas-garut": P.HOT_SPRING,
  "gunung-papandayan": P.VOLCANO,
  "green-canyon-cijulang": P.RIVER,
  "pantai-batu-karas": P.BEACH_SUNSET,
  "pantai-ujung-genteng": P.OCEAN,
  "geopark-ciletuh": P.CANYON,
}

// ===== PRODUCTS (12) =====
const PRODUCTS_IMAGES: Record<string, string> = {
  "prod-1": P.TIRE,           // Tire Inflator
  "prod-2": P.FIRST_AID,      // Segitiga Pengaman
  "prod-3": P.FIRST_AID,      // P3K Kit
  "prod-4": P.PILLOW,         // Car Pillow
  "prod-5": P.COOLER,         // Cooler Bag
  "prod-6": P.PHONE_MOUNT,    // Phone Mount
  "prod-7": P.DASHCAM,        // Dashcam
  "prod-8": P.ORGANIZER,      // Trunk Organizer
  "prod-9": P.CAR_INTERIOR,   // Seat Gap Filler
  "prod-10": P.STICKER,       // Sticker Pack
  "prod-11": P.TUMBLER,       // Tumbler
  "prod-12": P.BUNDLE,        // Starter Pack Bundle
}

// ===== POI (20) =====
const POI_IMAGES: Record<string, string> = {
  "spbu-1": P.GAS_STATION,
  "spbu-2": P.GAS_STATION,
  "spbu-3": P.GAS_STATION,
  "spbu-4": P.GAS_STATION,
  "spbu-5": P.GAS_STATION,
  "kuliner-1": P.SATAY,
  "kuliner-2": P.FOOD_PLATE,
  "kuliner-3": P.INDONESIAN_FOOD,
  "kuliner-4": P.FOOD_WARM,
  "kuliner-5": P.FOOD_TABLE,
  "bengkel-1": P.WORKSHOP,
  "bengkel-2": P.WORKSHOP,
  "bengkel-3": P.WORKSHOP,
  "spot-1": P.LAKE_VIEW,
  "spot-2": P.NATURE_MISTY,
  "spot-3": P.WATERFALL,
  "spot-4": P.GREEN_LANDSCAPE,
  "spot-5": P.STREET_NIGHT,
  "info-1": P.CAR_ROAD,
  "info-2": P.CAR_ROAD,
  "info-3": P.CAR_ROAD,
}

// ===== BLOG (6) =====
const BLOG_IMAGES: Record<string, string> = {
  "persiapan-roadtrip-jauh": P.PACKING,
  "destinasi-wisata-jawa-barat": P.GREEN_LANDSCAPE,
  "rute-jakarta-yogyakarta": P.ROAD_ADVENTURE,
  "hemat-bbm-saat-roadtrip": P.FUEL,
  "perlengkapan-wajib-mobil": P.CAR_TRUNK,
  "kuliner-wajib-coba-saat-roadtrip": P.INDONESIAN_DISH,
}

interface Cache {
  spots: Record<string, string>
  products: Record<string, string>
  poi: Record<string, string>
  blog: Record<string, string>
}

function loadCache(): Cache {
  if (fs.existsSync(CACHE_FILE)) {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"))
  }
  return { spots: {}, products: {}, poi: {}, blog: {} }
}

function saveCache(cache: Cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
}

async function processCategory(
  name: string,
  mappings: Record<string, string>,
  cacheSection: Record<string, string>,
  folder: string
): Promise<{ cached: number; uploaded: number; failed: number }> {
  let cached = 0, uploaded = 0, failed = 0

  for (const [id, photoId] of Object.entries(mappings)) {
    if (cacheSection[id]) {
      cached++
      continue
    }

    const ext = "jpg"
    const key = `${PREFIX}/${folder}/${id}.${ext}`

    process.stdout.write(`  Downloading ${name}/${id}...`)
    const buffer = await downloadFromUnsplash(photoId)
    if (!buffer) {
      console.log(" FAILED (download)")
      failed++
      continue
    }

    process.stdout.write(" uploading...")
    const url = await uploadToR2(buffer, key)
    cacheSection[id] = url
    uploaded++
    console.log(" OK")
  }

  return { cached, uploaded, failed }
}

async function main() {
  console.log("")
  console.log("  ╔═══════════════════════════════════════════╗")
  console.log("  ║   Gaskuy — Seed Images to R2             ║")
  console.log("  ║   Source: Unsplash                        ║")
  console.log("  ╚═══════════════════════════════════════════╝")
  console.log("")

  const cache = loadCache()
  let totalCached = 0, totalUploaded = 0, totalFailed = 0

  // Spots
  console.log("  🏞️  Spots...")
  const spots = await processCategory("spot", SPOTS_IMAGES, cache.spots, "spots")
  totalCached += spots.cached; totalUploaded += spots.uploaded; totalFailed += spots.failed
  console.log(`     ${spots.cached} cached, ${spots.uploaded} uploaded, ${spots.failed} failed`)

  // Products
  console.log("  🛒 Products...")
  const products = await processCategory("product", PRODUCTS_IMAGES, cache.products, "products")
  totalCached += products.cached; totalUploaded += products.uploaded; totalFailed += products.failed
  console.log(`     ${products.cached} cached, ${products.uploaded} uploaded, ${products.failed} failed`)

  // POI
  console.log("  📍 POI...")
  const poi = await processCategory("poi", POI_IMAGES, cache.poi, "poi")
  totalCached += poi.cached; totalUploaded += poi.uploaded; totalFailed += poi.failed
  console.log(`     ${poi.cached} cached, ${poi.uploaded} uploaded, ${poi.failed} failed`)

  // Blog
  console.log("  📝 Blog...")
  const blog = await processCategory("blog", BLOG_IMAGES, cache.blog, "blog")
  totalCached += blog.cached; totalUploaded += blog.uploaded; totalFailed += blog.failed
  console.log(`     ${blog.cached} cached, ${blog.uploaded} uploaded, ${blog.failed} failed`)

  // Save cache
  saveCache(cache)

  console.log("")
  console.log(`  ─────────────────────────────────────────────`)
  console.log(`  ✅ Total: ${totalUploaded} uploaded, ${totalCached} cached, ${totalFailed} failed`)
  console.log(`  📁 Cache saved to: ${CACHE_FILE}`)
  console.log("")

  // Print sample URLs
  const sampleSpots = Object.values(cache.spots).slice(0, 3)
  const sampleProducts = Object.values(cache.products).slice(0, 2)
  if (sampleSpots.length > 0) {
    console.log("  Sample spot URLs:")
    sampleSpots.forEach((u) => console.log(`    ${u}`))
  }
  if (sampleProducts.length > 0) {
    console.log("  Sample product URLs:")
    sampleProducts.forEach((u) => console.log(`    ${u}`))
  }
  console.log("")
}

main().catch((err) => {
  console.error("  ❌ Error:", err.message)
  process.exit(1)
})

import fs from "fs"
import path from "path"

const DATA_FILES: { path: string; field: string }[] = [
  { path: "src/data/spots.ts", field: "imageUrl" },
  { path: "src/lib/mock/products.ts", field: "image_url" },
  { path: "src/lib/mock/poi.ts", field: "image_url" },
  { path: "src/data/blog.ts", field: "image" },
]

async function main() {
  console.log("")
  console.log("  ╔═══════════════════════════════════════╗")
  console.log("  ║   Update R2 prefix: dev/ → prod/     ║")
  console.log("  ╚═══════════════════════════════════════╝")
  console.log("")

  // 1. Update image-urls.json
  const cachePath = path.resolve("scripts/seed/image-urls.json")
  let cache = JSON.parse(fs.readFileSync(cachePath, "utf-8"))
  let cacheChanges = 0

  for (const [category, urls] of Object.entries(cache) as [string, Record<string, string>][]) {
    for (const [key, url] of Object.entries(urls)) {
      if (url.includes("/dev/")) {
        cache[category][key] = url.replace("/dev/", "/prod/")
        cacheChanges++
      }
    }
  }
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2))
  console.log(`  ✅ image-urls.json: ${cacheChanges} URLs updated`)

  // 2. Update data files
  for (const file of DATA_FILES) {
    let content = fs.readFileSync(file.path, "utf-8")
    const regex = new RegExp(`(${file.field}: "https://[^"]+)/dev/`, "g")
    const matches = content.match(regex)
    if (!matches) {
      console.log(`  ⏭️  ${file.path}: no dev/ URLs found`)
      continue
    }
    content = content.replace(regex, `$1/prod/`)
    fs.writeFileSync(file.path, content)
    console.log(`  ✅ ${file.path}: ${matches.length} URLs updated`)
  }

  // 3. Update seed-itinerary.ts (cover_image)
  const itinPath = "scripts/seed/seed-itinerary.ts"
  let itinContent = fs.readFileSync(itinPath, "utf-8")
  const itinRegex = /(cover_image: "https:\/\/[^"]+)\/dev\//g
  const itinMatches = itinContent.match(itinRegex)
  if (itinMatches) {
    itinContent = itinContent.replace(itinRegex, `$1/prod/`)
    fs.writeFileSync(itinPath, itinContent)
    console.log(`  ✅ ${itinPath}: ${itinMatches.length} URLs updated`)
  }

  console.log("")
  console.log("  ✅ All URL prefixes updated from dev/ → prod/")
  console.log("")
}

main().catch((err) => {
  console.error("  ❌ Error:", err.message)
  process.exit(1)
})

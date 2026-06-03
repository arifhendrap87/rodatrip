import fs from "fs"
import path from "path"

const cachePath = path.resolve("scripts/seed/image-urls.json")
const cache = JSON.parse(fs.readFileSync(cachePath, "utf-8"))

// ===== Update spots.ts =====
const spotsPath = path.resolve("src/data/spots.ts")
let spotsContent = fs.readFileSync(spotsPath, "utf-8")

for (const [slug, url] of Object.entries(cache.spots) as [string, string][]) {
  // Find the spot block and replace its imageUrl
  const slugPattern = new RegExp(`(slug: "${slug}"[\\s\\S]*?imageUrl: ")[^"]*(")`)
  spotsContent = spotsContent.replace(slugPattern, `$1${url}$2`)
}

fs.writeFileSync(spotsPath, spotsContent)
console.log(`  ✅ spots.ts updated (${Object.keys(cache.spots).length} imageUrl)`)

// ===== Update products.ts =====
const productsPath = path.resolve("src/lib/mock/products.ts")
let productsContent = fs.readFileSync(productsPath, "utf-8")

for (const [id, url] of Object.entries(cache.products) as [string, string][]) {
  const idPattern = new RegExp(`(id: "${id}"[\\s\\S]*?image_url: ")[^"]*(")`)
  productsContent = productsContent.replace(idPattern, `$1${url}$2`)
}

fs.writeFileSync(productsPath, productsContent)
console.log(`  ✅ products.ts updated (${Object.keys(cache.products).length} image_url)`)

// ===== Update poi.ts =====
const poiPath = path.resolve("src/lib/mock/poi.ts")
let poiContent = fs.readFileSync(poiPath, "utf-8")

for (const [id, url] of Object.entries(cache.poi) as [string, string][]) {
  const idEntry = poiContent.indexOf(`id: "${id}"`)
  if (idEntry === -1) continue

  // Find the end of this POI object
  const blockStart = poiContent.lastIndexOf("{", idEntry)
  let depth = 0
  let blockEnd = blockStart
  for (let i = blockStart; i < poiContent.length; i++) {
    if (poiContent[i] === "{") depth++
    if (poiContent[i] === "}") depth--
    if (depth === 0) { blockEnd = i; break }
  }

  const block = poiContent.substring(blockStart, blockEnd + 1)

  // Check if image_url already exists
  if (block.includes("image_url")) {
    // Replace existing
    const imgPattern = new RegExp(`(image_url: ")[^"]*(")`)
    const newBlock = block.replace(imgPattern, `$1${url}$2`)
    poiContent = poiContent.substring(0, blockStart) + newBlock + poiContent.substring(blockEnd + 1)
  } else {
    // Add image_url before the closing brace
    const insertPoint = blockLastIndexOf(block, "}")
    const beforeClose = block.substring(0, insertPoint)
    const afterClose = block.substring(insertPoint)
    const newBlock = beforeClose + `,\\n  image_url: "${url}"` + afterClose
    poiContent = poiContent.substring(0, blockStart) + newBlock + poiContent.substring(blockEnd + 1)
  }
}

fs.writeFileSync(poiPath, poiContent)
console.log(`  ✅ poi.ts updated (${Object.keys(cache.poi).length} image_url)`)

// ===== Update blog.ts =====
const blogPath = path.resolve("src/data/blog.ts")
let blogContent = fs.readFileSync(blogPath, "utf-8")

for (const [slug, url] of Object.entries(cache.blog) as [string, string][]) {
  const slugPattern = new RegExp(`(slug: "${slug}"[\\s\\S]*?image: ")[^"]*(")`)
  blogContent = blogContent.replace(slugPattern, `$1${url}$2`)
}

fs.writeFileSync(blogPath, blogContent)
console.log(`  ✅ blog.ts updated (${Object.keys(cache.blog).length} image)`)

console.log("")
console.log("  🎉 All data files updated with R2 URLs!")
console.log("")

function blockLastIndexOf(str: string, char: string): number {
  for (let i = str.length - 1; i >= 0; i--) {
    if (str[i] === char) return i
  }
  return -1
}

import sharp from "sharp"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, "../public")
const svgPath = path.join(publicDir, "favicon.svg")

const sizes = [
  { name: "favicon-16.png", size: 16 },
  { name: "favicon.png", size: 32 },
  { name: "favicon-48.png", size: 48 },
  { name: "apple-icon.png", size: 180 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
]

const svg = await readFile(svgPath)

for (const { name, size } of sizes) {
  const out = path.join(publicDir, name)
  await sharp(svg, { density: 300 })
    .resize(size, size)
    .png()
    .toFile(out)
  console.log(`✓ ${name} (${size}x${size})`)
}

console.log("Done.")

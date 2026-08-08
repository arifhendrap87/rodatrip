import sharp from "sharp"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, "../public")
const srcPath = path.join(publicDir, "images", "hero-bg.webp")

const src = await readFile(srcPath)

const outputs = [
  { name: "hero-bg-1920.webp", width: 1920, height: 1080, quality: 45 },
  { name: "hero-bg-768.webp", width: 768, height: 432, quality: 60 },
]

for (const o of outputs) {
  const out = path.join(publicDir, "images", o.name)
  await sharp(src, { density: 300 })
    .resize(o.width, o.height, { fit: "cover", position: "centre" })
    .webp({ quality: o.quality })
    .toFile(out)
  const stat = await readFile(out)
  console.log(`✓ ${o.name} (${o.width}x${o.height}) — ${(stat.length / 1024).toFixed(0)}KB`)
}

console.log("Done.")

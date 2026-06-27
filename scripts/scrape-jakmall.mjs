import { chromium } from "playwright"
import * as XLSX from "xlsx"
import { readFileSync, writeFileSync, existsSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const XLSX_PATH = resolve(__dirname, "../docs/20260622_MasterProduct.xlsx")
const OUTPUT_PATH = resolve(__dirname, "../docs/scraped-products.json")

function parseXLSX() {
  const buffer = readFileSync(XLSX_PATH)
  const wb = XLSX.read(buffer, { type: "buffer" })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })

  if (rows.length < 2) throw new Error("File kosong")

  const headers = rows[0].map(h => String(h || "").trim())
  const linkIdx = headers.findIndex(h => h.includes("Link"))

  if (linkIdx === -1) throw new Error("Kolom 'Link' tidak ditemukan")

  const rawRows = rows.slice(1).filter(r => r[linkIdx] && String(r[linkIdx]).includes("jakmall.com"))

  const parsed = rawRows.map(r => {
    const obj = {}
    headers.forEach((h, i) => { obj[h] = r[i] !== undefined ? r[i] : "" })
    return obj
  })

  return { headers, rows: parsed }
}

async function scrapeProduct(page, link, row, index, total) {
  const result = {
    NamaProduk: String(row["Nama Produk"] || row["NamaProduk"] || ""),
    KodeSKU: String(row["Kode SKU"] || row["KodeSKU"] || ""),
    Harga: Number(row["Harga"] || 0),
    Berat_gr: Number(row["Berat (gr)"] || row["Berat_gr"] || 0),
    Link: link,
    description: "",
    images: [],
  }

  console.log(`[${index + 1}/${total}] 🔄 ${result.NamaProduk.slice(0, 50)}...`)

  try {
    await page.goto(link, { waitUntil: "networkidle", timeout: 15000 })

    // Tunggu Vue.js render
    await page.waitForTimeout(4000)

    // Scrape description
    const description = await page.evaluate(() => {
      const el = document.querySelector('.dp__info, [class*="dp__info"]')
      if (el) {
        // Ambil innerHTML agar tag HTML (div, table, p, dll) tetap terjaga
        return el.innerHTML.trim().slice(0, 5000)
          .replace(/\{\{[^}]+\}\}/g, "")
          .replace(/\s+/g, " ")
          .trim()
      }
      return ""
    })
    result.description = description

    // Scrape images
    const images = await page.evaluate(() => {
      const urls = []
      document.querySelectorAll('img[src*="static.jakmall.id"][src*="products/"]').forEach(img => {
        const src = img.getAttribute("src") || img.src
        if (src && !urls.includes(src)) {
          urls.push(src.replace("/thumbnail/", "/detail/"))
        }
      })
      return [...new Set(urls)].slice(0, 15)
    })
    result.images = images

    console.log(`[${index + 1}/${total}] ✅ ${result.NamaProduk.slice(0, 40)} — ${description.length} char, ${images.length} gambar`)
  } catch (e) {
    result.error = e.message
    console.log(`[${index + 1}/${total}] ❌ Error: ${e.message}`)
  }

  return result
}

async function main() {
  console.log("")
  console.log("  ╔══════════════════════════════════════╗")
  console.log("  ║   RodaTrip — Scrape Jakmall         ║")
  console.log("  ╚══════════════════════════════════════╝")
  console.log("")

  // Parse XLSX
  const { headers, rows } = parseXLSX()
  console.log(`  📋 ${rows.length} produk ditemukan`)
  console.log("")

  // Launch browser
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
  })
  const page = await context.newPage()

  const results = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const link = String(row["Link"] || "").trim()
    if (!link) {
      results.push({
        NamaProduk: String(row["Nama Produk"] || ""),
        KodeSKU: String(row["Kode SKU"] || ""),
        Harga: Number(row["Harga"] || 0),
        Berat_gr: Number(row["Berat (gr)"] || 0),
        Link: "",
        description: "",
        images: [],
        error: "Link kosong"
      })
      console.log(`[${i + 1}/${rows.length}] ❌ Link kosong`)
      continue
    }

    const result = await scrapeProduct(page, link, row, i, rows.length)
    results.push(result)
  }

  await browser.close()

  // Save to JSON
  const output = {
    products: results,
    summary: {
      total: results.length,
      success: results.filter(r => !r.error).length,
      errors: results.filter(r => r.error).length,
      scraped_at: new Date().toISOString()
    }
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8")

  console.log("")
  console.log("  ═══════════════════════════════════════")
  console.log(`  ✅ ${output.summary.success} berhasil`)
  console.log(`  ❌ ${output.summary.errors} gagal`)
  console.log(`  📄 Output: docs/scraped-products.json`)
  console.log("")
}

main().catch(e => {
  console.error("Fatal:", e.message)
  process.exit(1)
})

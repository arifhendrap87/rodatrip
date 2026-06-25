import { success, badRequest, unauthorized, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { adminLimiter } from "@/lib/api/rate-limit"
import { db } from "@/lib/services/db"
import * as XLSX from "xlsx"

const COL_MAP: Record<string, string> = {
  "Nama Produk": "name",
  "Kode SKU": "external_id",
  "Harga": "price",
  "Berat (gr)": "weight",
  "Volume Kemasan (cm)": "dimensions",
  "Status": "status",
  "Link": "link",
  "Nilai Varian 2": "variant_dimensions",
}

function parseStatus(status: string): number {
  if (!status || status.toLowerCase().includes("habis")) return 0
  if (status.toLowerCase().includes("sisa")) {
    const match = status.match(/sisa\s+(\d+)/i)
    return match ? parseInt(match[1]) : 5
  }
  return 10
}

async function scrapeImage(link: string): Promise<string> {
  if (!link) return ""
  try {
    const res = await fetch(link, { signal: AbortSignal.timeout(5000) })
    const html = await res.text()
    // Cari gambar produk Jakmall: static.jakmall.id/.../images/products/...
    const match = html.match(/https:\/\/static\.jakmall\.id\/[^"']*images\/products\/[^"']+(?:\.jpg|\.png|\.jpeg|\.webp)/i)
    return match ? match[0] : ""
  } catch {
    return ""
  }
}

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = await adminLimiter(`products-import:${ip}`)
  if (!allowed) return unauthorized("Rate limited")

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  if (!file) return badRequest("File required")

  if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
    return badRequest("File harus .xlsx")
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const wb = XLSX.read(buffer, { type: "buffer" })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][]

    if (rows.length < 2) return badRequest("File kosong atau hanya header")

    const headers = (rows[0] as string[]).map(h => String(h || "").trim())
    const dataRows = rows.slice(1).filter((r: unknown[]) => (r as string[]).some(c => String(c || "").trim()))

    const nameIdx = headers.findIndex(h => h.includes("Nama Produk"))
    const skuIdx = headers.findIndex(h => h.includes("Kode SKU"))
    const priceIdx = headers.findIndex(h => h.includes("Harga"))
    const weightIdx = headers.findIndex(h => h.includes("Berat"))
    const dimIdx = headers.findIndex(h => h.includes("Volume Kemasan"))
    const statusIdx = headers.findIndex(h => h.includes("Status"))
    const linkIdx = headers.findIndex(h => h.includes("Link"))

    if (nameIdx === -1 || skuIdx === -1 || priceIdx === -1) {
      return badRequest("File harus memiliki kolom: Nama Produk, Kode SKU, Harga")
    }

    const parsed: { name: string; sku: string; price: number; weight?: number; dimensions?: string; link?: string; stock: number; image_url?: string }[] = []

    for (const row of dataRows) {
      const cells = row as unknown[]
      const name = String(cells[nameIdx] || "").trim()
      const sku = String(cells[skuIdx] || "").trim()
      const price = parseInt(String(cells[priceIdx] || "0").replace(/\D/g, ""))
      if (!name || !sku || !price) continue

      const weight = weightIdx >= 0 ? parseInt(String(cells[weightIdx] || "0")) || undefined : undefined
      let dimensions = dimIdx >= 0 ? String(cells[dimIdx] || "").trim() || undefined : undefined
      const link = linkIdx >= 0 ? String(cells[linkIdx] || "").trim() || undefined : undefined
      const status = statusIdx >= 0 ? String(cells[statusIdx] || "").trim() || "Stok tersedia" : "Stok tersedia"

      parsed.push({ name, sku, price, weight, dimensions, link, stock: parseStatus(status) })
    }

    // Scrape gambar dari setiap link produk
    await Promise.all(parsed.map(async (item) => {
      if (item.link) {
        item.image_url = await scrapeImage(item.link)
      }
    }))

    if (parsed.length === 0) return badRequest("Tidak ada data valid yang ditemukan")

    const skus = parsed.map(p => p.sku)
    const { data: existing } = await db
      .from("products")
      .select("external_id, id")
      .in("external_id", skus)

    const existingMap = new Map<string, string>()
    for (const row of existing || []) {
      existingMap.set((row as { external_id: string; id: string }).external_id, (row as { external_id: string; id: string }).id)
    }

    let created = 0
    let updated = 0
    const errors: string[] = []

    for (const item of parsed) {
      try {
        const existingId = existingMap.get(item.sku)
        if (existingId) {
          await db.from("products").update({
            price: item.price,
            weight: item.weight || null,
            dimensions: item.dimensions || null,
            stock_quantity: item.stock,
            image_url: item.image_url || undefined,
          }).eq("id", existingId)
          updated++
        } else {
          const base = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60)
          const slug = base + "-" + item.sku.toLowerCase()
          await db.from("products").insert({
            name: item.name,
            slug,
            source: "Jakmall",
            external_id: item.sku,
            price: item.price,
            weight: item.weight || null,
            dimensions: item.dimensions || null,
            stock_quantity: item.stock,
            image_url: item.image_url || null,
            jakmall_url: item.link || null,
            category: "Aksesoris Mobil",
            is_featured: false,
          })
          created++
        }
      } catch (e) {
        errors.push(`${item.name}: ${(e as Error).message}`)
      }
    }

    return success({ created, updated, errors: errors.length > 0 ? errors : undefined, total: parsed.length })
  } catch (e) {
    return internalError("Gagal parse file: " + (e as Error).message)
  }
}

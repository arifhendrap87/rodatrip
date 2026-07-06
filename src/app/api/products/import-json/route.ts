import { success, rateLimited, badRequest, unauthorized } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { adminLimiter } from "@/lib/api/rate-limit"
import { db } from "@/lib/services/db"

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = await adminLimiter(`products-import-json:${ip}`)
  if (!allowed) return rateLimited(30)

  const body = await request.json()
  const products = body.products || body

  if (!Array.isArray(products) || products.length === 0) {
    return badRequest("Body harus berisi array products")
  }

  const skus = products.map((p: Record<string, unknown>) => String(p.KodeSKU || p.external_id || "").trim()).filter(Boolean)

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

  for (const item of products) {
    try {
      const name = String(item.NamaProduk || item.name || "").trim()
      const sku = String(item.KodeSKU || item.external_id || "").trim()
      const price = Number(item.Harga || item.price || 0)
      const weight = Number(item.Berat_gr || item.weight || 0) || null
      const description = String(item.description || "").trim() || null
      const images = Array.isArray(item.images) ? item.images.filter(Boolean) : []
      const link = String(item.Link || item.jakmall_url || "").trim() || null

      if (!name || !sku || !price) {
        errors.push(`SKU ${sku || "?"}: nama, SKU, atau harga tidak valid`)
        continue
      }

      const existingId = existingMap.get(sku)

      if (existingId) {
        const updateData: Record<string, unknown> = {
          price,
          description,
          weight,
          image_url: images[0] || null,
          images: images.length > 0 ? images : null,
        }
        if (link) updateData.jakmall_url = link
        await db.from("products").update(updateData).eq("id", existingId)
        updated++
      } else {
        const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60)
        const slug = base + "-" + sku.toLowerCase()
        await db.from("products").insert({
          name,
          slug,
          source: "Jakmall",
          external_id: sku,
          price,
          description,
          weight,
          image_url: images[0] || null,
          images: images.length > 0 ? images : null,
          jakmall_url: link,
          category: "Aksesoris Mobil",
          is_featured: false,
        })
        created++
      }
    } catch (e) {
      errors.push(`${item.NamaProduk || "?"}: ${(e as Error).message}`)
    }
  }

  return success({ created, updated, errors: errors.length > 0 ? errors : undefined, total: products.length })
}

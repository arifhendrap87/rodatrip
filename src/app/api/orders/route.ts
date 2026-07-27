import { success, rateLimited, badRequest, internalError } from "@/lib/api/response"
import { publicLimiter } from "@/lib/api/rate-limit"
import { db } from "@/lib/services/db"
import { z } from "zod"

const WA_NUMBER = process.env.WHATSAPP_NUMBER || "6281234567890"

const createOrderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().int().min(0),
  })).min(1),
  total: z.number().int().min(0),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
})

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = await publicLimiter(`orders:${ip}`)
  if (!allowed) return rateLimited(30)

  const body = await request.json()
  const parsed = createOrderSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest(parsed.error.issues.map((e) => e.message).join(", "))
  }

  const { items, total, customerName, customerPhone, customerAddress } = parsed.data

  // Validate prices against database
  const productIds = items.map((i) => i.id).filter(Boolean)
  if (productIds.length > 0) {
    const { data: products } = await db
      .from("products")
      .select("id, price")
      .in("id", productIds)

    const priceMap = new Map((products || []).map((p: any) => [p.id, p.price]))
    for (const item of items) {
      if (!priceMap.has(item.id)) continue // unknown product, skip validation
      if (item.price !== priceMap.get(item.id)) {
        return badRequest(`Harga ${item.name} tidak sesuai. Harap refresh halaman.`)
      }
    }
  }

  const waMessage = items
    .map((item, i) => `${i + 1}. ${item.name} - Rp ${item.price.toLocaleString()}`)
    .join("\n")

  const waText = [
    "Halo, saya ingin order:",
    "",
    waMessage,
    "",
    `Total: Rp ${total.toLocaleString()}`,
    customerName ? `\nNama: ${customerName}` : "",
    customerAddress ? `\nAlamat: ${customerAddress}` : "",
  ].filter(Boolean).join("\n")

  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`

  // Save order to database (best-effort)
  const { data: order } = await db
    .from("orders")
    .insert({
      status: "pending",
      total,
      items: items.map(({ id, name, price }) => ({ id, name, price })),
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      customer_address: customerAddress || null,
    })
    .select("id")
    .single()

  return success({
    waUrl,
    orderId: order?.id || null,
  }, 201)
}

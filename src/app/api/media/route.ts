import { success, rateLimited, paginated, badRequest, unauthorized, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { adminLimiter } from "@/lib/api/rate-limit"
import { uploadImage } from "@/lib/storage"
import { db } from "@/lib/services/db"

export async function GET(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const folder = searchParams.get("folder") || undefined
  const search = searchParams.get("search") || undefined
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100)
  const offset = Number(searchParams.get("offset")) || 0

  let query = db.from("media").select("*", { count: "exact" }).order("created_at", { ascending: false })

  if (folder) query = query.eq("folder", folder)
  if (search) query = query.ilike("filename", `%${search}%`)

  const { data, error, count } = await query.range(offset, offset + limit - 1)

  if (error) return paginated([], 0, limit, offset)

  return paginated(data, count || 0, limit, offset)
}

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = await adminLimiter(`media-upload:${ip}`)
  if (!allowed) return rateLimited(30)

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  const folder = ((formData.get("folder") as string) || "spots")
    .replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")

  if (!file) return badRequest("File required")

  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) return badRequest("File maksimal 10MB")

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"]
  if (!allowedTypes.includes(file.type)) return badRequest("Tipe file harus jpg, png, webp, atau avif")

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-")
    const url = await uploadImage(buffer, fileName, folder)

    const key = url.split("/").slice(-3).join("/")

    const { data, error } = await db
      .from("media")
      .insert({
        url,
        key,
        filename: file.name,
        mime_type: file.type,
        size: file.size,
        folder,
      })
      .select("id, url, filename, key, folder, created_at")
      .single()

    if (error) return internalError(`Gagal simpan ke database: ${error.message}`)

    return success(data, 201)
  } catch (err) {
    return internalError(`Gagal upload gambar${err instanceof Error ? `: ${err.message}` : ''}`)
  }
}

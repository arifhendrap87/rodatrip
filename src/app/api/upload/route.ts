import { success, badRequest, unauthorized, internalError, rateLimited } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { adminLimiter } from "@/lib/api/rate-limit"
import { uploadImage } from "@/lib/storage"
import sharp from "sharp"

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = await adminLimiter(`upload:${ip}`)
  if (!allowed) return rateLimited(30)

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  const folder = (formData.get("folder") as string) || "spots"

  if (!file) return badRequest("File required")

  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) return badRequest("File maksimal 10MB")

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"]
  if (!allowedTypes.includes(file.type)) return badRequest("Tipe file harus jpg, png, webp, atau avif")

  try {
    let buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    let fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-").replace(/\.[^.]+$/, ".webp")

    // Optimize with sharp: resize max 1200px + convert to WebP
    const img = sharp(buffer)
    const metadata = await img.metadata()
    const width = metadata.width || 1920

    if (width > 1200 || ext !== "webp") {
      const resized = sharp(buffer).resize(Math.min(width, 1200), undefined, { withoutEnlargement: true })
      buffer = await resized.webp({ quality: 80 }).toBuffer()
    }

    const url = await uploadImage(buffer, fileName, folder)

    return success({ url })
  } catch {
    return internalError("Gagal upload gambar")
  }
}

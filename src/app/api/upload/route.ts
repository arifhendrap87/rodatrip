import { success, badRequest, unauthorized, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { adminLimiter } from "@/lib/api/rate-limit"
import { uploadImage } from "@/lib/storage"

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = await adminLimiter(`upload:${ip}`)
  if (!allowed) return unauthorized("Rate limited")

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  const folder = (formData.get("folder") as string) || "spots"

  if (!file) return badRequest("File required")

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) return badRequest("File maksimal 5MB")

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"]
  if (!allowedTypes.includes(file.type)) return badRequest("Tipe file harus jpg, png, webp, atau avif")

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-")
    const url = await uploadImage(buffer, fileName, folder)

    return success({ url })
  } catch {
    return internalError("Gagal upload gambar")
  }
}

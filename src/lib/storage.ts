import { db } from "@/lib/services/db"

const env = process.env.VERCEL_ENV || "development"
const envPrefix = env === "production" ? "prod" : "staging"

const BUCKET = "gaskuy-images"
const PROJECT_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "")
const PUBLIC_URL = `${PROJECT_URL}/storage/v1/object/public/${BUCKET}`

function getContentType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase()
  const types: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    avif: "image/avif",
  }
  return types[ext || ""] || "image/jpeg"
}

export async function uploadImage(
  file: Buffer,
  fileName: string,
  folder: string = "spots"
): Promise<string> {
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
  const path = `${envPrefix}/${safeFolder}/${Date.now()}-${fileName}`

  const { error } = await db.storage.from(BUCKET).upload(path, file, {
    contentType: getContentType(fileName),
    upsert: true,
  })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)
  return `${PUBLIC_URL}/${path}`
}

export async function deleteImage(key: string): Promise<void> {
  const { error } = await db.storage.from(BUCKET).remove([key])
  if (error) throw new Error(`Storage delete failed: ${error.message}`)
}

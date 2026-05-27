import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!
const bucketName = process.env.CLOUDFLARE_R2_PUBLIC_BUCKET!

const env = process.env.VERCEL_ENV || "development"
const envPrefix = env === "production" ? "prod" : env === "preview" ? "staging" : "dev"

// Public domain — updates when custom domain is ready
const PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || `${bucketName}.r2.cloudflarestorage.com`

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
})

export async function uploadImage(
  file: Buffer,
  fileName: string,
  folder: string = "spots"
): Promise<string> {
  const key = `${envPrefix}/${folder}/${Date.now()}-${fileName}`

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file,
      ContentType: getContentType(fileName),
    })
  )

  return `https://${PUBLIC_DOMAIN}/${key}`
}

export async function deleteImage(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  )
}

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

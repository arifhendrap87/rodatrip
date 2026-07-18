import { success, badRequest, unauthorized, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { uploadImage } from "@/lib/storage"

const API_TOKEN = process.env.REPLICATE_API_TOKEN
const API_URL = "https://api.replicate.com/v1/models/black-forest-labs/flux-2-pro/predictions"

const ENHANCE_PROMPTS: Record<string, string> = {
  alam: "Enhance this nature landscape photo, improve lighting and color, make it vibrant and sharp with rich green and blue tones, keep the original scene exactly as is, photorealistic, natural lighting, high detail",
  kuliner: "Improve food photography lighting, enhance textures and colors, make it appetizing and warm, keep the dish and arrangement exactly as is, photorealistic, sharp details",
  budaya: "Enhance cultural scene, improve contrast and warmth, keep authentic details, natural warm colors, sharp details, photorealistic",
  foto: "Enhance photo quality, improve composition and lighting, make colors pop naturally, keep original subject and scene, sharp details, photorealistic",
  petualangan: "Enhance adventure scene, improve dynamic range, make sky and landscape vivid, keep original scene, natural lighting, high detail",
  sejarah: "Enhance historical site photo, improve lighting and sharpness, keep architectural details accurate, natural colors, photorealistic",
  hotel: "Enhance property photo, improve indoor lighting, make space look inviting, realistic warm colors, sharp details, keep original layout",
  restaurant: "Enhance restaurant ambiance photo, warm cozy lighting, improve food and interior details, keep original scene, photorealistic",
}

async function callReplicate(imageUrl: string, prompt: string): Promise<string> {
  if (!API_TOKEN) throw new Error("REPLICATE_API_TOKEN not configured")

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
      "Prefer": "wait",
    },
    body: JSON.stringify({
      input: {
        image: imageUrl,
        prompt,
        output_format: "jpeg",
        num_outputs: 1,
      },
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    const errMsg = data?.detail || data?.error || `Replicate API error (${res.status})`
    throw new Error(errMsg)
  }

  if (data.status === "failed") {
    throw new Error(data.error || "Image generation failed")
  }

  if (data.status === "succeeded" && data.output) {
    const outputUrl = Array.isArray(data.output) ? data.output[0] : data.output
    return outputUrl as string
  }

  // If still processing (sync mode timed out), use polling
  if (data.status === "starting" || data.status === "processing") {
    const predictionId = data.id
    const getUrl = `https://api.replicate.com/v1/predictions/${predictionId}`

    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 2000))
      const pollRes = await fetch(getUrl, {
        headers: { "Authorization": `Bearer ${API_TOKEN}` },
      })
      const pollData = await pollRes.json()

      if (pollData.status === "succeeded" && pollData.output) {
        const outputUrl = Array.isArray(pollData.output) ? pollData.output[0] : pollData.output
        return outputUrl as string
      }
      if (pollData.status === "failed") {
        throw new Error(pollData.error || "Image generation failed")
      }
    }
    throw new Error("Timed out waiting for image generation")
  }

  throw new Error("Unexpected response from Replicate API")
}

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  try {
    const { imageUrl, prompt, category } = await request.json()

    if (!imageUrl) return badRequest("imageUrl wajib diisi")

    const finalPrompt = prompt || (category ? ENHANCE_PROMPTS[category] : null) || ENHANCE_PROMPTS.foto

    const outputUrl = await callReplicate(imageUrl, finalPrompt)

    // Download hasil dari Replicate
    const imgRes = await fetch(outputUrl)
    if (!imgRes.ok) throw new Error("Gagal download hasil generate")

    const buffer = Buffer.from(await imgRes.arrayBuffer())
    const fileName = `enhanced-${Date.now()}.jpeg`
    const folder = "enhanced"

    // Upload ke Supabase Storage
    const url = await uploadImage(buffer, fileName, folder)

    return success({ url })
  } catch (err) {
    return internalError(err instanceof Error ? err.message : "Gagal generate gambar")
  }
}

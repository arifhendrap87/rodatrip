import { success, badRequest, unauthorized, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { uploadImage } from "@/lib/storage"

const API_TOKEN = process.env.REPLICATE_API_TOKEN
const API_URL = "https://api.replicate.com/v1/models/black-forest-labs/flux-2-pro/predictions"

const DEFAULT_PROMPT = "Photorealistic scenic landscape photo, natural lighting, high detail, vibrant colors, professional photography style"

async function callReplicate(prompt: string): Promise<string> {
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
        prompt,
        output_format: "jpg",
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
    const { prompt } = await request.json()

    const finalPrompt = prompt || DEFAULT_PROMPT

    const outputUrl = await callReplicate(finalPrompt)

    const imgRes = await fetch(outputUrl)
    if (!imgRes.ok) throw new Error("Gagal download hasil generate")

    const buffer = Buffer.from(await imgRes.arrayBuffer())
    const fileName = `generated-${Date.now()}.jpg`
    const folder = "generated"

    const url = await uploadImage(buffer, fileName, folder)

    return success({ url })
  } catch (err) {
    return internalError(err instanceof Error ? err.message : "Gagal generate gambar")
  }
}

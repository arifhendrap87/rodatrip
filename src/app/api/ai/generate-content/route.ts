import { success, badRequest, internalError } from "@/lib/api/response"

const API_KEY = process.env.DEEPSEEK_API_KEY
const API_URL = "https://api.deepseek.com/chat/completions"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== "string") {
      return badRequest("Prompt is required")
    }

    if (!API_KEY) {
      return internalError("AI API key not configured")
    }

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "Kamu adalah social media content writer untuk platform RodaTrip. Jawab dalam Bahasa Indonesia." },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 1024,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      const errMsg = data?.error?.message || `AI API error (${res.status})`
      return internalError(errMsg)
    }

    const text = data?.choices?.[0]?.message?.content || ""

    return success({ text })
  } catch (err) {
    return internalError(err instanceof Error ? err.message : "Failed to call AI API")
  }
}

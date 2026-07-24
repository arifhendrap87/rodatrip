import { success, badRequest, internalError } from "@/lib/api/response"

const API_KEY = process.env.DEEPSEEK_API_KEY
const API_URL = "https://api.deepseek.com/chat/completions"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()
    if (!prompt || typeof prompt !== "string") return badRequest("Prompt is required")
    if (!API_KEY) return internalError("AI API key not configured")

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          { role: "system", content: "Kamu adalah content writer travel untuk platform RodaTrip. Output HANYA JSON valid, tanpa teks lain." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 8192,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message || `AI API error (${res.status})`)

    const text = data?.choices?.[0]?.message?.content || ""

    // Coba parse JSON dari response — handle berbagai format
    let json: Record<string, unknown> | null = null
    try {
      // Ambil blok ```json ... ``` jika ada
      const blockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      const toParse = blockMatch ? blockMatch[1].trim() : text.trim()

      // Cari { ... } pertama dan terakhir
      const firstBrace = toParse.indexOf("{")
      const lastBrace = toParse.lastIndexOf("}")
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        json = JSON.parse(toParse.substring(firstBrace, lastBrace + 1))
      }
    } catch {
      // JSON tidak valid
    }

    return success({ json, raw: text })
  } catch (err) {
    return internalError(err instanceof Error ? err.message : "Failed to generate")
  }
}

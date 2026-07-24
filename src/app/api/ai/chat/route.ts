import { success, badRequest, unauthorized, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"

const API_KEY = process.env.DEEPSEEK_API_KEY
const API_URL = "https://api.deepseek.com/chat/completions"

const SYSTEM_PROMPT = `Kamu adalah asisten CMS RodaTrip — platform roadtrip Indonesia.
Tugasmu membantu admin mengelola konten:
- Membuat caption sosial media (Facebook, Instagram, TikTok)
- Membantu menulis dan mengedit artikel blog
- Membantu SEO (judul, meta description, tags)
- Menjawab pertanyaan seputar roadtrip dan pariwisata Indonesia

Gunakan Bahasa Indonesia yang baik dan informatif.
Jika admin bertanya di luar konteks RodaTrip, arahkan kembali dengan sopan.`

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  if (!API_KEY) return internalError("DeepSeek API key not configured")

  const { messages } = await request.json()

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return badRequest("Messages wajib diisi")
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((m: Message) => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return internalError(err?.error?.message || `AI API error (${res.status})`)
    }

    const data = await res.json()
    const reply = data?.choices?.[0]?.message?.content || ""

    return success({ reply })
  } catch (err) {
    return internalError(err instanceof Error ? err.message : "Failed to chat")
  }
}

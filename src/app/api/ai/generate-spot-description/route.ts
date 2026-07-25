import { success, badRequest, unauthorized, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"

const API_KEY = process.env.DEEPSEEK_API_KEY
const API_URL = "https://api.deepseek.com/chat/completions"

async function callDeepSeek(prompt: string): Promise<string> {
  if (!API_KEY) throw new Error("DEEPSEEK_API_KEY not configured")

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      messages: [
        { role: "system", content: "Kamu adalah content writer SEO untuk platform travel RodaTrip. Output HANYA JSON valid." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error?.message || `AI API error (${res.status})`)
  }
  return data?.choices?.[0]?.message?.content || ""
}

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  try {
    const { name, category, province, city, existingDescription } = await request.json()
    if (!name) return badRequest("name wajib diisi")

    const cleanExisting = existingDescription ? existingDescription.replace(/<[^>]+>/g, "").slice(0, 300) : ""

    const prompt = `Buatkan konten SEO lengkap untuk destinasi wisata berikut:
Nama: "${name}"
Kategori: ${category || "-"}
Lokasi: ${city ? `${city}, ` : ""}${province || "-"}

Deskripsi saat ini: ${cleanExisting || "(kosong)"}

Output HANYA JSON valid (tanpa markdown, tanpa teks lain):
{
  "description": "2-3 paragraf HTML (<p>...</p><p>...</p>) yang informatif, engaging, sertakan keunikan tempat dan aktivitas. 150-300 kata.",
  "seo_title": "Judul SEO max 60 karakter, sertakan nama tempat dan kata kunci utama.",
  "meta_description": "Meta deskripsi max 160 karakter, deskripsi menarik untuk hasil pencarian Google."
}

Aturan:
- description: Bahasa Indonesia, gunakan <p> untuk paragraf, <strong> untuk kata kunci
- seo_title: max 60 karakter, contoh: "${name} — Destinasi Wisata ${province || ""} Terbaik"
- meta_description: max 160 karakter, contoh: "Nikmati keindahan ${name} di ${province || ""}. [daya tarik singkat]. [aktivitas]."`

    const raw = await callDeepSeek(prompt)

    // Try to parse JSON from response
    let json: { description?: string; seo_title?: string; meta_description?: string } = {}
    try {
      // Find JSON block in response (handle markdown wrapping)
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (jsonMatch) json = JSON.parse(jsonMatch[0])
      else json = JSON.parse(raw)
    } catch {
      // Fallback: return raw text as description
      return success({ text: raw, seo_title: name, meta_description: name })
    }

    return success({
      description: json.description || raw,
      seo_title: json.seo_title || name,
      meta_description: json.meta_description || name,
    })
  } catch (err) {
    return internalError(err instanceof Error ? err.message : "Gagal generate konten SEO")
  }
}

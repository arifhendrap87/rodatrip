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
      max_tokens: 2048,
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

Output HANYA JSON valid (tanpa markdown, tanpa teks lain, tanpa baris baru di dalam string values):
{
  "description": "Artikel HTML lengkap minimal 5 paragraf (400-600 kata)",
  "seo_title": "Judul SEO max 60 karakter, sertakan nama tempat dan kata kunci utama.",
  "meta_description": "Meta deskripsi max 160 karakter, deskripsi menarik untuk hasil pencarian Google."
}

Aturan description:
- Output HARUS 5-6 paragraf dengan struktur WAJIB:
  1. Opening — pengenalan tempat (lokasi, status, keunikan utama)
  2. Daya Tarik & Keunikan — apa yang membuat tempat ini spesial, nilai sejarah/budaya/alam
  3. Aktivitas Wisata — minimal 4 poin aktivitas, gunakan <ul>/<li>
  4. Suasana & Lingkungan — gambaran visual, cuaca, waktu terbaik, tips foto
  5. Fasilitas & Akses — informasi praktis: parkir, toilet, warung, tiket
  6. Closing — ajakan atau rekomendasi
- Gunakan <p> untuk paragraf, <h3> untuk sub-heading, <ul>/<li> untuk daftar, <strong> untuk kata kunci
- Bahasa Indonesia natural dan mengalir seperti artikel blog traveling
- Minimal 500-700 kata
- SEO friendly: sertakan kata kunci "${name}" secara natural di seluruh artikel
- seo_title: max 60 karakter, contoh: "${name} — Destinasi Wisata ${province || ""} Terbaik"
- meta_description: max 160 karakter, contoh: "Nikmati keindahan ${name} di ${province || ""}. [daya tarik singkat]. [aktivitas]."
- WAJIB: Jangan gunakan baris baru di dalam string JSON. Semua HTML harus dalam satu baris.`

    let raw = await callDeepSeek(prompt)

    // Retry once if empty
    if (!raw) {
      raw = await callDeepSeek(prompt)
    }

    // Try to parse JSON from response
    let json: { description?: string; seo_title?: string; meta_description?: string } = {}
    let parsed = false

    function parseJson(str: string) {
      const match = str.match(/\{[\s\S]*\}/)
      if (!match) throw new Error("No JSON found")
      // Escape newlines inside string values (DeepSeek often returns literal newlines in description)
      const escaped = match[0].split('"').map((part, i) =>
        i % 2 === 1 ? part.replace(/\n/g, "\\n").replace(/\t/g, "\\t") : part
      ).join('"')
      return JSON.parse(escaped)
    }

    try {
      json = parseJson(raw)
      parsed = true
    } catch {
      // Retry once if JSON parsing failed
      try {
        const retryRaw = await callDeepSeek(prompt)
        json = parseJson(retryRaw)
        parsed = true
      } catch {
        // fallback
      }
    }

    if (!parsed) {
      return success({
        description: raw ? raw : "",
        seo_title: name,
        meta_description: name,
      })
    }

    return success({
      description: json.description || (raw ? raw : ""),
      seo_title: json.seo_title || name,
      meta_description: json.meta_description || name,
    })
  } catch (err) {
    return internalError(err instanceof Error ? err.message : "Gagal generate konten SEO")
  }
}

import { success, badRequest, internalError } from "@/lib/api/response"

const API_KEY = process.env.DEEPSEEK_API_KEY
const API_URL = "https://api.deepseek.com/chat/completions"

const SYSTEM_PROMPT = `Kamu adalah content writer untuk RodaTrip — platform roadtrip Indonesia.
Tuliskan dalam Bahasa Indonesia yang engaging, informatif, dan SEO-friendly.
Gunakan format HTML standar untuk konten.`

async function callDeepSeek(prompt: string): Promise<string> {
  if (!API_KEY) throw new Error("AI API key not configured")

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
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
  try {
    const { action, topic, existingData } = await request.json()

    if (!action) return badRequest("action wajib diisi (ide / tulis / seo)")

    let prompt = ""

    switch (action) {
      case "ide":
        prompt = `Buatkan 5 ide artikel blog menarik tentang topik: "${topic || 'Tips Roadtrip'}".

Format output (HANYA JSON array, tanpa teks lain):
[
  {
    "title": "Judul artikel yang SEO-friendly",
    "excerpt": "Deskripsi singkat 1-2 kalimat",
    "category": "salah satu dari: Tips, Inspirasi, Destinasi, Tutorial, Review, Perawatan Mobil, Kendaraan"
  }
]

Aturan:
- Judul harus menarik, click-worthy, tapi tidak clickbait
- Gunakan Bahasa Indonesia
- Sesuaikan dengan topik "${topic}" yang diberikan
- Kategori harus spesifik dan relevan dengan topik`
        break

      case "tulis":
        prompt = `Buatkan artikel blog lengkap tentang: "${existingData?.title || topic}"

Data pendukung:
${existingData?.spots ? `Spot terkait: ${existingData.spots}` : ""}
${existingData?.category ? `Kategori: ${existingData.category}` : ""}
${existingData?.excerpt ? `Ringkasan: ${existingData.excerpt}` : ""}

Aturan:
- Tulis dalam Bahasa Indonesia yang engaging
- Gunakan format HTML standar untuk konten (bukan markdown)
- <h2> untuk judul, <h3> untuk sub-judul, <p> untuk paragraf, <strong> untuk bold, <ul>/<li> untuk list
- Contoh:
  <h2>Judul Bagian</h2>
  <p>Isi paragraf yang informatif...</p>
  <ul>
    <li>Poin pertama</li>
    <li>Poin kedua</li>
  </ul>
- Panjang: 500-800 kata
- Struktur: pengantar → isi (3-4 bagian) → kesimpulan
- Sisipkan emoji yang relevan di dalam <p>
- Gunakan tone: ${existingData?.category || 'Tips'}
- Akhiri dengan CTA ke RodaTrip
- Output HANYA HTML, tanpa tag html/body/head, tanpa teks lain`
        break

      case "seo":
        prompt = `Buatkan meta data SEO untuk artikel berikut:
Judul: "${existingData?.title || topic}"
Konten: "${existingData?.excerpt || existingData?.content?.replace(/<[^>]+>/g, '').slice(0, 200) || ''}"

Format output (HANYA JSON, tanpa teks lain):
{
  "title": "Judul SEO (max 60 karakter)",
  "description": "Meta description (max 160 karakter)",
  "slug": "slug-url-dari-judul",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Aturan:
- Slug harus URL-friendly (lowercase, ganti spasi dengan -)
- Tags relevan dengan konten
- Description informatif dan mengundang klik`
        break

      default:
        return badRequest("action tidak valid")
    }

    const result = await callDeepSeek(prompt)
    return success({ text: result })
  } catch (err) {
    return internalError(err instanceof Error ? err.message : "Failed to generate")
  }
}

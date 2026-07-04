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
        const toneHints: Record<string, string> = {
          "Tips": "praktis, langsung ke inti, seperti saran dari teman",
          "Destinasi": "deskriptif, visual, membangun imajinasi tempat",
          "Inspirasi": "storytelling, emosional, personal",
          "Review": "opini jujur, kelebihan & kekurangan, perbandingan",
          "Tutorial": "langkah demi langkah, instruksional, mudah diikuti",
          "Perawatan Mobil": "teknis tapi mudah dipahami, safety first",
          "Kendaraan": "informatif, detail teknis, rekomendasi",
        }

        prompt = `Buatkan artikel blog lengkap tentang: "${existingData?.title || topic}"

Data pendukung:
${existingData?.spots ? `Spot terkait: ${existingData.spots}` : ""}
${existingData?.category ? `Kategori: ${existingData.category}` : ""}
${existingData?.excerpt ? `Ringkasan: ${existingData.excerpt}` : ""}

## STRUKTUR WAJIB:
1. Paragraf pembuka (3-4 kalimat) — hook pembaca
2. 3-4 section utama, masing-masing: <h2> → <p> (3-4 kalimat) → <h3> optional → <p> → <ul> optional
3. 1 section tips praktis dengan <ul>
4. Paragraf penutup + CTA natural

## ATURAN FORMAT:
- Output HANYA HTML standar, tanpa tag html/body/head, tanpa CSS, tanpa teks lain
- <h2> untuk section utama, <h3> untuk sub-section (JANGAN pakai H1)
- Setiap <p> minimal 3-4 kalimat — JANGAN ada paragraf 1-2 kalimat
- <strong> untuk kata kunci penting (max 2 per paragraf)
- Gunakan <ul>/<li> untuk list tips atau daftar
- <blockquote> untuk kutipan atau testimoni (optional)
- Maks 1 emoji, hanya di heading H2, jangan di paragraf

## TONE:
${toneHints[existingData?.category || ""] || "informatif dan engaging"}

## SEO:
- Sisipkan secara natural 2-3 keyword: roadtrip, ${existingData?.category?.toLowerCase() || "perjalanan"}, ${(existingData?.title || topic).toLowerCase()}
- Pastikan heading mengandung keyword

## CTA:
- Akhiri dengan 1 paragraf CTA yang natural (bukan "Kunjungi RodaTrip" doang)
- Contoh CTA: "Siap merencanakan roadtrip berikutnya? Yuk, cek itinerary lengkapnya di RodaTrip."
- Jangan pake link HTML, cukup teks "RodaTrip"

Panjang total: 500-800 kata`
        break

      case "gambar":
        prompt = `Buatkan 1 prompt untuk AI image generator (Midjourney/DALL-E) berdasarkan judul artikel berikut:

Judul: "${existingData?.title || topic}"
Kategori: ${existingData?.category || "Tips"}

Aturan:
- Output HANYA teks prompt, tanpa penjelasan lain
- Gunakan Bahasa Inggris untuk prompt utama (Midjourney lebih optimal dengan English)
- Sertakan: subjek utama, lingkungan/setting, pencahayaan, suasana, gaya visual
- Format yang cocok untuk Midjourney (deskriptif, detail, tidak terlalu pendek)
- Jangan gunakan --ar atau parameter teknis Midjourney
- Prompt length: 50-100 kata`
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

      case "tags":
        prompt = `Berdasarkan judul dan konten artikel blog berikut, buatkan tags yang relevan untuk SEO:

Judul: "${existingData?.title || topic}"
Kategori: ${existingData?.category || "Tips"}
${existingData?.excerpt ? `Excerpt: ${existingData.excerpt}` : ""}

Output HANYA JSON array of strings, tanpa teks lain:
["tag1", "tag2", "tag3", ...]

Aturan:
- Tags dalam Bahasa Indonesia, lowercase
- Relevan dengan topik artikel
- Campuran antara lokasi, topik, dan aktivitas
- Minimal 5, maksimal 10 tags
- Jangan gunakan kata umum seperti "blog", "artikel", "tips" saja`
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

import { getServerAdmin } from "@/lib/api/auth"
import { success, badRequest, internalError, unauthorized } from "@/lib/api/response"

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
      model: "deepseek-v4-pro",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 8000,
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
    const admin = await getServerAdmin()
    if (!admin) return unauthorized()

    const { action, topic, existingData, existingTitles } = await request.json()

    if (!action) return badRequest("action wajib diisi (ide / tulis / seo)")

    let prompt = ""

    switch (action) {
      case "ide":
        const existingText = existingTitles?.length > 0
          ? `\n\nJudul blog yang SUDAH ADA di website (JANGAN buat yang sama ATAU terlalu mirip topiknya):\n${existingTitles.map((t: string) => `- "${t}"`).join("\n")}`
          : ""
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
- Kategori harus spesifik dan relevan dengan topik${existingText}
${existingTitles?.length > 0 ? `\nAturan ANTI-DUPLIKAT:
- JANGAN buat judul yang topiknya sama atau mirip dengan judul yang sudah ada di daftar di atas
- Contoh: jika sudah ada "10 Cara Hemat BBM Saat Roadtrip", jangan buat "7 Cara Hemat BBM" atau "Tips Irit BBM"
- Perhatikan kesamaan kata kunci utama: jika dua judul punya kata kunci inti yang sama (misal "Hemat BBM"), itu dianggap duplikat
- Fokus pada ide FRESH dan sudut pandang yang benar-benar baru` : ""}`
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
        const categoryGambar = existingData?.category || "Tips"
        const categoryRules: Record<string, string> = {
          "Tips": "- Fokus pada kendaraan roadtrip di jalan pedesaan/pegunungan Indonesia\n- Latar: sawah, perkebunan teh, gunung berapi, hutan tropis\n- Jangan sertakan warung, toko, candi, orang, bangunan komersial",
          "Destinasi": "- Fokus pada pemandangan alam destinasi wisata Indonesia\n- Latar: pantai tropis, gunung, danau, air terjun khas Indonesia\n- Jangan sertakan bangunan modern, candi, mall",
          "Kuliner": "- Fokus pada makanan tradisional Indonesia\n- Latar: daun pisang, cobek, tampah, gentong tanah liat\n- Jangan sertakan restoran mewah, orang makan",
          "Review": "- Fokus pada produk/barang dengan latar penggunaan di Indonesia\n- Latar: garasi tradisional, rumah joglo, pedesaan\n- Jangan sertakan studio foto, orang",
          "Inspirasi": "- Fokus pada panorama alam epik Indonesia\n- Latar: pegunungan, pantai, matahari terbit/terbenam khas tropis\n- Jangan sertakan bangunan, orang, kendaraan",
          "Tutorial": "- Fokus pada alat/bahan dengan latar Indonesia\n- Latar: meja kayu, latar pedesaan/pegunungan tropis\n- Jangan sertakan orang, bangunan modern",
          "Perawatan Mobil": "- Fokus pada mobil/aksesoris mobil di lingkungan tropis Indonesia\n- Latar: bengkel tradisional, jalan pedesaan, halaman rumah\n- Jangan sertakan showroom, gedung modern, orang",
        }

        prompt = `Buatkan 1 prompt untuk AI image generator (Midjourney/DALL-E) berdasarkan:

Judul: "${existingData?.title || topic}"
Kategori: ${categoryGambar}
Konten: ${existingData?.content ? existingData.content.slice(0, 400) : "(tidak ada konten)"}

Gunakan konten artikel sebagai referensi untuk menghasilkan gambar yang relevan dengan topik yang dibahas.

Aturan spesifik untuk ${categoryGambar}:
${categoryRules[categoryGambar] || categoryRules["Tips"]}

Aturan umum:
- Output HANYA teks prompt, tanpa penjelasan lain
- Gunakan Bahasa Inggris untuk prompt utama
- WAJIB bernuansa Indonesia (tropis, vegetasi Indonesia)
- JANGAN buat prompt yang terlihat seperti lokasi luar negeri (Eropa, Jepang, Amerika, dll)
- JANGAN sertakan: warung, toko, pedagang, payung, tenda, candi, kuil, masjid, gereja, bangunan religius
- Gaya: cinematic, golden hour, photorealistic, high detail
- Format deskriptif, detail, 50-100 kata
- Jangan gunakan --ar atau parameter teknis Midjourney`
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

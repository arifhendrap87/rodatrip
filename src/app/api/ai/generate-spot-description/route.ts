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
        { role: "system", content: "Kamu adalah content writer spesialis SEO untuk platform travel RodaTrip. Output hanya teks HTML." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
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

    const prompt = `Buatkan deskripsi SEO untuk destinasi wisata berikut:
Nama: "${name}"
Kategori: ${category || "-"}
Lokasi: ${city ? `${city}, ` : ""}${province || "-"}

Deskripsi saat ini: ${existingDescription ? existingDescription.replace(/<[^>]+>/g, "").slice(0, 200) : "(kosong)"}

Aturan:
- Buat 2-3 paragraf deskripsi yang informatif dan engaging
- Sertakan: keunikan tempat, aktivitas yang bisa dilakukan, suasana/lokasi
- Gunakan Bahasa Indonesia yang natural dan mengalir
- Output HANYA teks deskripsi dalam HTML: gunakan tag <p> untuk paragraf, <strong> untuk kata kunci penting
- Panjang: 150-300 kata
- Optimasi SEO: sertakan kata kunci terkait "${name}", wisata ${province || ""}, dan aktivitas wisata di daerah tersebut`

    const result = await callDeepSeek(prompt)
    return success({ text: result })
  } catch (err) {
    return internalError(err instanceof Error ? err.message : "Gagal generate deskripsi")
  }
}

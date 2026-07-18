import { success, badRequest, internalError } from "@/lib/api/response"

const API_KEY = process.env.DEEPSEEK_API_KEY
const API_URL = "https://api.deepseek.com/chat/completions"

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
        { role: "system", content: "Kamu adalah asisten yang membantu generate prompt untuk AI image generator." },
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
  try {
    const { type, title, category, description } = await request.json()
    if (!type || !title) return badRequest("type dan title wajib diisi")

    let typeLabel = ""
    if (type === "spot") typeLabel = "destinasi wisata"
    else if (type === "roadtrip") typeLabel = "roadtrip itinerary"
    else return badRequest("type harus 'spot' atau 'roadtrip'")

    const prompt = `Buatkan 1 prompt untuk AI image generator (Midjourney/DALL-E) berdasarkan ${typeLabel} berikut:

Nama: "${title}"
${category ? `Kategori: ${category}` : ""}
${description ? `Deskripsi: ${description}` : ""}

Aturan:
- Output HANYA teks prompt, tanpa penjelasan lain
- Gunakan Bahasa Inggris untuk prompt utama (Midjourney lebih optimal dengan English)
- Sertakan: subjek utama, lingkungan/setting, pencahayaan, suasana, gaya visual
- Format yang cocok untuk Midjourney (deskriptif, detail, tidak terlalu pendek)
- Jangan gunakan --ar atau parameter teknis Midjourney
- Prompt length: 50-100 kata
- DILARANG membuat asumsi elemen fiktif seperti kendaraan spesifik (mobil merah, motor, dll), waktu spesifik (pagi, siang, malam), atau orang tertentu yang TIDAK ADA di data deskripsi
- PILIH SATU LOKASI PALING REPRESENTATIF: Jika ${typeLabel} adalah roadtrip, pilih SATU spot destinasi dari deskripsi yang paling ikonik dan gambarkan HANYA tempat itu secara utuh. Jangan menggambarkan perjalanan atau transisi antar lokasi.
- DILARANG menggunakan kata transisi seperti "transitioning", "passing through", "then narrowing", "moving to", "leading to" — karena akan menghasilkan gambar komposit tidak realistis.
- Fokus pada detail visual SATU lokasi spesifik (nama tempat, arsitektur/lingkungan, pencahayaan, suasana) — bukan pada kendaraan atau orang imajiner.`

    const result = await callDeepSeek(prompt)
    return success({ text: result })
  } catch (err) {
    return internalError(err instanceof Error ? err.message : "Failed to generate")
  }
}

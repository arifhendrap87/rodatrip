interface ContentSource {
  type: "roadtrip" | "spot" | "blog"
  id: string
  title: string
  description?: string
  whySpecial?: string
  category?: string
  province?: string
  city?: string
  region?: string
  price?: string
  parkingFee?: string
  additionalCost?: string
  duration?: string
  tips?: string
  rating?: number
  bestTime?: string
  bestVisitHour?: string
  visitDuration?: string
  physicalEffort?: string
  openingHours?: string
  roadAccess?: string
  spotImportantNote?: string
  distanceFromCity?: string
  facilities?: string[]
  popularRoutes?: { from: string; duration: string }[]
  nearbyHotels?: string
  nearbyRestaurants?: string
  images?: { url: string; alt?: string }[]
  coverImage?: string
  totalDistance?: string
  estimatedCost?: string
  stops?: { name: string; category?: string }[]
}

function formatCurrency(amount: string): string {
  return amount || "Rp —"
}

function stars(rating?: number): string {
  if (!rating) return ""
  return "⭐".repeat(Math.round(rating))
}

const CATEGORY_EMOJI: Record<string, string> = {
  alam: "🏔️", kuliner: "🍜", budaya: "🏛️", foto: "📸", petualangan: "🏞️", sejarah: "🏛️",
}

const ENGAGEMENT_HOOKS: Record<string, string[]> = {
  facebook: [
    "👇 Komen destinasi roadtrip favorit kamu!",
    "🔖 Simpan buat referensi perjalanan berikutnya!",
    "Tag temen yang suka jalan-jalan 👇",
    "Udah pernah ke sini? Cerita dong di komentar!",
    "Share ke group roadtrip biar pada tau!",
  ],
  instagram: [
    "👇 Udah pernah ke sini? Cerita!",
    "🔖 Simpan buat wishlist roadtrip!",
    "Tag temen yang wajib diajak! 👇",
    "Komen angka 1-10 buat rating tempat ini!",
  ],
  tiktok: [
    "Follow @rodatrip.id buat rekomendasi roadtrip!",
    "Share ke temen yang suka jalan-jalan!",
    'Komen "MAU" kalo pengen ke sini!',
  ],
}

function randomHook(platform: string): string {
  const hooks = ENGAGEMENT_HOOKS[platform] || ENGAGEMENT_HOOKS.facebook
  return hooks[Math.floor(Math.random() * hooks.length)]
}

function getCategoryEmoji(source: ContentSource): string {
  return CATEGORY_EMOJI[source.category || ""] || "📍"
}

function fullDetail(source: ContentSource): string {
  const lines: string[] = []
  if (source.province) lines.push(`📍 ${source.province}${source.city ? `, ${source.city}` : ""}`)
  if (source.price) lines.push(`🎟️ ${source.price}`)
  if (source.parkingFee) lines.push(`🅿️ ${source.parkingFee}`)
  if (source.openingHours) lines.push(`🕐 ${source.openingHours}`)
  if (source.bestTime) lines.push(`⏰ ${source.bestTime}`)
  if (source.visitDuration) lines.push(`⏱️ ${source.visitDuration}`)
  if (source.physicalEffort) lines.push(`🏃 ${source.physicalEffort}`)
  if (source.roadAccess) lines.push(`🛣️ ${source.roadAccess}`)
  if (source.distanceFromCity) lines.push(`📏 ${source.distanceFromCity}`)
  if (source.rating) lines.push(`${stars(source.rating)} ${source.rating}/5`)
  if (source.additionalCost) lines.push(`💸 ${source.additionalCost}`)
  if (source.spotImportantNote) lines.push(`⚠️ ${source.spotImportantNote}`)
  if (source.facilities && source.facilities.length > 0) lines.push(`🔧 ${source.facilities.slice(0, 5).join(" · ")}`)
  if (source.nearbyHotels) {
    try {
      const hotels = JSON.parse(source.nearbyHotels) as { name: string; distance?: string }[]
      if (hotels.length > 0) lines.push(`🏨 Terdekat: ${hotels.slice(0, 2).map(h => `${h.name}${h.distance ? ` (${h.distance})` : ""}`).join(", ")}`)
    } catch {}
  }
  return lines.join("\n")
}

function detailCompact(source: ContentSource): string {
  const parts: string[] = []
  if (source.price) parts.push(`🎟️ ${source.price}`)
  if (source.bestTime) parts.push(`⏰ ${source.bestTime}`)
  if (source.visitDuration) parts.push(`⏱️ ${source.visitDuration}`)
  if (source.rating) parts.push(`${stars(source.rating)}`)
  return parts.join(" | ")
}

function engagementLine(platform: string): string {
  return `\n\n${randomHook(platform)}`
}

function ctaLine(): string {
  return `\n👉 RodaTrip — rencanakan roadtrip impianmu!\nhttps://rodatrip.id`
}

// ─── PER-KATEGORI HOOK ───

function categoryHook(source: ContentSource): string {
  const cat = source.category || ""
  const title = source.title
  const desc = source.description?.slice(0, 120) || ""
  const special = source.whySpecial?.slice(0, 100) || ""
  const emoji = getCategoryEmoji(source)

  const hooks: Record<string, string> = {
    alam: `${emoji} ${title} — alamnya masih perawan banget! ${desc ? `\n${desc}` : ""}`,
    kuliner: `${emoji} ${title} — surga kuliner yang wajib kamu cobain! ${desc ? `\n${desc.slice(0, 100)}` : ""}`,
    budaya: `${emoji} ${title} — kaya akan budaya dan sejarah! ${desc ? `\n${desc}` : ""}`,
    foto: `${emoji} ${title} — spot foto paling estetik! ${desc ? `\n${desc}` : ""}`,
    petualangan: `${emoji} ${title} — tantangan seru buat jiwa petualang! ${desc || ""}`,
    sejarah: `${emoji} ${title} — menyimpan cerita dari masa lalu. ${desc ? `\n${desc.slice(0, 100)}` : ""}`,
  }
  return hooks[cat] || `${emoji} ${title} — ${desc || "wajib dikunjungi!"}`
}

// ─── FACEBOOK ───

function facebookPromo(source: ContentSource): string {
  const isSpot = source.type === "spot"
  const emoji = getCategoryEmoji(source)
  const hook = categoryHook(source)
  const detail = fullDetail(source)
  const tip = source.tips || ""
  const engage = engagementLine("facebook")

  return isSpot
    ? `${emoji} SPOT ISTIMEWA: ${source.title}

${hook}

━━━ LENGKAP ―――
${detail}
${tip ? `\n💡 ${tip}` : ""}
${engage}
${ctaLine()}`
    : `🚗 ROAD TRIP: ${source.title}

${hook}

━━━ RUTE ―――
${source.duration ? `📅 ${source.duration}` : ""}
${source.totalDistance ? `📏 ${source.totalDistance}` : ""}
${source.estimatedCost ? `💰 ${source.estimatedCost}` : ""}
${source.stops?.map((s, i) => `📍 Stop ${i + 1}: ${s.name}`).join("\n") || ""}

${tip ? `💡 ${tip}` : ""}
${engage}
${ctaLine()}`
}

function facebookEdukasi(source: ContentSource): string {
  const isSpot = source.type === "spot"
  const emoji = getCategoryEmoji(source)
  const special = source.whySpecial
  const detail = fullDetail(source)

  return `${emoji} ${source.title} — Fakta Menarik!

${special || source.description?.slice(0, 150) || `Tahukah kamu tentang ${source.title}?`}

━━━ DETAIL ―――
${detail}

${source.tips ? `\n💡 ${source.tips}` : ""}
${engagementLine("facebook")}
${ctaLine()}`
}

function facebookInspirasi(source: ContentSource): string {
  const desc = source.description?.slice(0, 200) || ""
  const stopsList = source.stops?.map((s, i) => `  ${i + 1}. ${s.name}`).join("\n") || ""
  const hotelInfo = source.nearbyHotels ? (() => {
    try {
      const hotels = JSON.parse(source.nearbyHotels) as { name: string; distance?: string }[]
      return hotels.slice(0, 2).map(h => `🏨 ${h.name}${h.distance ? ` (${h.distance})` : ""}`).join("\n")
    } catch { return "" }
  })() : ""

  return `🌅 ${source.title}

${desc || `${source.title} adalah salah satu destinasi yang bikin kita pengen balik lagi dan lagi.`}

${stopsList ? `🗺️ ${source.stops?.length || 0} destinasi:\n${stopsList}` : ""}
${hotelInfo ? `\n${hotelInfo}` : ""}

${source.tips ? `💡 ${source.tips}` : ""}
${engagementLine("facebook")}
${ctaLine()}`
}

function facebookStorytelling(source: ContentSource): string {
  const desc = source.description?.slice(0, 250) || ""
  const special = source.whySpecial?.slice(0, 150) || ""
  const tip = source.tips || ""

  const paragraphs: string[] = []

  // Opening
  paragraphs.push(`✨ ${source.title} — Perjalanan yang Tak Terlupakan

${desc || `Perjalanan ke ${source.title} adalah salah satu yang paling berkesan. Bukan cuma karena pemandangannya, tapi karena momen-momen kecil yang terjadi di sepanjang jalan.`}`)

  // Middle
  const middleParts: string[] = []
  if (special) middleParts.push(`Yang bikin tempat ini spesial: ${special}.`)
  if (source.rating) middleParts.push(`Rating ${source.rating}/5 dari pengunjung — dan setuju banget!`)
  if (source.physicalEffort || source.bestTime) middleParts.push(`${source.physicalEffort ? `Tingkat kesulitan: ${source.physicalEffort}. ` : ""}${source.bestTime ? `Waktu terbaik: ${source.bestTime}.` : ""}`)

  if (middleParts.length > 0) {
    paragraphs.push(`━━━ PENGALAMAN ―――

${middleParts.join("\n")}`)
  }

  // Closing
  paragraphs.push(`━━━ PESAN ―――

${tip || `Roadtrip itu bukan cuma soal tujuan, tapi juga perjalanan dan cerita yang kamu bawa pulang. ${source.title} adalah salah satu cerita yang gak akan pernah terlupakan.`}

${engagementLine("facebook")}
${ctaLine()}`)

  return paragraphs.join("\n\n")
}

// ─── INSTAGRAM ───

function instagramPromo(source: ContentSource): string {
  const emoji = getCategoryEmoji(source)
  const hook = categoryHook(source)
  const compact = detailCompact(source)
  const detail = fullDetail(source)
  const h = randomHook("instagram")

  return `${emoji} ${source.title}

${hook}

${compact}

━━━ INFO ―――
${detail}

${h}`
}

function instagramEdukasi(source: ContentSource): string {
  const special = source.whySpecial || ""
  const detail = fullDetail(source)

  return `🧐 TAHUKAH KAMU?

${special || source.description?.slice(0, 120) || ""}

━━━ INFO ―――
${detail}

${source.tips ? `💡 ${source.tips}` : ""}

${randomHook("instagram")}`
}

function instagramInspirasi(source: ContentSource): string {
  const emoji = getCategoryEmoji(source)

  return `${emoji} ${source.title}

${source.description?.slice(0, 100) || ""}${(source.description?.length || 0) > 100 ? "..." : ""}

${source.whySpecial ? `✨ ${source.whySpecial.slice(0, 80)}` : ""}
${stars(source.rating)}

${randomHook("instagram")}`
}

function instagramStorytelling(source: ContentSource): string {
  return `✨ ${source.description?.slice(0, 120) || `Pernah ke ${source.title}?}`}${(source.description?.length || 0) > 120 ? "..." : ""}

${source.whySpecial ? `💬 "${source.whySpecial.slice(0, 100)}"` : ""}

📍 ${source.title}${source.province ? `, ${source.province}` : ""}

${source.tips ? `💡 ${source.tips.slice(0, 80)}` : ""}

Kapan nih roadtrip bareng RodaTrip? 🚗💨

━━━ INFO ―――
${fullDetail(source)}

${randomHook("instagram")}`
}

// ─── TIKTOK ───

function tiktokPromo(source: ContentSource): string {
  const emoji = getCategoryEmoji(source)
  const title = source.title
  const location = source.province || "Indonesia"
  const desc = source.description?.slice(0, 80) || ""
  const tips = source.tips || ""
  const priceInfo = source.type === "spot" ? `Tiket ${source.price || "—"}` : `Estimasi ${source.estimatedCost || "—"}`

  return `⏱️ DURASI: 45-60 dtk | 🎵 MUSIK: Upbeat/trending
🎬 TRANSISI: Cepat (0.5s), zoom in/out

━━━ SEGMEN 1: HOOK (0:00-0:06) ━━━
🎬 Visual: ${emoji} ${title} dari angle terbaik + text overlay "🔥 ${title}"
Transisi: Cut cepat + zoom in (0.5s)
🔊 VO: "Kamu WAJIB tau tempat ini!"
📝 Caption editor: "[TITLE] 🔥 #rodatrip"

━━━ SEGMEN 2: INFO (0:06-0:18) ━━━
🎬 Visual: ${desc.slice(0, 60)}
Transisi: Swipe left
🔊 VO: "${priceInfo} loh! ${desc}"
📝 Caption editor: "Lokasi: ${location}"

━━━ SEGMEN 3: TIPS (0:18-0:32) ━━━
🎬 Visual: ${source.type === "spot" ? "Orang nikmatin spot" : "Klip perjalanan"}
Transisi: Zoom out
🔊 VO: "${tips || "Jangan lupa siapkan kendaraan sebelum roadtrip!"}"
📝 Caption editor: "💡 Tips di caption"

━━━ SEGMEN 4: CTA (0:32-0:45) ━━━
🎬 Visual: Logo RodaTrip fade in
Transisi: Fade
🔊 VO: "Follow @rodatrip.id buat rekomendasi roadtrip seru!"
📝 Caption editor: "@rodatrip.id 🔔"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
}

function tiktokEdukasi(source: ContentSource): string {
  const title = source.title
  const location = source.province || "Indonesia"
  const special = source.whySpecial?.slice(0, 60) || ""
  const tips = source.tips || ""
  const detail = fullDetail(source)

  return `⏱️ DURASI: 45-60 dtk | 🎵 MUSIK: Lo-fi / nature sounds
🎬 TRANSISI: Pelan (1s), cross dissolve

━━━ SEGMEN 1: INTRO (0:00-0:08) ━━━
🎬 Visual: ${title} slow zoom in + text overlay
Transisi: Cross dissolve (1s)
📝 Caption editor: "${title} | ${location}"

━━━ SEGMEN 2: FAKTA (0:08-0:25) ━━━
🎬 Visual: Detail spot + informasi
🔊 VO: "${special || `${title} di ${location}, tau gak sih...`}"
📝 Caption editor: "${special.slice(0, 50)}"

━━━ SEGMEN 3: INFO LENGKAP (0:25-0:45) ━━━
🎬 Visual: ${detail.slice(0, 100)}
🔊 VO: "${tips || "Ini yang perlu kamu tau sebelum ke sini!"}"
📝 Caption editor: "👇 Info lengkap di caption"

━━━ SEGMEN 4: OUTRO (0:45-0:60) ━━━
🎬 Visual: Logo RodaTrip
Transisi: Fade
🔊 VO: "Follow @rodatrip.id biar makin jago roadtrip!"
📝 Caption editor: "@rodatrip.id 🔔"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
}

function tiktokInspirasi(source: ContentSource): string {
  const title = source.title
  const desc = source.description?.slice(0, 80) || ""
  const stops = source.stops?.map(s => s.name).join(" → ") || title

  return `⏱️ DURASI: 30-45 dtk | 🎵 MUSIK: Calming / lo-fi / acoustic
🎬 TRANSISI: Slow fade (1.5s), slow motion

━━━ SEGMEN 1: HOOK VISUAL (0:00-0:08) ━━━
🎬 Visual: Slow-mo ${title} + golden hour
Transisi: Super slow fade
📝 Caption editor: "✨ ${desc.slice(0, 50)}..."

━━━ SEGMEN 2: JOURNEY (0:08-0:25) ━━━
🎬 Visual: ${stops}
Transisi: Cross dissolve
📝 Caption editor: "${stops} 🚗"

━━━ SEGMEN 3: INSPIRASI (0:25-0:45) ━━━
🎬 Visual: Text overlay + musik naik
📝 Caption editor: "Tambahin ke wishlist roadtrip kamu! 🚗💨"
💬 Caption: "Share ke temen yang suka jalan-jalan! @rodatrip.id"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
}

function tiktokStorytelling(source: ContentSource): string {
  const title = source.title
  const desc = source.description?.slice(0, 80) || ""
  const tips = source.tips || ""

  return `⏱️ DURASI: 45-60 dtk | 🎵 MUSIK: Emotional / acoustic
🎬 TRANSISI: Slow fade + cross dissolve

━━━ SEGMEN 1: PEMBUKAAN (0:00-0:10) ━━━
🎬 Visual: Aesthetic shot ${title} + text "✨ A story..."
Transisi: Fade in
📝 Caption editor: "${desc.slice(0, 60)}..."

━━━ SEGMEN 2: CERITA (0:10-0:30) ━━━
🎬 Visual: ${source.type === "spot" ? "Detail spot + suasana" : "Klip perjalanan"}
🔊 VO: "${desc || `Perjalanan ke ${title}`}"
📝 Caption editor: "📍 ${title}"

━━━ SEGMEN 3: MOMEN (0:30-0:45) ━━━
🎬 Visual: ${source.type === "spot" ? "Momen terbaik" : "Momen seru"}
📝 Caption editor: "${tips || "Moment that matters ❤️"}"

━━━ SEGMEN 4: CTA (0:45-0:60) ━━━
🎬 Visual: Logo RodaTrip
Transisi: Fade out
📝 Caption editor: "Kapan mau roadtrip? Tag temen kamu! 👇 @rodatrip.id"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
}

// ─── EXPORTED ───

export function generateFacebookPromo(source: ContentSource): string { return facebookPromo(source) }
export function generateFacebookEdukasi(source: ContentSource): string { return facebookEdukasi(source) }
export function generateFacebookInspirasi(source: ContentSource): string { return facebookInspirasi(source) }
export function generateFacebookStorytelling(source: ContentSource): string { return facebookStorytelling(source) }
export function generateInstagramPromo(source: ContentSource): string { return instagramPromo(source) }
export function generateInstagramEdukasi(source: ContentSource): string { return instagramEdukasi(source) }
export function generateInstagramInspirasi(source: ContentSource): string { return instagramInspirasi(source) }
export function generateInstagramStorytelling(source: ContentSource): string { return instagramStorytelling(source) }
export function generateTikTokPromo(source: ContentSource): string { return tiktokPromo(source) }
export function generateTikTokEdukasi(source: ContentSource): string { return tiktokEdukasi(source) }
export function generateTikTokInspirasi(source: ContentSource): string { return tiktokInspirasi(source) }
export function generateTikTokStorytelling(source: ContentSource): string { return tiktokStorytelling(source) }

export function generateHashtags(source: ContentSource, platform: string): string {
  const base: string[] = ["#RodaTrip", "#RoadtripIndonesia"]

  if (source.title) base.push(`#${source.title.replace(/\s+/g, "")}`)
  if (source.category) {
    const catTags: Record<string, string> = {
      alam: "#SpotAlam", kuliner: "#KulinerNusantara", budaya: "#BudayaIndonesia",
      foto: "#SpotFoto", petualangan: "#Petualangan", sejarah: "#Sejarah",
    }
    if (catTags[source.category]) base.push(catTags[source.category])
  }
  if (source.province) base.push(`#${source.province.replace(/\s+/g, "")}`)
  if (source.city) base.push(`#${source.city.replace(/\s+/g, "")}`)
  if (source.rating && source.rating >= 4.5) base.push("#HiddenGem")
  if (source.physicalEffort === "Ringan") base.push("#CocokUntukPemula")

  base.push("#ExploreIndonesia", "#JalanJalanYuk")

  if (platform === "instagram") {
    base.push("#TravelIndonesia", "#LiburanSeru", "#JalanJalan")
  }

  if (platform === "tiktok") {
    base.push("#fyp", "#rodatrip")
  }

  const unique = [...new Set(base)]
  const categoryOrder = ["#RodaTrip", "#RoadtripIndonesia", "#ExploreIndonesia"]
  const rest = unique.filter(t => !categoryOrder.includes(t))
  const highPriority = categoryOrder.filter(t => unique.includes(t))

  if (platform === "instagram") {
    return [...highPriority, ...rest].slice(0, 15).join(" ")
  }
  return [...highPriority, ...rest].slice(0, 8).join(" ")
}

export function generateAIPrompt(source: ContentSource, platform: string, tone: string): string {
  const platformLabel = { facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok" }[platform] || platform
  const toneDesc = {
    promo: "Promosi — ajak audiens untuk datang/berkunjung",
    edukasi: "Edukasi — berikan informasi bermanfaat dan tips",
    inspirasi: "Inspirasi — bangkitkan semangat jalan-jalan",
    storytelling: "Storytelling — ceritakan pengalaman perjalanan",
  }[tone] || tone

  const isSpot = source.type === "spot"
  const kontenLabel = isSpot ? "Spot/Destinasi Wisata" : "Roadtrip Itinerary"
  const spec = platformSpecs[platform]
  const catEmoji = CATEGORY_EMOJI[source.category || ""] || "📍"

  const spotFields = [
    ["Nama", source.title],
    ["Kategori", `${catEmoji} ${source.category}`],
    ["Provinsi", source.province],
    ["Kota", source.city],
    ["Region", source.region],
    ["Deskripsi", source.description],
    ["Keunikan (why_special)", source.whySpecial],
    ["Rating", source.rating],
    ["Harga Tiket", source.price],
    ["Biaya Parkir", source.parkingFee],
    ["Biaya Tambahan", source.additionalCost],
    ["Jam Buka", source.openingHours],
    ["Durasi Kunjungan", source.visitDuration],
    ["Waktu Terbaik", source.bestTime],
    ["Tingkat Fisik", source.physicalEffort],
    ["Akses Jalan", source.roadAccess],
    ["Catatan Penting", source.spotImportantNote],
    ["Jarak dari Kota", source.distanceFromCity],
    ["Tips", source.tips],
    ["Fasilitas", source.facilities?.join(", ")],
    ["Rute Populer", source.popularRoutes?.map(r => `${r.from} (${r.duration})`).join(", ")],
    ["Hotel Terdekat", source.nearbyHotels],
    ["Restoran Terdekat", source.nearbyRestaurants],
  ].filter(([_, v]) => v && v !== "" && v !== "—" && v !== "0" && String(v) !== "undefined" && v !== "[]" && v !== "{}")

  const spotDataList = spotFields.map(([label, value]) => `- ${label}: ${value}`).join("\n")

  return `Kamu adalah social media content writer untuk platform "RodaTrip" — platform roadtrip itinerary Indonesia.
Buatkan 1 konten untuk ${platformLabel} dengan tone ${toneDesc}.

## DATA ${kontenLabel.toUpperCase()}
${isSpot ? spotDataList : `- Judul: ${source.title}
- Provinsi: ${source.province || "—"}
- Deskripsi: ${source.description || "—"}
- Durasi: ${source.duration || "—"}
- Jarak: ${source.totalDistance || "—"}
- Estimasi Biaya: ${source.estimatedCost || "—"}
- Tips: ${source.tips || "—"}
- Destinasi: ${source.stops?.map(s => s.name).join(", ") || "—"}`}

## SPESIFIKASI PLATFORM
- Maks karakter: ${spec.maxChars}
- Gaya: ${spec.style}
- Struktur: ${spec.structure}

## FORMAT OUTPUT DETAIL
${platform === "facebook"
  ? `Tulis caption dengan struktur alami (tanpa marker):
[Paragraf 1: Hook engaging, dengan emoji, 2-3 kalimat]
[Paragraf 2: Detail informasi lokasi, harga, jam buka, fasilitas]
[Paragraf 3: Tips bermanfaat untuk audiens]
[Paragraf 4: CTA ajakan kunjungi RodaTrip dan ajakan interaksi]
[Akhiri dengan hashtag minimal 3-4]`
  : platform === "instagram"
  ? `Tulis caption pendek dengan struktur alami:
[Hook visual 1-2 kalimat dengan emoji]
[Detail singkat]
[CTA interaksi: ajakan komen/simpan/share]

[Di baris terakhir: 10-15 hashtag relevan dari data di atas]

Setelah caption, berikan visual guide untuk carousel IG. SETIAP SLIDE WAJIB SERTAKAN prompt untuk AI image generator (Midjourney/DALL-E):
🎨 SLIDE 1 (Cover): deskripsi gambar + teks overlay + 🤖 Prompt: "prompt bahasa Inggris untuk generate gambar slide ini"
🎨 SLIDE 2 (Info): deskripsi gambar + info + 🤖 Prompt: "prompt bahasa Inggris untuk generate gambar"
🎨 SLIDE 3 (Tips): deskripsi gambar + tips + 🤖 Prompt: "prompt bahasa Inggris"
🎨 SLIDE 4 (CTA): background + CTA + 🤖 Prompt: "prompt bahasa Inggris"`
  : `Tulis skrip TikTok dengan struktur per segmen dan SERTAKAN:
[Durasi per segmen]
[Jenis transisi]
[Genre musik rekomendasi]
[Caption untuk editor video]

Setelah skrip, berikan visual guide untuk slideshow TT. SETIAP SLIDE WAJIB SERTAKAN prompt untuk AI image generator (Midjourney/DALL-E):
🎬 SLIDE 1 (Hook): deskripsi gambar + teks overlay + 🤖 Prompt: "prompt bahasa Inggris untuk generate gambar slide ini"
🎬 SLIDE 2 (Info): deskripsi gambar + teks + 🤖 Prompt: "prompt bahasa Inggris"
🎬 SLIDE 3 (Tips): deskripsi gambar + teks + 🤖 Prompt: "prompt bahasa Inggris"
🎬 SLIDE 4 (CTA): logo + teks + 🤖 Prompt: "prompt bahasa Inggris"`}

## ATURAN
- Bahasa Indonesia natural dan engaging
- Gunakan tone "${tone}" secara konsisten
- Promosikan RodaTrip sebagai platform roadtrip
${platform === "tiktok" ? "- Sertakan transisi dan musik recommendation" : "- Gunakan emoji yang relevan (max 3-4 per paragraf)"}
${platform === "facebook" ? "- Jangan gunakan hashtag berlebihan (max 3-4)" : platform === "instagram" ? "- Sertakan 10-15 hashtag dari data spot" : ""}
${platform === "instagram" ? "- Hashtag berdasarkan provinsi, kota, kategori spot" : ""}
- Output HANYA teks konten, tanpa penjelasan lain`
}

const platformSpecs: Record<string, { maxChars: string; style: string; structure: string }> = {
  facebook: { maxChars: "1.000-2.000", style: "Storytelling, personal, emoji tiap segmen", structure: "Hook → Detail → Tips → CTA" },
  instagram: { maxChars: "150-300 (tanpa hashtag)", style: "Estetik, ringan, emoji", structure: "Hook visual → Deskripsi → CTA → 10-15 Hashtag" },
  tiktok: { maxChars: "15-60 detik", style: "Cepat, engaging, text overlay", structure: "Hook → Info → Tips → CTA → Outro" },
}

export function renderTemplate(source: ContentSource, platform: string, tone: string): { caption: string; hashtags: string; skrip_tiktok: string; visual_prompt: string } {
  const visualPrompt = renderVisualPrompt(source, platform)

  if (platform === "tiktok") {
    const tiktokFns: Record<string, (s: ContentSource) => string> = {
      promo: tiktokPromo, edukasi: tiktokEdukasi, inspirasi: tiktokInspirasi, storytelling: tiktokStorytelling,
    }
    const skrip = (tiktokFns[tone] || tiktokPromo)(source)
    return { caption: skrip, hashtags: "", skrip_tiktok: skrip, visual_prompt: visualPrompt }
  }

  const fbFns: Record<string, (s: ContentSource) => string> = {
    promo: facebookPromo, edukasi: facebookEdukasi, inspirasi: facebookInspirasi, storytelling: facebookStorytelling,
  }
  const igFns: Record<string, (s: ContentSource) => string> = {
    promo: instagramPromo, edukasi: instagramEdukasi, inspirasi: instagramInspirasi, storytelling: instagramStorytelling,
  }

  const genMap: Record<string, Record<string, (s: ContentSource) => string>> = {
    facebook: fbFns,
    instagram: igFns,
  }

  const caption = genMap[platform]?.[tone]?.(source) || facebookPromo(source)
  const hashtags = generateHashtags(source, platform)

  return { caption, hashtags, skrip_tiktok: "", visual_prompt: visualPrompt }
}

export function renderVisualPrompt(source: ContentSource, platform: string): string {
  const emoji = getCategoryEmoji(source)
  const title = source.title
  const prov = source.province || "Indonesia"
  const cat = source.category || "wisata"
  const tips = source.tips ? source.tips.slice(0, 60) : "Rencanakan perjalanan dengan baik"
  const imageDesc = source.images?.[0]?.url || source.coverImage || ""

  const aspect = platform === "instagram" ? "--ar 1:1" : "--ar 9:16"
  const catKeywords: Record<string, string> = {
    alam: "beautiful nature, mountain landscape, tropical",
    kuliner: "delicious food photography, Indonesian cuisine",
    budaya: "Indonesian culture, traditional architecture",
    foto: "scenic viewpoint, photography spot",
    petualangan: "adventure travel, outdoor activity",
    sejarah: "historical site, ancient temple",
  }
  const catKw = catKeywords[cat] || "travel destination, Indonesia"
  const directPrompt = `\n\n🤖 DIRECT AI PROMPT (copy → paste ke Midjourney / DALL-E / Leonardo AI)\n${title}, ${catKw}, ${prov}, Indonesia, vibrant colors, natural lighting, high quality, 8K, professional photography ${aspect}`

  const catAdj: Record<string, string> = {
    alam: "beautiful nature, misty morning",
    kuliner: "delicious food plating",
    budaya: "traditional culture, heritage",
    foto: "scenic, photogenic",
    petualangan: "adventure, outdoor",
    sejarah: "historical, ancient",
  }
  const adj = catAdj[cat] || "travel, destination"

  const slidePrompt = (slide: number, desc: string) =>
    `  🤖 Prompt: "${desc}, ${adj}, ${prov}, Indonesia, vibrant colors, natural lighting, professional photography, 8K ${aspect}"`

  if (platform === "instagram") {
    return `🎨 VISUAL PROMPT — IG CAROUSEL (4-5 Slide)
━━━━━━━━━━━━━━━━━━━━━━━
Format: 1080×1080 px | Font: Montserrat | Warna brand: #D95D39 (orange) & #2C4A3E (hijau)

Slide 1 — Cover:
  🖼️ Gambar: ${imageDesc || `${emoji} ${title}, angle wide, ${cat === "alam" ? "golden hour" : "siang hari"}`}
  📝 Overlay: "${title}" — font bold besar di tengah
  🎨 Style: Foto full, gradient overlay hitam 60%, teks putih
${slidePrompt(1, `${emoji} ${title} wide angle view, beautiful landscape, ${prov}`)}

Slide 2 — Info Lokasi:
  🖼️ Gambar: ${imageDesc || `Detail ${title}, ${prov}`}
  📝 Overlay: "📍 ${prov}" — font medium, kiri bawah
  🎨 Style: Clean, teks putih dengan background transparan
${slidePrompt(2, `${title} main entrance, signboard, tourist spot in ${prov}`)}

Slide 3 — Detail:
  🖼️ Gambar: Suasana sekitar ${title}
  📝 Overlay: "${cat === "kuliner" ? "🍜 Rekomendasi kuliner" : "💡 Tips perjalanan"} | ${tips.slice(0, 40)}"
  🎨 Style: Minimalis, teks putih, background orange transparan
${slidePrompt(3, `${title} atmosphere, visitors enjoying, travel experience`)}"

Slide 4 — Roadtrip Vibe:
  🖼️ Gambar: Roadtrip/car scenery (bisa dari Unsplash)
  📝 Overlay: "🛣️ Planning roadtrip? Yuk cek RodaTrip"
  🎨 Style: Forest green bg, teks putih, logo RodaTrip di kanan atas
${slidePrompt(4, "road trip adventure, car driving on mountain road, Indonesia travel")}

Slide 5 — CTA:
  🖼️ Gambar: ${imageDesc || `Collage ${title}`}
  📝 Overlay: "👇 Tap link di bio!" + logo RodaTrip
  🎨 Style: Brand orange bg, teks putih bold
${slidePrompt(5, `${title} collage, best moments, travel memories, Indonesia`)}
━━━━━━━━━━━━━━━━━━━━━━━${directPrompt}`
  }

  if (platform === "tiktok") {
    return `🎬 PROMPT VISUAL — TT SLIDESHOW (9:16 vertikal)
━━━━━━━━━━━━━━━━━━━━━━━
Durasi: 0-3 dtk per slide | Total: ~15 dtk
Musik: ${cat === "alam" ? "Lo-fi / chill" : "Upbeat / trending"}
Font: bold, putih, posisi tengah

Slide 1 — Hook (0:00-0:03):
  🖼️ Gambar: Foto utama ${title}, landscape crop ke vertikal
  📝 Teks: "${title} 🔥" (font besar, tengah)
  ✂️ Efek: Zoom in pelan
${slidePrompt(1, `${emoji} ${title} stunning view, vertical shot, ${prov}`)}

Slide 2 — Info (0:03-0:06):
  🖼️ Gambar: Foto ${prov} atau detail spot
  📝 Teks: "📍 ${prov}"
  ✂️ Efek: Swipe up
${slidePrompt(2, `travel destination ${title}, sign, location in ${prov}`)}

Slide 3 — Tips (0:06-0:09):
  🖼️ Gambar: ${imageDesc || `${cat === "kuliner" ? "Foto makanan" : "Foto spot"}`}
  📝 Teks: "💡 ${tips.slice(0, 50)}"
  ✂️ Efek: Fade
${slidePrompt(3, `${title} travel tips, tourist activity, ${prov}`)}

Slide 4 — CTA (0:09-0:12):
  🖼️ Gambar: Background roadtrip atau logo RodaTrip
  📝 Teks: "🚗 RodaTrip — Planning roadtrip?" (font kecil, bawah)
  ✂️ Efek: Fade out + logo RodaTrip
${slidePrompt(4, "Indonesia road trip, adventure travel, car journey")}
━━━━━━━━━━━━━━━━━━━━━━━${directPrompt}`
  }

  return ""
}

export function getAutoTone(source: ContentSource): string {
  if (source.type === "blog") return "edukasi"
  if (source.type === "roadtrip") return "inspirasi"
  const cat = source.category || ""
  const toneMap: Record<string, string> = {
    alam: "inspirasi",
    kuliner: "promo",
    budaya: "edukasi",
    foto: "inspirasi",
    petualangan: "promo",
    sejarah: "edukasi",
  }
  return toneMap[cat] || "promo"
}

export function getPlatformSpecs() {
  return platformSpecs
}

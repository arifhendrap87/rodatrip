interface ContentSource {
  type: "roadtrip" | "spot"
  id: string
  title: string
  description?: string
  whySpecial?: string
  category?: string
  province?: string
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

const platformSpecs: Record<string, { maxChars: string; style: string; structure: string }> = {
  facebook: { maxChars: "1.000-2.000", style: "Storytelling, personal, emoji tiap segmen", structure: "Hook → Detail → Tips → CTA" },
  instagram: { maxChars: "150-300 (tanpa hashtag)", style: "Estetik, ringan, emoji", structure: "Hook visual → Deskripsi → CTA → 10-15 Hashtag" },
  tiktok: { maxChars: "15-60 detik", style: "Cepat, engaging, text overlay", structure: "Hook → Info → Tips → CTA → Outro" },
}

function specHeader(platform: string, tone: string): string {
  const spec = platformSpecs[platform]
  return `╔══════════════════════════════════════╗
║ ${platform.toUpperCase()} — ${tone} 
║ ══════════════════════════════════
║ 📊 Karakter: ${spec.maxChars}
║ 🎨 Gaya: ${spec.style}
║ 📋 Struktur: ${spec.structure}
╚══════════════════════════════════════`
}

function specFooter(platform: string): string {
  if (platform === "facebook") return "\n\n───\n💡 Tips publikasi: Post pukul 07.00-09.00 atau 19.00-21.00 WIB untuk engagement maksimal. Sertakan foto cover roadtrip sebagai thumbnail."
  if (platform === "instagram") return "\n\n───\n💡 Tips publikasi: Post pukul 11.00-13.00 atau 19.00-21.00 WIB. Gunakan foto landscape atau portrait 4:5. Simpan hashtag di komentar pertama."
  return "\n\n───\n💡 Tips publikasi: Post pukul 07.00-09.00 atau 19.00-23.00 WIB. Gunakan musik trending. Durasi optimal 21-34 detik."
}

function fbParagraf1Hook(source: ContentSource): string {
  if (source.type === "spot") {
    return `${source.description?.slice(0, 120) || `Bosan sama destinasi yang itu-itu aja? Yuk, explore ${source.title}!`}`
  }
  return `${source.description?.slice(0, 120) || `Roadtrip seru ke ${source.title} — siap-siap bikin liburanmu makin berkesan!`}`
}

function fbParagraf2Detail(source: ContentSource): string {
  if (source.type === "spot") {
    let detail = `📍 ${source.title}`
    if (source.province) detail += `\n📍 ${source.province}`
    if (source.price) detail += `\n🎟️ ${source.price}`
    if (source.bestTime) detail += `\n⏰ ${source.bestTime}`
    if (source.rating) detail += `\n${stars(source.rating)} ${source.rating}/5`
    return detail
  }
  let detail = `📍 ${source.title}`
  if (source.province) detail += `\n📍 ${source.province}`
  if (source.duration) detail += `\n📅 ${source.duration}`
  if (source.totalDistance) detail += `\n📏 ${source.totalDistance}`
  if (source.estimatedCost) detail += `\n💰 ${source.estimatedCost}`
  if (source.stops && source.stops.length > 0) {
    detail += `\n🗺️ Rute:\n${source.stops.map((s, i) => `  ${i + 1}. ${s.name}`).join("\n")}`
  }
  return detail
}

function fbParagraf3Tips(source: ContentSource): string {
  const tip = source.tips || "Pastikan kendaraan dalam kondisi prima sebelum berangkat. Cek perlengkapan roadtrip di RodaTrip Shop!"
  return `💡 ${tip}`
}

function fbParagraf4CTA(): string {
  return `👇 Yuk, rencanakan roadtrip impianmu!
Kunjungi RodaTrip untuk itinerary lengkap dan perlengkapan roadtrip
👉 https://rodatrip.id`
}

export function generateFacebookPromo(source: ContentSource): string {
  return `╔══════════════════════════════════════╗
║ FACEBOOK — PROMO
║ ══════════════════════════════════
║ 📊 1.000-2.000 karakter | 🎨 Informatif + CTA
║ 📋 Hook → Detail → Harga/Tips → CTA
╚══════════════════════════════════════

━━━ PARAGRAF 1 — HOOK ━━━
🚗 ${source.type === "spot" ? "SPOT SPOTLIGHT" : "ROAD TRIP"}: ${source.title}

${fbParagraf1Hook(source)}

━━━ PARAGRAF 2 — DETAIL ━━━
${fbParagraf2Detail(source)}

━━━ PARAGRAF 3 — TIPS ━━━
${fbParagraf3Tips(source)}

━━━ PARAGRAF 4 — CTA ━━━
${fbParagraf4CTA()}

───
#RoadtripIndonesia #RodaTrip${source.title ? ` #${source.title.replace(/\s+/g, "")}` : ""} #JalanJalan${specFooter("facebook")}`
}

export function generateFacebookEdukasi(source: ContentSource): string {
  return `╔══════════════════════════════════════╗
║ FACEBOOK — EDUKASI
║ ══════════════════════════════════
║ 📊 800-1.500 karakter | 🎨 Informatif, memberikan wawasan
║ 📋 Fakta → Informasi detail → Tips praktis → CTA
╚══════════════════════════════════════

━━━ PARAGRAF 1 — FAKTA ━━━
🧐 TAHUKAH KAMU?

${source.description?.slice(0, 150) || source.title}

━━━ PARAGRAF 2 — INFORMASI ━━━
${source.type === "spot" ? `📍 ${source.title} ${source.province ? `— ${source.province}` : ""}
${source.price ? `🎟️ ${source.price}` : ""}
${source.bestTime ? `⏰ ${source.bestTime}` : ""}` : `📍 ${source.title}
${source.duration ? `📅 ${source.duration}` : ""}
${source.estimatedCost ? `💰 ${source.estimatedCost}` : ""}`}

━━━ PARAGRAF 3 — TIPS PRAKTIS ━━━
💡 ${source.tips || "Persiapkan diri sebelum berangkat! Pastikan kendaraan dalam kondisi prima dan bawa perlengkapan darurat."}

━━━ PARAGRAF 4 — CTA ━━━
Jadi, udah siap roadtrip? 🚗💨
Rencanakan perjalananmu di 👉 https://rodatrip.id

───
#TipsRoadtrip #TravelTips #RodaTrip #JalanJalanIndonesia${specFooter("facebook")}`
}

export function generateFacebookInspirasi(source: ContentSource): string {
  const stopsList = source.stops?.map((s, i) => `  ${i + 1}. ${s.name}${s.category ? ` (${s.category})` : ""}`).join("\n") || ""

  return `╔══════════════════════════════════════╗
║ FACEBOOK — INSPIRASI
║ ══════════════════════════════════
║ 📊 800-1.500 karakter | 🎨 Storytelling, menggugah
║ 📋 Hook emosional → Deskripsi → Ajakan interaksi
╚══════════════════════════════════════

━━━ PARAGRAF 1 — HOOK EMOSIONAL ━━━
🌅 ADA YANG BERBEDA HARI INI...

${source.description || `Kadang, jalan-jalan terbaik adalah yang tidak direncanakan. Tapi kali ini, ${source.title} berhasil bikin kami terpana!`}

━━━ PARAGRAF 2 — CERITA ━━━
${stopsList ? `🗺️ ${source.stops?.length || 0} destinasi seru menanti:\n${stopsList}` : `📍 ${source.title} ${source.province ? `— ${source.province}` : ""}`}

${source.tips ? `\n📝 ${source.tips}` : ""}

━━━ PARAGRAF 3 — AJAKAN ━━━
Kapan terakhir kali kamu roadtrip? Cerita di kolom komentar! 👇

Buat roadtrip impianmu jadi kenyataan bersama RodaTrip 🚗💨
👉 https://rodatrip.id

───
#InspirasiJalanJalan #Roadtrip #${source.title?.replace(/\s+/g, "") || "Liburan"} #RodaTrip${specFooter("facebook")}`
}

export function generateFacebookStorytelling(source: ContentSource): string {
  return `╔══════════════════════════════════════╗
║ FACEBOOK — STORYTELLING
║ ══════════════════════════════════
║ 📊 1.500-2.500 karakter | 🎨 Naratif personal
║ 📋 Pembukaan → Perjalanan → Momen puncak → Penutup
╚══════════════════════════════════════

━━━ PEMBUKAAN ━━━
✨ PERJALANAN YANG TAK TERLUPAKAN

${source.description?.slice(0, 200) || `Roadtrip ke ${source.title} adalah salah satu pengalaman yang gak akan pernah kami lupakan.`}

━━━ PERJALANAN ━━━
${source.stops && source.stops.length > 0 ? `🗺️ Rute perjalanan hari itu:\n${source.stops.map((s, i) => `  Stop ${i + 1}: ${s.name}`).join("\n")}` : `📍 ${source.title}`}

${source.duration ? `\n📅 Perjalanan ${source.duration}` : ""}

━━━ MOMEN PUNCAK ━━━
${source.tips || "Yang paling berkesan? Bukan destinasi utamanya, tapi perjalanan dan momen-momen kecil di sepanjang jalan."}

━━━ PENUTUP ━━━
💬 ${source.tips || "Roadtrip itu bukan cuma soal tujuan, tapi juga perjalanan dan cerita yang kamu bawa pulang."}

Buat roadtrip impianmu jadi kenyataan bersama RodaTrip! 🚗💨
👉 https://rodatrip.id

───
#CeritaPerjalanan #RoadtripIndonesia #RodaTrip #TravelStory${specFooter("facebook")}`
}

export function generateInstagramPromo(source: ContentSource): string {
  const caption = source.type === "spot"
    ? `✨ ${source.title} — hidden gem wajib dikunjungi!`
    : `🚗 ROAD TRIP: ${source.title}`

  const detail = source.type === "spot"
    ? `📍 ${source.province || "Indonesia"}${source.price ? `\n🎟️ ${source.price}` : ""}`
    : `${source.duration ? `📅 ${source.duration} ` : ""}${source.totalDistance ? `| ${source.totalDistance}` : ""}${source.estimatedCost ? `\n💰 ${source.estimatedCost}` : ""}`

  return `╔══════════════════════════════════════╗
║ INSTAGRAM — PROMO
║ ══════════════════════════════════
║ 📊 150-300 karakter | 🎨 Estetik, ajakan
║ 📋 Hook visual → Detail singkat → CTA → 12-15 hashtag
╚══════════════════════════════════════

━━━ CAPTION ━━━
${caption}

${detail}

${source.tips ? `💡 ${source.tips}` : ""}
${stars(source.rating)}

👇 Udah pernah ke sini?

━━━ HASHTAG (simpan di komentar pertama) ━━━
#${source.title?.replace(/\s+/g, "") || "Explore"} #RoadtripIndonesia #RodaTrip
#JalanJalan #HiddenGem #ExploreIndonesia #TravelIndonesia
#LiburanSeru #JalanJalanYuk #${source.province?.replace(/\s+/g, "") || "Wisata"} #TripSeru${specFooter("instagram")}`
}

export function generateInstagramEdukasi(source: ContentSource): string {
  return `╔══════════════════════════════════════╗
║ INSTAGRAM — EDUKASI
║ ══════════════════════════════════
║ 📊 150-250 karakter | 🎨 Informatif, estetik
║ 📋 Fakta singkat → Detail → Tips → 10-12 hashtag
╚══════════════════════════════════════

━━━ CAPTION ━━━
🧐 TAHUKAH KAMU?

${source.description?.slice(0, 120) || ""}${(source.description?.length || 0) > 120 ? "..." : ""}

📍 ${source.title}
${source.tips ? `💡 ${source.tips}` : ""}
${stars(source.rating)}

━━━ HASHTAG ━━━
#TipsRoadtrip #TravelTips #RodaTrip
#${source.title?.replace(/\s+/g, "") || "Explore"} #JalanJalanIndonesia
#${source.province?.replace(/\s+/g, "") || "Wisata"} #TripSeru${specFooter("instagram")}`
}

export function generateInstagramInspirasi(source: ContentSource): string {
  return `╔══════════════════════════════════════╗
║ INSTAGRAM — INSPIRASI
║ ══════════════════════════════════
║ 📊 100-200 karakter | 🎨 Estetik, menggugah
║ 📋 Hook visual → Deskripsi → Ajakan interaksi → hashtag
╚══════════════════════════════════════

━━━ CAPTION ━━━
🌅 ${source.title}

${source.description?.slice(0, 100) || ""}${(source.description?.length || 0) > 100 ? "..." : ""}

${stars(source.rating)}

👇 Udah pernah ke sini? Cerita dong!

━━━ HASHTAG ━━━
#InspirasiJalanJalan #${source.title?.replace(/\s+/g, "") || "Liburan"}
#RodaTrip #ExploreIndonesia #${source.province?.replace(/\s+/g, "") || "Wisata"}${specFooter("instagram")}`
}

export function generateInstagramStorytelling(source: ContentSource): string {
  return `╔══════════════════════════════════════╗
║ INSTAGRAM — STORYTELLING
║ ══════════════════════════════════
║ 📊 150-250 karakter | 🎨 Naratif personal
║ 📋 Cerita singkat → Lokasi → Ajakan → hashtag
╚══════════════════════════════════════

━━━ CAPTION ━━━
✨ ${source.description?.slice(0, 100) || `Roadtrip ke ${source.title}, siapa mau?`}${(source.description?.length || 0) > 100 ? "..." : ""}

📍 ${source.title}
${source.province ? `📍 ${source.province}` : ""}

Kapan nih roadtrip bareng RodaTrip? 🚗💨

━━━ HASHTAG ━━━
#CeritaPerjalanan #RoadtripIndonesia #RodaTrip
#TravelStory #${source.province?.replace(/\s+/g, "") || "JalanJalan"}${specFooter("instagram")}`
}

export function generateTikTokScript(source: ContentSource, tone: string): string {
  const isSpot = source.type === "spot"
  const baseTitle = source.title
  const description = source.description?.slice(0, 100) || ""
  const tips = source.tips || "Jangan lupa siapkan kendaraan sebelum roadtrip!"
  const priceInfo = isSpot ? `Tiket cuma ${formatCurrency(source.price || "")}` : `Estimasi ${source.estimatedCost || "—"}`
  const location = source.province || "Indonesia"
  const stopsList = source.stops?.slice(0, 3).map(s => s.name).join(", ") || baseTitle

  const scripts: Record<string, string> = {
    promo: `╔══════════════════════════════════════╗
║ TIKTOK — PROMO
║ ══════════════════════════════════
║ ⏱️ 45-60 detik | 🎵 Musik upbeat/trending
║ 📋 Hook → Info → Tips → CTA → Outro
╚══════════════════════════════════════

━━━ SEGMEN 1: HOOK (0:00-0:07) ━━━
🎬 Visual: B-Roll ${baseTitle} + transisi cepat + text overlay besar
🔊 VO: "Kamu harus tau tempat ini! ${baseTitle} di ${location}!"
📝 Text: "${baseTitle} 🔥"

━━━ SEGMEN 2: INFO (0:07-0:20) ━━━
🎬 Visual: ${isSpot ? "Suasana lokasi dari berbagai angle" : "Klip perjalanan + pemandangan"}
🔊 VO: "${description} ${priceInfo} loh!"
📝 Text: "${priceInfo}"

━━━ SEGMEN 3: TIPS (0:20-0:35) ━━━
🎬 Visual: ${isSpot ? "Detail spot + orang menikmati" : "Setiap stop secara singkat"}
🔊 VO: "${tips}"
📝 Text: "💡 ${tips.slice(0, 60)}..."

━━━ SEGMEN 4: CTA (0:35-0:50) ━━━
🎬 Visual: Text overlay informatif + logo RodaTrip
🔊 VO: "Info lengkapnya di RodaTrip — link di bio!"
📝 Text: "Info lengkap di RodaTrip! 👆"

━━━ SEGMEN 5: OUTRO (0:50-0:60) ━━━
🎬 Visual: Logo RodaTrip + fade out
🔊 VO: "Follow @rodatrip.id buat rekomendasi roadtrip seru lainnya!"
📝 Text: "@rodatrip.id"${specFooter("tiktok")}`,

    edukasi: `╔══════════════════════════════════════╗
║ TIKTOK — EDUKASI
║ ══════════════════════════════════
║ ⏱️ 45-60 detik | 🎵 Musik lo-fi/nature sounds
║ 📋 Intro → Fakta → Tips detail → Outro
╚══════════════════════════════════════

━━━ SEGMEN 1: INTRO (0:00-0:08) ━━━
🎬 Visual: ${baseTitle} dari kejauhan, slow zoom in
📝 Text: "${baseTitle} | ${location}"

━━━ SEGMEN 2: FAKTA (0:08-0:25) ━━━
🎬 Visual: ${isSpot ? "Detail spot + informasi sekitar" : "Klip perjalanan + suasana jalan"}
🔊 VO: "Hari ini kita bahas ${baseTitle} di ${location}"
📝 Text: "${description.slice(0, 80)}"

━━━ SEGMEN 3: TIPS DETAIL (0:25-0:45) ━━━
🎬 Visual: ${isSpot ? "Orang menikmati spot + tips visual" : "Setiap stop + tips perjalanan"}
🔊 VO: "${tips}"
📝 Text: "💡 ${tips.slice(0, 60)}..."

━━━ SEGMEN 4: OUTRO (0:45-0:60) ━━━
🎬 Visual: Logo RodaTrip
🔊 VO: "Follow @rodatrip.id biar makin jago roadtrip!"
📝 Text: "Follow @rodatrip.id 🔔"${specFooter("tiktok")}`,

    inspirasi: `╔══════════════════════════════════════╗
║ TIKTOK — INSPIRASI
║ ══════════════════════════════════
║ ⏱️ 30-45 detik | 🎵 Musik calming/lo-fi
║ 📋 Visual aesthetic → Text inspiratif → CTA
╚══════════════════════════════════════

━━━ SEGMEN 1: VISUAL (0:00-0:10) ━━━
🎬 Visual: Slow-mo ${baseTitle} + golden hour + musik calming
📝 Text: "${description || "Tambahin ke wishlist roadtrip kamu!"}"

━━━ SEGMEN 2: DESTINASI (0:10-0:25) ━━━
🎬 Visual: ${isSpot ? "B-Roll lokasi dari berbagai angle" : `Klip ${stopsList}`}
📝 Text: "${source.stops?.map(s => s.name).join(" → ") || baseTitle}"

━━━ SEGMEN 3: CTA (0:25-0:45) ━━━
🎬 Visual: Text overlay aesthetic + logo RodaTrip
📝 Text: "Tambahin ke wishlist roadtrip kamu! 🚗"
🔊 VO: "Share ke temen yang suka jalan-jalan! @rodatrip.id"${specFooter("tiktok")}`,

    storytelling: `╔══════════════════════════════════════╗
║ TIKTOK — STORYTELLING
║ ══════════════════════════════════
║ ⏱️ 45-60 detik | 🎵 Musik emotional/acoustic
║ 📋 Pembukaan → Perjalanan → Momen → CTA
╚══════════════════════════════════════

━━━ SEGMEN 1: PEMBUKAAN (0:00-0:10) ━━━
🎬 Visual: Aesthetic shot ${baseTitle} + transisi pelan
📝 Text: "✨ ${description.slice(0, 60)}..."

━━━ SEGMEN 2: PERJALANAN (0:10-0:30) ━━━
🎬 Visual: ${isSpot ? "Suasana sekitar + detail spot" : "Klip perjalanan + pemandangan setiap stop"}
🔊 VO: "${description}"
📝 Text: "${source.stops?.map(s => s.name).join(" → ") || baseTitle}"

━━━ SEGMEN 3: MOMEN (0:30-0:45) ━━━
🎬 Visual: ${isSpot ? "Momen terbaik di lokasi" : "Momen seru selama perjalanan"}
📝 Text: "${tips || "Moment that matters ❤️"}"

━━━ SEGMEN 4: CTA (0:45-0:60) ━━━
🎬 Visual: Logo RodaTrip + text overlay
📝 Text: "Kapan mau roadtrip? Tag temen kamu! 👇"
🔊 VO: "Jangan lupa follow @rodatrip.id!"${specFooter("tiktok")}`,
  }

  return scripts[tone] || scripts.promo
}

export function generateHashtags(source: ContentSource, platform: string): string {
  const base = ["#RodaTrip", "#RoadtripIndonesia", "#JalanJalan", "#ExploreIndonesia"]
  if (source.title) base.push(`#${source.title.replace(/\s+/g, "")}`)
  if (source.province) base.push(`#${source.province.replace(/\s+/g, "")}`)
  if (source.category) base.push(`#${source.category}`)
  if (platform === "instagram") base.push("#TravelIndonesia", "#LiburanSeru", "#JalanJalanYuk")
  return base.join(" ")
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

  const spotFields = [
    ["Nama", source.title],
    ["Provinsi", source.province],
    ["Region", source.region],
    ["Kategori", source.category],
    ["Deskripsi", source.description],
    ["Keunikan (why_special)", source.whySpecial],
    ["Rating", source.rating],
    ["Harga Tiket", source.price],
    ["Biaya Parkir", source.parkingFee],
    ["Biaya Tambahan", source.additionalCost],
    ["Jam Buka", source.openingHours],
    ["Durasi Kunjungan", source.visitDuration],
    ["Waktu Terbaik Datang", source.bestTime],
    ["Jam Terbaik", source.bestVisitHour],
    ["Tingkat Fisik", source.physicalEffort],
    ["Akses Jalan", source.roadAccess],
    ["Catatan Penting", source.spotImportantNote],
    ["Jarak dari Kota", source.distanceFromCity],
    ["Tips", source.tips],
    ["Fasilitas", source.facilities?.join(", ")],
    ["Rute Populer", source.popularRoutes?.map(r => `${r.from} (${r.duration})`).join(", ")],
    ["Hotel Terdekat", source.nearbyHotels],
    ["Restoran Terdekat", source.nearbyRestaurants],
    ["Jumlah Gambar", source.images?.length],
  ].filter(([_, v]) => v && v !== "" && v !== "—" && v !== "0" && String(v) !== "undefined" && v !== "[]" && v !== "{}")

  const spotDataList = spotFields.map(([label, value]) => `- ${label}: ${value}`).join("\n")

  return `Kamu adalah social media content writer untuk platform "RodaTrip" — platform roadtrip itinerary Indonesia.
Buatkan 1 konten untuk ${platformLabel} dengan tone ${toneDesc}.

## DATA ${kontenLabel.toUpperCase()}
${isSpot ? spotDataList : `- Judul: ${source.title}
- Provinsi: ${source.province || "—"}
- Region: ${source.region || "—"}
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
${
  platform === "facebook"
    ? `Tulis caption dengan struktur:
━━━ PARAGRAF 1 — HOOK ━━━
[Teks hook yang engaging, 1-2 kalimat]

━━━ PARAGRAF 2 — DETAIL ━━━
[Informasi detail: lokasi, harga, durasi, rute]

━━━ PARAGRAF 3 — TIPS ━━━
[Tips bermanfaat untuk audiens]

━━━ PARAGRAF 4 — CTA ━━━
[Ajakan untuk mengunjungi RodaTrip]

───
[Hashtag minimal]`
    : platform === "instagram"
    ? `Tulis caption dengan struktur:
━━━ CAPTION ━━━
[Hook visual 1 kalimat + emoji]
[Detail singkat]
[CTA interaksi]

━━━ HASHTAG ━━━
[10-15 hashtag di baris terakhir]`
    : `Tulis skrip dengan struktur per segmen:
━━━ SEGMEN 1: HOOK (0:00-0:07) ━━━
🎬 Visual: [deskripsi visual]
🔊 VO: [narasi]
📝 Text: [text overlay]

━━━ SEGMEN 2: INFO (0:07-0:20) ━━━
...

━━━ SEGMEN N: CTA (0:XX-0:60) ━━━
...`
}

## ATURAN
- Bahasa Indonesia, santai tapi informatif
- Gunakan tone "${tone}" secara konsisten
- Promosikan RodaTrip sebagai platform roadtrip
${platform === "tiktok" ? "- Durasi total 15-60 detik" : "- Gunakan emoji yang relevan"}
${platform === "facebook" ? "- Jangan gunakan hashtag berlebihan (max 3-4)" : platform === "instagram" ? "- Sertakan 10-15 hashtag relevan" : ""}
${platform === "instagram" ? "- Tulis '━━━ HASHTAG ━━━' sebagai pemisah" : ""}
- Output HANYA teks konten, tanpa penjelasan lain`
}

export function renderTemplate(source: ContentSource, platform: string, tone: string): { caption: string; hashtags: string; skrip_tiktok: string } {
  const genMap: Record<string, Record<string, (s: ContentSource) => string>> = {
    facebook: {
      promo: generateFacebookPromo,
      edukasi: generateFacebookEdukasi,
      inspirasi: generateFacebookInspirasi,
      storytelling: generateFacebookStorytelling,
    },
    instagram: {
      promo: generateInstagramPromo,
      edukasi: generateInstagramEdukasi,
      inspirasi: generateInstagramInspirasi,
      storytelling: generateInstagramStorytelling,
    },
  }

  if (platform === "tiktok") {
    const skrip = generateTikTokScript(source, tone)
    return { caption: skrip, hashtags: "", skrip_tiktok: skrip }
  }

  const caption = genMap[platform]?.[tone]?.(source) || generateFacebookPromo(source)
  const hashtags = generateHashtags(source, platform)

  return { caption, hashtags, skrip_tiktok: "" }
}

export function getPlatformSpecs() {
  return platformSpecs
}

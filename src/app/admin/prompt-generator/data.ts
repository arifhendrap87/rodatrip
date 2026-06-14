export interface KotaItem {
  label: string
  value: string
}

export interface ProvinsiItem {
  label: string
  kota: KotaItem[]
}

export const PROVINSI_DATA: Record<string, ProvinsiItem> = {
  "Jawa Barat": {
    label: "Jawa Barat",
    kota: [
      { label: "Bandung", value: "Bandung" },
      { label: "Bogor", value: "Bogor" },
      { label: "Garut", value: "Garut" },
      { label: "Tasikmalaya", value: "Tasikmalaya" },
      { label: "Cirebon", value: "Cirebon" },
      { label: "Sukabumi", value: "Sukabumi" },
      { label: "Pangandaran", value: "Pangandaran" },
      { label: "Cianjur", value: "Cianjur" },
    ],
  },
  "Jawa Tengah": {
    label: "Jawa Tengah",
    kota: [
      { label: "Semarang", value: "Semarang" },
      { label: "Solo", value: "Solo" },
      { label: "Magelang", value: "Magelang" },
      { label: "Wonosobo", value: "Wonosobo" },
      { label: "Pekalongan", value: "Pekalongan" },
      { label: "Salatiga", value: "Salatiga" },
    ],
  },
  DIY: {
    label: "DIY",
    kota: [
      { label: "Yogyakarta", value: "Yogyakarta" },
      { label: "Sleman", value: "Sleman" },
      { label: "Bantul", value: "Bantul" },
      { label: "Gunung Kidul", value: "Gunung Kidul" },
    ],
  },
  "Jawa Timur": {
    label: "Jawa Timur",
    kota: [
      { label: "Malang", value: "Malang" },
      { label: "Surabaya", value: "Surabaya" },
      { label: "Batu", value: "Batu" },
      { label: "Probolinggo", value: "Probolinggo" },
      { label: "Banyuwangi", value: "Banyuwangi" },
      { label: "Bromo", value: "Bromo" },
      { label: "Madiun", value: "Madiun" },
    ],
  },
  Bali: {
    label: "Bali",
    kota: [
      { label: "Denpasar", value: "Denpasar" },
      { label: "Ubud", value: "Ubud" },
      { label: "Kuta", value: "Kuta" },
      { label: "Gianyar", value: "Gianyar" },
      { label: "Singaraja", value: "Singaraja" },
    ],
  },
  NTB: {
    label: "Nusa Tenggara Barat",
    kota: [
      { label: "Mataram", value: "Mataram" },
      { label: "Lombok Tengah", value: "Lombok Tengah" },
      { label: "Sumbawa", value: "Sumbawa" },
      { label: "Bima", value: "Bima" },
    ],
  },
  "Sumatera Utara": {
    label: "Sumatera Utara",
    kota: [
      { label: "Medan", value: "Medan" },
      { label: "Berastagi", value: "Berastagi" },
      { label: "Parapat", value: "Parapat" },
      { label: "Bukit Lawang", value: "Bukit Lawang" },
    ],
  },
  "Sumatera Barat": {
    label: "Sumatera Barat",
    kota: [
      { label: "Padang", value: "Padang" },
      { label: "Bukittinggi", value: "Bukittinggi" },
      { label: "Payakumbuh", value: "Payakumbuh" },
      { label: "Sawahlunto", value: "Sawahlunto" },
    ],
  },
  "Sulawesi Utara": {
    label: "Sulawesi Utara",
    kota: [
      { label: "Manado", value: "Manado" },
      { label: "Tomohon", value: "Tomohon" },
      { label: "Bitung", value: "Bitung" },
      { label: "Likupang", value: "Likupang" },
    ],
  },
  "Sulawesi Selatan": {
    label: "Sulawesi Selatan",
    kota: [
      { label: "Makassar", value: "Makassar" },
      { label: "Toraja", value: "Toraja" },
      { label: "Bulukumba", value: "Bulukumba" },
      { label: "Selayar", value: "Selayar" },
    ],
  },
  NTT: {
    label: "Nusa Tenggara Timur",
    kota: [
      { label: "Labuan Bajo", value: "Labuan Bajo" },
      { label: "Kupang", value: "Kupang" },
      { label: "Ende", value: "Ende" },
      { label: "Maumere", value: "Maumere" },
    ],
  },
  "Kalimantan Timur": {
    label: "Kalimantan Timur",
    kota: [
      { label: "Balikpapan", value: "Balikpapan" },
      { label: "Samarinda", value: "Samarinda" },
      { label: "Berau", value: "Berau" },
    ],
  },
  Banten: {
    label: "Banten",
    kota: [
      { label: "Anyer", value: "Anyer" },
      { label: "Carita", value: "Carita" },
      { label: "Tangerang", value: "Tangerang" },
      { label: "Lebak", value: "Lebak" },
    ],
  },
  Lampung: {
    label: "Lampung",
    kota: [
      { label: "Bandar Lampung", value: "Bandar Lampung" },
      { label: "Kalianda", value: "Kalianda" },
      { label: "Tanggamus", value: "Tanggamus" },
    ],
  },
}

export const PROVINSI_KEYS = Object.keys(PROVINSI_DATA)

function getDurasi(days: number): string {
  if (days <= 1) return "1 Hari"
  return `${days} Hari ${days - 1} Malam`
}

function getStopRange(days: number): string {
  if (days <= 1) return "2-3"
  if (days === 2) return "3-4"
  if (days === 3) return "4-5"
  if (days === 4) return "5-6"
  return "5-7"
}

function getMaxStops(days: number): number {
  return parseInt(getStopRange(days).split("-").pop() || "3")
}

function generateMapsUrl(maxStops: number): string {
  const origin = "Stop+1"
  const dest = `Stop+${maxStops}`
  if (maxStops <= 2) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`
  }
  const waypoints: string[] = []
  for (let i = 2; i < maxStops; i++) waypoints.push(`Stop+${i}`)
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&waypoints=${waypoints.join("|")}&travelmode=driving`
}

export function generatePrompt(provinsi: string, kota: string, subTema: string, days: number): string {
  const durasi = getDurasi(days)
  const stopsRange = getStopRange(days)
  const mapsUrl = generateMapsUrl(getMaxStops(days))

  return `Kamu adalah content writer travel untuk platform "Gaskuy Roadtrip Indonesia".
Buatkan 1 data roadtrip itinerary dalam format JSON.

## TEMA
Roadtrip di ${kota}, ${provinsi} — ${subTema}

## KRITERIA
- ${stopsRange} destinasi (stops) searah secara geografis di ${kota}, ${provinsi}
- Nama tempat WAJIB BENAR-BENAR ADA dan merupakan destinasi wisata sungguhan di ${provinsi}
- Bahasa Indonesia natural dan engaging
- Durasi: ${durasi}

## FORMAT OUTPUT (HANYA JSON, tanpa teks lain)

{
  "title": "Road Trip ${kota}: [subtitle menarik]",
  "itinerary_duration": "${durasi}",
  "total_distance": "± XXX km",
  "road_condition": "Deskripsi kondisi jalan real di ${kota}, ${provinsi}",
  "estimated_cost": "Bensin & Tol: ± Rp XXX.XXX - Rp XXX.XXX",
  "best_driving_time": "Waktu terbaik + alasan spesifik untuk ${kota}",
  "route_facilities": ["SPBU", "Rest Area", "Bengkel", "Mini Market"],
  "maps_embed_url": "${mapsUrl}",
  "driving_safety_tips": "2-3 tips keselamatan spesifik rute di ${kota}",
  "culinary_notes": "Rekomendasi kuliner khas ${kota} (string)",
  "cover_image": "",
  "stops": [
    {
      "name": "Nama Destinasi 1",
      "category": "alam",
      "province": "${provinsi}",
      "description": "Deskripsi singkat destinasi",
      "ticket_price": "Rp XX.XXX / orang",
      "parking_fee": "Motor: Rp X.XXX | Mobil: Rp XX.XXX",
      "visit_duration": "X - Y Jam",
      "best_visit_hour": "HH.MM - HH.MM WIB",
      "additional_cost": "Biaya opsional",
      "spot_important_note": "Catatan penting pengendara",
      "opening_hours": "HH.MM - HH.MM WIB",
      "physical_effort": "Ringan / Sedang / Berat",
      "road_access": "Deskripsi akses jalan",
      "rating": 4.5,
      "image_url": "",
      "tips": "Tips untuk pengunjung",
      "facilities": ["Parkir", "Toilet", "Mushola"],
      "nearby_hotels": [
        {
          "name": "Hotel A", "distance": "300 m dari lokasi", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Nama+Destinasi&destination=Hotel+A&travelmode=driving",
          "nearby_restaurants": [
            { "name": "Resto dekat Hotel A", "distance": "200 m dari hotel", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Hotel+A&destination=Resto+dekat+Hotel+A&travelmode=driving" },
            { "name": "Kuliner dekat Hotel A", "distance": "500 m dari hotel", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Hotel+A&destination=Kuliner+dekat+Hotel+A&travelmode=driving" }
          ],
          "price": "[kisaran harga/malam sesuai lokasi]"
        },
        {
          "name": "Hotel B", "distance": "500 m dari lokasi", "price": "[kisaran harga/malam sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Nama+Destinasi&destination=Hotel+B&travelmode=driving",
          "nearby_restaurants": [
            { "name": "Resto dekat Hotel B", "distance": "300 m dari hotel", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Hotel+B&destination=Resto+dekat+Hotel+B&travelmode=driving" }
          ]
        },
        {
          "name": "Hotel C", "distance": "1 km dari lokasi", "price": "[kisaran harga/malam sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Nama+Destinasi&destination=Hotel+C&travelmode=driving",
          "nearby_restaurants": [
            { "name": "Resto dekat Hotel C", "distance": "400 m dari hotel", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Hotel+C&destination=Resto+dekat+Hotel+C&travelmode=driving" }
          ]
        },
        {
          "name": "Homestay D", "distance": "1,5 km dari lokasi", "price": "[kisaran harga/malam sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Nama+Destinasi&destination=Homestay+D&travelmode=driving",
          "nearby_restaurants": [
            { "name": "RM dekat Homestay D", "distance": "200 m dari homestay", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Homestay+D&destination=RM+dekat+Homestay+D&travelmode=driving" }
          ]
        },
        {
          "name": "Villa E", "distance": "2 km dari lokasi", "price": "[kisaran harga/malam sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Nama+Destinasi&destination=Villa+E&travelmode=driving",
          "nearby_restaurants": [
            { "name": "Kedai dekat Villa E", "distance": "500 m dari villa", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Villa+E&destination=Kedai+dekat+Villa+E&travelmode=driving" }
          ]
        }
      ],
      "nearby_restaurants": [
        { "name": "RM A", "distance": "200 m dari lokasi", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Nama+Destinasi&destination=RM+A&travelmode=driving" },
        { "name": "Warung B", "distance": "400 m dari lokasi", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Nama+Destinasi&destination=Warung+B&travelmode=driving" },
        { "name": "Kedai C", "distance": "600 m dari lokasi", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Nama+Destinasi&destination=Kedai+C&travelmode=driving" },
        { "name": "Restoran D", "distance": "1 km dari lokasi", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Nama+Destinasi&destination=Restoran+D&travelmode=driving" },
        { "name": "RM E", "distance": "1,5 km dari lokasi", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Nama+Destinasi&destination=RM+E&travelmode=driving" }
      ]
    }
  ]
}

## ATURAN
- category: pilih dari → alam, kuliner, budaya, foto, petualangan, sejarah
- province: "${provinsi}"
- maps_embed_url: generate dari nama stop (format maps/dir/?api=1)
- culinary_notes: STRING (bukan array), gabung dengan \\n
- cover_image: kosongkan ""
- nearby_hotels: ARRAY 5 OBJECT. Setiap object: { name, distance, price (kisaran harga/malam), maps_url (origin=stop, destination=hotel). DAN setiap hotel punya nearby_restaurants: ARRAY object { name, distance, price (kisaran harga/porsi), maps_url (origin=hotel, destination=resto) }
- nearby_restaurants (top level): ARRAY 5 OBJECT. Setiap object: { name, distance, price (kisaran harga/porsi), maps_url }
- Restoran di dalam hotel WAJIB: origin adalah nama hotel
- price: Kisaran harga real sesuai lokasi (hotel: per malam, resto: per porsi)
- Output HANYA JSON, tanpa markdown`
}

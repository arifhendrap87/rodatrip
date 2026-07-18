// Provinsi & kota data sekarang di-fetch dari API wilayah.id
// Lihat page.tsx untuk implementasi dynamic dropdown

function getDurasi(days: number): string {
  if (days <= 1) return "1 Hari"
  return `${days} Hari ${days - 1} Malam`
}

function getStopRange(days: number): string {
  if (days <= 1) return "3"
  if (days === 2) return "6"
  if (days === 3) return "9"
  return "9"
}

function getMaxStops(days: number): number {
  if (days <= 1) return 3
  if (days === 2) return 6
  return 9
}

function getStopsPerDay(days: number): string {
  if (days <= 1) return '3'
  return '3'
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

export function generatePrompt(provinsi: string, kota: string, days: number): string {
  const durasi = getDurasi(days)
  const stopsRange = getStopRange(days)
  const mapsUrl = generateMapsUrl(getMaxStops(days))

  return `Kamu adalah content writer travel untuk platform "RodaTrip".
Buatkan 1 data roadtrip itinerary dalam format JSON.

## TEMA
Roadtrip di ${kota}, ${provinsi}

## KRITERIA
- TOTAL DESTINASI & RUTE LOGIS: Wajib menyediakan tepat ${stopsRange} destinasi wisata (stops) yang dibagi secara proporsional menjadi ${getStopsPerDay(days)} destinasi per hari selama ${durasi}.
- GEOGRAFIS SEARAH & BERURUTAN: Semua destinasi wajib berada di dalam satu jalur geografis yang searah, berurutan, dan logis di wilayah ${kota} tujuan. Rute perjalanan harus dimulai dari titik terdekat (misal pintu keluar tol/pusat kota) menuju ke titik terjauh secara linier, tanpa ada rute yang memutar balik atau zigzag.
- PASTIKAN maps_embed_url DAN maps_url DI GOOGLE MAP JANGAN ADA TERDETEKSI "Google Maps Can't Find" — sebelum memasukkan nama destinasi ke dalam maps_embed_url dan maps_url, pastikan semua nama destinasi tersebut benar-benar ditemukan oleh Google Maps. Jangan gunakan nama yang akan memicu error "Google Maps can't find".
- PASTIKAN maps_embed_url mencakup semua stops — maps_embed_url harus berisi seluruh daftar stops (origin=stop1, destination=stopTerakhir, waypoints=stop2|stop3|...|stopN-1). Jangan ada stop yang terlewat.
- WAJIB DESTINASI JANGKAR (PRIMADONA): Wajib menentukan dan memasukkan minimal 2 destinasi jangkar utama yang merupakan ikon wisata paling populer dengan rating tertinggi di jalur tersebut. Sisa destinasi lainnya wajib dipilih dari objek wisata andalan yang juga populer. Dilarang keras memasukkan destinasi pinggiran, random, atau objek wisata kecil yang kurang terkenal.
- TEMA MENGIKUTI DESTINASI: Subtitle atau tema harian wajib dibuat menyesuaikan dengan karakter destinasi primadona yang terpilih pada hari tersebut, BUKAN sebaliknya. Jangan pernah mencoret atau mengorbankan destinasi yang bagus hanya demi mencocokkan tema buatan.
- VALIDASI STATUS OPERASIONAL: Wajib memastikan seluruh destinasi yang dipilih AKTIF BEROPERASI dan TIDAK TUTUP PERMANEN berdasarkan data Google Maps terbaru.
- Contoh destinasi yang SUDAH TUTUP PERMANEN dan TIDAK BOLEH dipilih: "Happy Farm Ciwidey" (Jawa Barat). Jika ragu status operasional suatu tempat, pilih alternatif lain yang lebih terkenal dan pasti masih buka.
- KULINER HITS & REALISTIS (Strict): Rekomendasi tempat makan pada poin nearby_restaurants dan pilihan hotel WAJIB benar-benar ada secara nyata (exist), legal, beroperasi, serta merupakan tempat kuliner dan akomodasi yang paling terkenal, hits, dan terfavorit di jalur geografis tersebut. Dilarang keras menggunakan nama generik, samaran, atau placeholder seperti "RM A", "Warung B", "Kedai C", atau "Resto Lokal".
- CULINARY NOTES DETAIL: Pada bagian culinary_notes, wajib menyebutkan minimal 3 makanan/minuman khas asli dari daerah ${kota} tersebut, lengkap dengan rekomendasi nama toko atau tempat spesifik yang paling legendaris untuk membelinya di sepanjang rute.
- GAYA BAHASA: Menggunakan Bahasa Indonesia yang natural, kasual namun tetap sopan, informatif, dan engaging (menarik minat pembaca).

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
   "cover_image_prompt": "English prompt untuk AI image generator — gambarkan suasana roadtrip secara keseluruhan (pemandangan, kendaraan, jalan, cuaca), untuk Midjourney/DALL-E, realistic photo, --ar 16:9",
   "stops": [
    {
      "name": "Nama Destinasi 1",
      "lat": -7.1660,
      "lng": 107.4042,
      "category": "alam",
      "province": "${provinsi}",
      "city": "${kota}",
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
      "image_prompt": "English prompt untuk AI image generator — gambarkan destinasi ini secara visual (subjek, lingkungan, pencahayaan, suasana), untuk Midjourney/DALL-E, realistic photo, --ar 4:5",
      "tips": "Tips untuk pengunjung",
      "facilities": ["Parkir", "Toilet", "Mushola"],
      "nearby_hotels": [
        {
          "name": "Hotel A", "lat": -7.1550, "lng": 107.3920, "distance": "300 m dari lokasi", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Nama+Destinasi&destination=Hotel+A&travelmode=driving",
          "nearby_restaurants": [
            { "name": "Resto dekat Hotel A", "lat": -7.1530, "lng": 107.3900, "distance": "200 m dari hotel", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Hotel+A&destination=Resto+dekat+Hotel+A&travelmode=driving" },
            { "name": "Kuliner dekat Hotel A", "lat": -7.1560, "lng": 107.3940, "distance": "500 m dari hotel", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Hotel+A&destination=Kuliner+dekat+Hotel+A&travelmode=driving" }
          ],
          "price": "[kisaran harga/malam sesuai lokasi]"
        },
        {
          "name": "Hotel B", "lat": -7.1600, "lng": 107.4000, "distance": "500 m dari lokasi", "price": "[kisaran harga/malam sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Nama+Destinasi&destination=Hotel+B&travelmode=driving",
          "nearby_restaurants": [
            { "name": "Resto dekat Hotel B", "lat": -7.1580, "lng": 107.4020, "distance": "300 m dari hotel", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Hotel+B&destination=Resto+dekat+Hotel+B&travelmode=driving" }
          ]
        },
        {
          "name": "Hotel C", "lat": -7.1700, "lng": 107.4100, "distance": "1 km dari lokasi", "price": "[kisaran harga/malam sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Nama+Destinasi&destination=Hotel+C&travelmode=driving",
          "nearby_restaurants": [
            { "name": "Resto dekat Hotel C", "lat": -7.1680, "lng": 107.4120, "distance": "400 m dari hotel", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Hotel+C&destination=Resto+dekat+Hotel+C&travelmode=driving" }
          ]
        },
        {
          "name": "Homestay D", "lat": -7.1450, "lng": 107.3850, "distance": "1,5 km dari lokasi", "price": "[kisaran harga/malam sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Nama+Destinasi&destination=Homestay+D&travelmode=driving",
          "nearby_restaurants": [
            { "name": "RM dekat Homestay D", "lat": -7.1430, "lng": 107.3830, "distance": "200 m dari homestay", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Homestay+D&destination=RM+dekat+Homestay+D&travelmode=driving" }
          ]
        },
        {
          "name": "Villa E", "lat": -7.1750, "lng": 107.4200, "distance": "2 km dari lokasi", "price": "[kisaran harga/malam sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Nama+Destinasi&destination=Villa+E&travelmode=driving",
          "nearby_restaurants": [
            { "name": "Kedai dekat Villa E", "lat": -7.1730, "lng": 107.4180, "distance": "500 m dari villa", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Villa+E&destination=Kedai+dekat+Villa+E&travelmode=driving" }
          ]
        }
      ],
      "nearby_restaurants": [
        { "name": "RM A", "lat": -7.1620, "lng": 107.3980, "distance": "200 m dari lokasi", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Nama+Destinasi&destination=RM+A&travelmode=driving" },
        { "name": "Warung B", "lat": -7.1640, "lng": 107.4020, "distance": "400 m dari lokasi", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Nama+Destinasi&destination=Warung+B&travelmode=driving" },
        { "name": "Kedai C", "lat": -7.1660, "lng": 107.4060, "distance": "600 m dari lokasi", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Nama+Destinasi&destination=Kedai+C&travelmode=driving" },
        { "name": "Restoran D", "lat": -7.1700, "lng": 107.4100, "distance": "1 km dari lokasi", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Nama+Destinasi&destination=Restoran+D&travelmode=driving" },
        { "name": "RM E", "lat": -7.1740, "lng": 107.4140, "distance": "1,5 km dari lokasi", "price": "[kisaran harga/porsi sesuai lokasi]", "maps_url": "https://www.google.com/maps/dir/?api=1&origin=Nama+Destinasi&destination=RM+E&travelmode=driving" }
      ]
    }
  ]
}

## ATURAN
- category: pilih dari → alam, kuliner, budaya, foto, petualangan, sejarah, hotel, restaurant
- lat/lng: Koordinat REALISTIS sesuai lokasi di ${kota}, ${provinsi}. Gunakan Google Maps approximate.
- province: "${provinsi}"
- maps_embed_url: generate dari nama stop (format maps/dir/?api=1&travelmode=driving)
- culinary_notes: STRING (bukan array), gabung dengan \\n
- cover_image: kosongkan ""
- cover_image_prompt: Bahasa Inggris, untuk AI image generator (Midjourney/DALL-E), gambarkan suasana roadtrip secara keseluruhan (jalan, kendaraan, pemandangan), realistic photo, --ar 16:9
- image_prompt (per stop): Bahasa Inggris, untuk AI image generator (Midjourney/DALL-E), gambarkan destinasi secara visual (subjek utama, lingkungan, pencahayaan, suasana, gaya), realistic photo, --ar 4:5
- nearby_hotels: ARRAY 5 OBJECT. Setiap object: { name, distance, price (kisaran harga/malam), maps_url (origin=nama stop, destination=nama hotel, &travelmode=driving). DAN setiap hotel punya nearby_restaurants: ARRAY object { name, distance, price (kisaran harga/porsi), maps_url (origin=nama hotel, destination=nama resto, &travelmode=driving) }
- nearby_restaurants (top level): ARRAY 5 OBJECT. Setiap object: { name, distance, price (kisaran harga/porsi), maps_url (origin=nama stop, destination=nama resto, &travelmode=driving) }
- Restoran di dalam hotel WAJIB: origin=nama hotel, destination=nama resto, &travelmode=driving
- Jangan gunakan nama stop (destinasi) sebagai nama hotel atau restoran. Nama restoran WAJIB nama tempat kuliner sungguhan yang terkenal di daerah itu (bukan placeholder seperti "RM A", "Warung B", "Kedai C")
- price: Kisaran harga real sesuai lokasi (hotel: per malam, resto: per porsi)
- Output HANYA JSON, tanpa markdown`
}

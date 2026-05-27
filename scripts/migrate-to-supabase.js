#!/usr/bin/env node
/**
 * migrate-to-supabase.js
 * 
 * Migrate 25 Jawa Barat spots from TypeScript data to Supabase PostgreSQL.
 * 
 * Usage:
 *   node scripts/migrate-to-supabase.js
 * 
 * Prerequisites:
 *   - Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment
 *   - Run supabase/migrations/001_initial_schema.sql first
 *   - Run supabase/migrations/002_rls_policies.sql first
 */

const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables")
  console.error("  export SUPABASE_URL=https://your-project.supabase.co")
  console.error("  export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// 25 Jawa Barat spots data (from enriched-spots.json)
const spots = [
  { slug: "gunung-tangkuban-perahu", name: "Gunung Tangkuban Perahu", category: "alam", province: "Jawa Barat", region: "Jawa", lat: -6.7694, lng: 107.605, description: "Gunung berapi aktif dengan kawah besar yang bisa diakses langsung dari parkir. Pemandangan kawah yang mengeluarkan asap belerang, ditambah hutan pinus di sekelilingnya.", why_special: "Salah satu gunung berapi paling mudah diakses di Indonesia — cukup jalan 100 meter dari parkir untuk sampai ke bibir kawah. Legenda Sangkuriang yang melegenda.", rating: 4.6, tips: "Cuaca bisa berubah cepat — bawa jaket. Aroma belerang cukup kuat, siapkan masker. Bawa kamera untuk kawah dari berbagai angle.", best_time: "Pagi (07:00-11:00)", opening_hours: "07:00 - 17:00 WIB", estimated_time: "2-3 jam", ticket_price: "Rp 50.000 / Rp 75.000", road_access: "Mobil & Motor — aspal mulus", facilities: ["Parkir", "Toilet", "Mushola", "Warung", "Sewa Jaket"], distance_from_city: "30 km dari Bandung (1 jam)", tags: ["gunung", "kawah", "bandung"] },
  { slug: "curug-cimahi", name: "Curug Cimahi", category: "alam", province: "Jawa Barat", region: "Jawa", lat: -6.8444, lng: 107.5692, description: "Curug Cimahi adalah air terjun yang terletak di Cisarua, Kabupaten Bandung Barat, Jawa Barat.", why_special: "Dengan ketinggian sekitar 87 meter, menjadikan air terjun ini sebagai salah satu curug tertinggi di wilayah Bandung.", rating: 4.5, tips: "Datang di hari kerja untuk menghindari keramaian. Bawa kamera untuk mengabadikan momen.", best_time: "Pagi (07:00-11:00)", opening_hours: "07:00 - 17:00 WIB", estimated_time: "2-3 jam", ticket_price: "Rp 25.000 - 50.000", road_access: "Mobil & Motor — aspal mulus", facilities: ["Parkir", "Toilet", "Mushola", "Warung"], distance_from_city: "30-50 km dari Bandung", tags: ["air-terjun", "curug", "bandung"] },
  { slug: "tebing-keraton", name: "Tebing Keraton", category: "foto", province: "Jawa Barat", region: "Jawa", lat: -6.8, lng: 107.65, description: "Tebing Keraton merupakan sebuah tebing yang berada di dalam kawasan Taman Hutan Raya Ir. H. Djuanda.", why_special: "Pemandangan sunrise yang spektakuler dari tebing dengan view hutan pinus dan kota Bandung dari atas.", rating: 4.4, tips: "Datang pagi-pagi untuk sunrise. Bawa kamera wide-angle.", best_time: "Pagi - Sore", opening_hours: "07:00 - 17:00 WIB", estimated_time: "1-2 jam", ticket_price: "Rp 15.000 - 35.000", road_access: "Mobil & Motor — akses bagus", facilities: ["Parkir", "Spot Foto", "Toilet", "Warung"], distance_from_city: "30-50 km dari Bandung", tags: ["tebing", "sunrise", "foto"] },
  { slug: "gedung-sate-bandung", name: "Gedung Sate Bandung", category: "sejarah", province: "Jawa Barat", region: "Jawa", lat: -6.9011, lng: 107.6186, description: "Gedung bersejarah ikonik di pusat Bandung dengan arsitektur kolonial khas Hindia Belanda. Kini menjadi kantor Gubernur Jawa Barat.", why_special: "Ikon arsitektur Jawa Barat. Ornamen atap yang mirip tusuk sate — 6 tusuk melambangkan 6 juta gulden biaya pembangunan tahun 1920.", rating: 4.7, tips: "Akses terbatas ke dalam gedung (hari kerja). Taman depan bagus buat foto.", best_time: "Pagi (08:00-11:00)", opening_hours: "Area taman: 06:00 - 22:00 WIB", estimated_time: "1-2 jam", ticket_price: "Gratis", road_access: "Mobil & Motor — jalan protokol di pusat Bandung", facilities: ["Parkir", "Toilet", "Taman", "Spot Foto"], distance_from_city: "Pusat Bandung", tags: ["bandung", "sejarah", "arsitektur"] },
  { slug: "museum-geologi-bandung", name: "Museum Geologi Bandung", category: "sejarah", province: "Jawa Barat", region: "Jawa", lat: -6.9046, lng: 107.6183, description: "Museum Geologi didirikan pada tanggal 16 Mei 1929. Museum ini direnovasi dengan dana bantuan dari JICA.", why_special: "Museum tertua dan terlengkap di Asia Tenggara dalam bidang geologi.", rating: 4.6, tips: "Datang di hari kerja. Cocok untuk edukasi anak-anak.", best_time: "Pagi (08:00-11:00)", opening_hours: "08:00 - 16:00 WIB", estimated_time: "1-2 jam", ticket_price: "Rp 20.000", road_access: "Mobil & Motor — di pusat kota", facilities: ["Parkir", "Toilet", "Mushola", "Museum"], distance_from_city: "Pusat Bandung", tags: ["museum", "geologi", "sejarah"] },
  { slug: "alun-alun-bandung", name: "Alun-Alun Bandung", category: "foto", province: "Jawa Barat", region: "Jawa", lat: -6.9217, lng: 107.6069, description: "Alun-alun kota Bandung yang ikonik dengan taman rumput sintetis, lampu hias, dan suasana santai.", why_special: "Lokasi nongkrong favorit warga Bandung. Air mancur menari di malam hari.", rating: 4.3, tips: "Parkir di masjid atau gedung parkiran. Sabtu-Minggu paling ramai.", best_time: "Sore - Malam (16:00-21:00)", opening_hours: "24 jam", estimated_time: "1-2 jam", ticket_price: "Gratis", road_access: "Mobil & Motor — di pusat Kota Bandung", facilities: ["Parkir", "Masjid Raya", "Spot Duduk"], distance_from_city: "Pusat Bandung", tags: ["bandung", "alun-alun", "nongkrong"] },
  { slug: "orchid-forest-cikole", name: "Orchid Forest Cikole", category: "alam", province: "Jawa Barat", region: "Jawa", lat: -6.78, lng: 107.61, description: "Taman anggrek terbesar di Indonesia dengan ribuan spesies anggrek. Canopy walk di kawasan hutan pinus Lembang.", why_special: "Koleksi anggrek terlengkap di Indonesia — 10.000 anggrek dari 100 spesies.", rating: 4.4, tips: "Bawa jaket karena cuaca Lembang dingin. Bawa kamera wide-angle.", best_time: "Pagi (08:00-12:00)", opening_hours: "08:00 - 17:00 WIB", estimated_time: "2-3 jam", ticket_price: "Rp 35.000 / Rp 50.000", road_access: "Mobil & Motor — akses bagus di Lembang", facilities: ["Parkir", "Toilet", "Mushola", "Kafe", "Canopy Walk"], distance_from_city: "20 km dari Bandung (45 menit)", tags: ["anggrek", "alam", "foto", "lembang"] },
  { slug: "situ-patenggang", name: "Situ Patenggang", category: "alam", province: "Jawa Barat", region: "Jawa", lat: -7.1667, lng: 107.3667, description: "Danau pegunungan yang terletak di kawasan taman wisata alam di Rancabali, Jawa Barat.", why_special: "Danau pegunungan yang romantis dengan legenda cinta Situ Patenggang.", rating: 4.5, tips: "Sewa perahu bambu untuk keliling danau.", best_time: "Pagi (07:00-11:00)", opening_hours: "07:00 - 17:00 WIB", estimated_time: "2-3 jam", ticket_price: "Rp 25.000 - 50.000", road_access: "Mobil & Motor — aspal mulus", facilities: ["Parkir", "Toilet", "Mushola", "Warung"], distance_from_city: "30-50 km dari Bandung", tags: ["danau", "ciwidey", "foto"] },
  { slug: "farmhouse-lembang", name: "Farmhouse Lembang", category: "foto", province: "Jawa Barat", region: "Jawa", lat: -6.8167, lng: 107.6167, description: "Kawasan wisata bertema Eropa dengan bangunan ala Belanda, taman bunga, dan spot foto Instagramable.", why_special: "Spot foto ala Eropa tanpa perlu ke luar negeri. Susu murni segar langsung dari peternakan.", rating: 4.2, tips: "Datang weekday untuk hindari antrean. Sewa kostum ala koboy untuk foto.", best_time: "Pagi (08:00-12:00)", opening_hours: "08:00 - 20:00 WIB", estimated_time: "2-3 jam", ticket_price: "Rp 30.000 / Rp 45.000", road_access: "Mobil & Motor — akses bagus di Lembang", facilities: ["Parkir", "Toilet", "Mushola", "Kafe", "Taman"], distance_from_city: "18 km dari Bandung (40 menit)", tags: ["lembang", "foto", "keluarga"] },
  { slug: "kawah-rengganis", name: "Kawah Rengganis", category: "alam", province: "Jawa Barat", region: "Jawa", lat: -7.1833, lng: 107.4333, description: "Kawah vulkanik tersembunyi di Ciwidey dengan kolam air panas alami.", why_special: "Alternatif Kawah Putih yang lebih sepi. Kolam air panas alami untuk berendam.", rating: 4.3, tips: "Bawa baju ganti untuk berendam. Tiket terbatas, datang pagi.", best_time: "Pagi (07:00-11:00)", opening_hours: "07:00 - 16:00 WIB", estimated_time: "3-4 jam", ticket_price: "Rp 25.000", road_access: "Mobil & Motor — jalan desa", facilities: ["Parkir", "Toilet", "Mushola", "Kolam Air Panas"], distance_from_city: "55 km dari Bandung (1,5 jam)", tags: ["kawah", "air-panas", "ciwidey"] },
  { slug: "taman-safari-bogor", name: "Taman Safari Bogor", category: "alam", province: "Jawa Barat", region: "Jawa", lat: -6.7, lng: 106.95, description: "Taman satwa interaktif terbesar di Indonesia dengan konsep safari drive-thru.", why_special: "Satu-satunya tempat dekat Jakarta yang bisa lihat hewan dari mobil langsung.", rating: 4.7, tips: "Beli tiket online H-1 untuk harga lebih murah. Weekday jauh lebih sepi.", best_time: "Pagi (08:00-12:00)", opening_hours: "08:30 - 17:00 WIB", estimated_time: "4-6 jam", ticket_price: "Rp 250.000 / Rp 350.000", road_access: "Mobil pribadi wajib untuk safari", facilities: ["Parkir", "Toilet", "Mushola", "Restoran", "Hotel"], distance_from_city: "80 km dari Jakarta (2 jam)", tags: ["hewan", "safari", "keluarga", "bogor"] },
  { slug: "kebun-raya-bogor", name: "Kebun Raya Bogor", category: "alam", province: "Jawa Barat", region: "Jawa", lat: -6.5972, lng: 106.799, description: "Kebun botani besar yang terletak di Kota Bogor, Indonesia. Luas 87 hektar dengan 15.000 jenis koleksi.", why_special: "Kebun botani tertua di Asia Tenggara (didirikan 1817).", rating: 4.7, tips: "Datang pagi hari. Bawa kamera untuk foto-foto.", best_time: "Pagi (07:00-11:00)", opening_hours: "07:00 - 17:00 WIB", estimated_time: "2-3 jam", ticket_price: "Rp 25.000", road_access: "Mobil & Motor — aspal mulus", facilities: ["Parkir", "Toilet", "Mushola", "Museum", "Kafe"], distance_from_city: "60-80 km dari Jakarta", tags: ["kebun-raya", "bogor", "botani"] },
  { slug: "curug-cigamea", name: "Curug Cigamea", category: "alam", province: "Jawa Barat", region: "Jawa", lat: -6.75, lng: 106.9333, description: "Air terjun tersembunyi di kawasan Gunung Salak dengan ketinggian sekitar 40 meter.", why_special: "Air terjun yang masih alami dan sepi pengunjung. Kolam alami untuk berenang.", rating: 4.2, tips: "Sepatu anti-slip wajib. Bawa bekal sendiri.", best_time: "Pagi (07:00-11:00)", opening_hours: "06:00 - 16:00 WIB", estimated_time: "2-3 jam", ticket_price: "Rp 15.000", road_access: "Motor recommended", facilities: ["Parkir", "Toilet Sederhana"], distance_from_city: "60 km dari Bogor (1,5 jam)", tags: ["air-terjun", "trekking", "alam"] },
  { slug: "gunung-pancar", name: "Gunung Pancar", category: "petualangan", province: "Jawa Barat", region: "Jawa", lat: -6.55, lng: 106.8667, description: "Gunung yang terletak di Kecamatan Babakan Madang, Kabupaten Bogor, Jawa Barat.", why_special: "Tempat camping favorit anak muda Jakarta. Trekking ringan cocok untuk pemula.", rating: 4.2, tips: "Bawa tenda untuk camping. Pemandangan sunset dari puncak.", best_time: "Pagi (07:00-12:00)", opening_hours: "07:00 - 17:00 WIB", estimated_time: "Full day", ticket_price: "Rp 50.000 - 100.000", road_access: "Mobil & Motor", facilities: ["Parkir", "Toilet", "Mushola", "Basecamp"], distance_from_city: "60-80 km dari Jakarta", tags: ["gunung", "camping", "trekking", "bogor"] },
  { slug: "telaga-warna-puncak", name: "Telaga Warna Puncak", category: "alam", province: "Jawa Barat", region: "Jawa", lat: -6.7167, lng: 107.0167, description: "Danau alami di kawasan Puncak dengan fenomena air yang bisa berubah warna.", why_special: "Fenomena langka danau berubah warna yang masih misterius.", rating: 4.3, tips: "Akses dari Puncak Pass — 15 menit jalan kaki. Cuaca paling cerah pagi hari.", best_time: "Pagi (07:00-10:00)", opening_hours: "06:00 - 17:00 WIB", estimated_time: "1-2 jam", ticket_price: "Rp 25.000 / Rp 35.000", road_access: "Mobil & Motor — di kawasan Puncak", facilities: ["Parkir", "Toilet", "Mushola", "Warung"], distance_from_city: "90 km dari Jakarta (2 jam)", tags: ["danau", "puncak", "foto"] },
  { slug: "sate-maranggi-cianjur", name: "Sate Maranggi Cianjur", category: "kuliner", province: "Jawa Barat", region: "Jawa", lat: -6.8128, lng: 107.1394, description: "Sate kambing muda khas Cianjur yang terkenal se-Jawa Barat.", why_special: "Salah satu kuliner legendaris Jawa Barat sejak 1950-an.", rating: 4.8, tips: "Paling enak dimakan hangat langsung dari panggangan.", best_time: "Siang - Sore (11:00-17:00)", opening_hours: "09:00 - 18:00 WIB", estimated_time: "45 menit", ticket_price: "Rp 35.000 - 60.000", road_access: "Mobil & Motor — pinggir jalan raya", facilities: ["Parkir", "Mushola", "Leschan"], distance_from_city: "Pusat Cianjur", tags: ["sate", "kuliner", "cianjur", "legend"] },
  { slug: "cipanas-hot-spring", name: "Cipanas Hot Spring", category: "alam", province: "Jawa Barat", region: "Jawa", lat: -6.7333, lng: 107.0333, description: "Pemandian air panas alami di kaki Gunung Gede Pangrango.", why_special: "Air panas alami dengan pemandangan gunung — berendam sambil lihat hutan tropis.", rating: 4.2, tips: "Bawa handuk dan baju ganti. Jangan berendam terlalu lama (max 20-30 menit).", best_time: "Pagi (07:00-11:00)", opening_hours: "07:00 - 17:00 WIB", estimated_time: "2-3 jam", ticket_price: "Rp 30.000 - 50.000", road_access: "Mobil & Motor — akses bagus", facilities: ["Parkir", "Toilet", "Mushola", "Kolam Air Panas"], distance_from_city: "100 km dari Jakarta (2,5 jam)", tags: ["air-panas", "relaksasi", "puncak"] },
  { slug: "gunung-gede-pangrango", name: "Gunung Gede Pangrango", category: "petualangan", province: "Jawa Barat", region: "Jawa", lat: -6.7833, lng: 106.9667, description: "Taman nasional dengan dua gunung berapi — Gunung Gede (2.958 mdpl) dan Pangrango (3.019 mdpl).", why_special: "Salah satu taman nasional paling populer di Indonesia untuk trekking.", rating: 4.7, tips: "Izin pendakian booking online minimal H-7. Siapkan fisik.", best_time: "April - Oktober", opening_hours: "24 jam", estimated_time: "2 hari 1 malam", ticket_price: "Rp 50.000 + guide Rp 250.000/hari", road_access: "Mobil & Motor — aspal mulus sampai basecamp", facilities: ["Basecamp", "Parkir", "Toilet", "Mushola", "Homestay"], distance_from_city: "100 km dari Jakarta (2,5 jam)", tags: ["gunung", "trekking", "taman-nasional"] },
  { slug: "pantai-santolo", name: "Pantai Santolo", category: "alam", province: "Jawa Barat", region: "Jawa", lat: -7.6167, lng: 107.9, description: "Pantai yang terletak di Kecamatan Cikelet, Kabupaten Garut, Jawa Barat.", why_special: "Garut tidak hanya terkenal dengan Jeruk Garut tetapi juga Pantai Santolo.", rating: 4.4, tips: "Ombak cukup besar — hati-hati berenang. Coba ikan bakar di warung tepi pantai.", best_time: "Pagi - Sore", opening_hours: "24 jam", estimated_time: "2-3 jam", ticket_price: "Rp 10.000 / Rp 25.000", road_access: "Mobil & Motor — aspal mulus", facilities: ["Parkir", "Toilet", "Mushola", "Warung", "Ikan Bakar"], distance_from_city: "35 km dari Garut (1 jam)", tags: ["pantai", "garut", "ikan-bakar"] },
  { slug: "cipanas-garut", name: "Cipanas Garut", category: "alam", province: "Jawa Barat", region: "Jawa", lat: -7.2167, lng: 107.8833, description: "Kawasan wisata air panas alami di kaki Gunung Papandayan.", why_special: "Air panas dengan kandungan belerang tinggi yang dipercaya menyembuhkan penyakit kulit.", rating: 4.1, tips: "Hindari perhiasan — belerang bisa menghitamkan perak.", best_time: "Pagi (07:00-11:00)", opening_hours: "07:00 - 17:00 WIB", estimated_time: "2-3 jam", ticket_price: "Rp 25.000 - 50.000", road_access: "Mobil & Motor — akses bagus", facilities: ["Parkir", "Toilet", "Mushola", "Kolam Air Panas", "Penginapan"], distance_from_city: "Pusat Garut (15 menit)", tags: ["air-panas", "garut", "relaksasi"] },
  { slug: "gunung-papandayan", name: "Gunung Papandayan", category: "petualangan", province: "Jawa Barat", region: "Jawa", lat: -7.3167, lng: 107.7333, description: "Gunung api stratovolcano yang terletak di Kabupaten Garut, Jawa Barat.", why_special: "Memiliki beberapa kawah terkenal: Kawah Mas, Kawah Baru, Kawah Nangklak.", rating: 4.6, tips: "Trekking ringan cocok untuk pemula. Bawa masker untuk kawah.", best_time: "Pagi (07:00-12:00)", opening_hours: "07:00 - 17:00 WIB", estimated_time: "Full day", ticket_price: "Rp 50.000", road_access: "Mobil & Motor — aspal mulus", facilities: ["Parkir", "Toilet", "Mushola", "Basecamp"], distance_from_city: "80 km dari Bandung (2 jam)", tags: ["gunung", "kawah", "trekking", "garut"] },
  { slug: "green-canyon-cijulang", name: "Green Canyon Cijulang", category: "petualangan", province: "Jawa Barat", region: "Jawa", lat: -7.7333, lng: 108.5333, description: "Sungai dengan tebing-tebing batu kapur hijau yang menjulang.", why_special: "Amazon-nya Indonesia! Tebing hijau lumut yang spektakuler.", rating: 4.7, tips: "Baju renang wajib. Bawa dry bag untuk hp/kamera.", best_time: "Pagi - Siang (08:00-14:00)", opening_hours: "07:00 - 16:00 WIB", estimated_time: "3-4 jam", ticket_price: "Rp 25.000 + sewa perahu", road_access: "Mobil & Motor — aspal mulus", facilities: ["Parkir", "Toilet", "Mushola", "Sewa Perahu"], distance_from_city: "30 km dari Pangandaran (45 menit)", tags: ["sungai", "petualangan", "pangandaran"] },
  { slug: "pantai-batu-karas", name: "Pantai Batu Karas", category: "alam", province: "Jawa Barat", region: "Jawa", lat: -7.6833, lng: 108.5, description: "Pantai yang ada di Desa Batu Karas, Kecamatan Cijulang, Kabupaten Pangandaran.", why_specific: "Ombak cocok untuk belajar surfing (beginner friendly).", rating: 4.5, tips: "Cocok untuk surfing pemula. Banyak kafe di tepi pantai.", best_time: "Pagi (07:00-11:00)", opening_hours: "07:00 - 17:00 WIB", estimated_time: "2-3 jam", ticket_price: "Rp 25.000 - 50.000", road_access: "Mobil & Motor — aspal mulus", facilities: ["Parkir", "Toilet", "Mushola", "Warung"], distance_from_city: "250 km dari Bandung (5 jam)", tags: ["pantai", "surfing", "pangandaran"] },
  { slug: "pantai-ujung-genteng", name: "Pantai Ujung Genteng", category: "alam", province: "Jawa Barat", region: "Jawa", lat: -7.3833, lng: 106.4167, description: "Pantai selatan yang masih alami di Sukabumi dengan pasir putih.", why_special: "Salah satu pantai paling sepi di Jawa Barat. Spot konservasi penyu hijau.", rating: 4.5, tips: "Akses agak jauh — siapkan fisik. Bawa bensin cadangan.", best_time: "Pagi - Sore", opening_hours: "24 jam", estimated_time: "Full day", ticket_price: "Rp 15.000 / Rp 30.000", road_access: "Mobil — jalan aspal 80% bagus", facilities: ["Parkir", "Toilet", "Mushola", "Homestay", "Konservasi Penyu"], distance_from_city: "140 km dari Bogor (4 jam)", tags: ["pantai", "surfing", "penyu"] },
  { slug: "geopark-ciletuh", name: "Geopark Ciletuh", category: "petualangan", province: "Jawa Barat", region: "Jawa", lat: -7.2167, lng: 106.4333, description: "Geopark UNESCO Global dengan tebing-tebing purba dan air terjun bertingkat.", why_special: "Geopark pertama di Jawa Barat yang diakui UNESCO.", rating: 4.5, tips: "Akses jalan menantang — sewa motor lebih recommended. Minimal 2 hari.", best_time: "Pagi - Sore", opening_hours: "24 jam", estimated_time: "2-3 hari", ticket_price: "Gratis (tiket kawasan Rp 15.000)", road_access: "Motor recommended", facilities: ["Parkir", "Toilet", "Homestay", "Warung", "Info Center"], distance_from_city: "140 km dari Bogor (4 jam)", tags: ["geopark", "unesco", "petualangan", "sukabumi"] },
]

async function migrate() {
  console.log("🚀 Starting migration of 25 Jawa Barat spots to Supabase...\n")

  let success = 0
  let skipped = 0
  let errors = 0

  for (const spot of spots) {
    const location = `POINT(${spot.lng} ${spot.lat})`

    const { data: existing } = await supabase
      .from("spots")
      .select("slug")
      .eq("slug", spot.slug)
      .maybeSingle()

    if (existing) {
      console.log(`  ⏭ Skipped: ${spot.name} (already exists)`)
      skipped++
      continue
    }

    const { error } = await supabase.from("spots").insert({
      slug: spot.slug,
      name: spot.name,
      category: spot.category,
      province: spot.province,
      region: spot.region,
      location: location,
      description: spot.description,
      why_special: spot.why_special || spot.why_specific || "",
      rating: spot.rating,
      tips: spot.tips || "",
      best_time: spot.best_time || "",
      opening_hours: spot.opening_hours || "",
      estimated_time: spot.estimated_time || "",
      ticket_price: spot.ticket_price || "",
      road_access: spot.road_access || "",
      facilities: spot.facilities || [],
      distance_from_city: spot.distance_from_city || "",
      tags: spot.tags || [],
      is_featured: false,
      image_url: "",
      image_credit: "Unsplash",
    })

    if (error) {
      console.log(`  ❌ Error: ${spot.name} — ${error.message}`)
      errors++
    } else {
      console.log(`  ✅ Inserted: ${spot.name}`)
      success++
    }
  }

  console.log(`\n📊 Results:`)
  console.log(`   ✅ ${success} inserted`)
  console.log(`   ⏭ ${skipped} skipped`)
  console.log(`   ❌ ${errors} errors`)
  console.log(`   📝 Total: ${spots.length} spots`)
}

migrate().catch(console.error)

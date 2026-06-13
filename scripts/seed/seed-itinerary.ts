import { supabase, log, divider } from "./config"

const ROADTRIPS = [
  {
    slug: "road-trip-tasikmalaya-menyusuri-jalur-pegunungan-hingga-pantai-selatan",
    title: "Road Trip Tasikmalaya: Menyusuri Jalur Pegunungan hingga Pantai Selatan",
    itinerary_duration: "3 Hari 2 Malam",
    total_distance: "± 140 km",
    road_condition: "Variatif (Pegunungan menanjak di Utara, Jalur lurus cepat di Lintas Selatan)",
    estimated_cost: "Bensin & Tol: ± Rp 400.000 - Rp 600.000 (Awal dari Jakarta)",
    best_driving_time: "Pagi hari (Hindari melewati jalur pegunungan/tanjakan ekstrem saat malam hari)",
    route_facilities: ["Banyak SPBU", "Banyak Rest Area", "Bengkel 24 Jam", "Ramah EV Charger"],
    maps_embed_url: "https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!...",
    driving_safety_tips: "Selalu pastikan kondisi rem dan tekanan angin ban dalam keadaan prima sebelum memulai road trip di jalur Priangan Timur.",
    culinary_notes: "Coba Nasi TO (Tutug Oncom) Benhil di pusat kota untuk sarapan, dan mampir ke Sentra Anyaman Rajapolah saat arah pulang untuk berburu kerajinan lokal.",
    cover_image: "https://pub-1a37d792e7bc411380f4fed507dc7100.r2.dev/prod/spots/gunung-galunggung.jpg",
    stops: [
      {
        stop_number: 1,
        name: "Gunung Galunggung",
        visit_duration: "2 - 3 Jam",
        best_visit_hour: "06.00 - 09.00 WIB",
        additional_cost: "Ojek kawah (opsional): Rp 25.000 | Tiket Air Panas: Rp 10.000",
        spot_important_note: "Kendaraan matic harus ekstra hati-hati saat jalan turun. Gunakan engine brake dan istirahat di bawah jika piringan rem terlalu panas.",
        spot_slug: "gunung-galunggung",
      },
      {
        stop_number: 2,
        name: "Tonjong Canyon",
        visit_duration: "2 Jam",
        best_visit_hour: "10.00 - 14.00 WIB",
        additional_cost: "Sewa pelampung/Ban (opsional): Rp 10.000",
        spot_important_note: "Akses jalan masuk dari jalan raya utama sedikit mengecil, namun permukaan aspalnya masih aman untuk mobil keluarga sekelas LMPV.",
        spot_slug: "tonjong-canyon",
      },
      {
        stop_number: 3,
        name: "Pantai Karang Tawulan",
        visit_duration: "3 Jam",
        best_visit_hour: "16.00 - 18.00 WIB (Mengejar Sunset)",
        additional_cost: "Spot foto/akses area tebing khusus: Rp 5.000",
        spot_important_note: "Ombak pantai selatan sangat besar dan di bawah tebing berupa batu karang tajam. Dilarang keras berenang ke tengah laut.",
        spot_slug: "pantai-karang-tawulan",
      },
    ],
  },
  {
    slug: "road-trip-bandung-cianjur-puncak-jalur-selatan",
    title: "Bandung ke Cianjur: Menikmati Jalur Pegunungan Puncak",
    itinerary_duration: "1 Hari",
    total_distance: "± 80 km",
    road_condition: "Jalur pegunungan berkelok dengan pemandangan perkebunan teh. Hati-hati di tikungan tajam dan kabut pagi.",
    estimated_cost: "Bensin: ± Rp 100.000 - Rp 150.000",
    best_driving_time: "Pagi hari (06.00 - 08.00 WIB) untuk menghindari macet dan menikmati pemandangan kabut pagi.",
    route_facilities: ["Banyak SPBU di jalur utama", "Rest Area", "Warung Tepi Jalan", "Bengkel Kecil"],
    maps_embed_url: "https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!...",
    driving_safety_tips: "Jalur Puncak rawan longsor saat hujan deras. Selalu cek kondisi cuaca sebelum berangkat dan gunakan lampu utama saat berkabut.",
    culinary_notes: "Jangan lewatkan Sate Maranggi Cianjur sebagai ikon kuliner, dan mampir ke kedai kopi di kawasan Puncak untuk menghangatkan badan.",
    cover_image: "https://pub-1a37d792e7bc411380f4fed507dc7100.r2.dev/prod/spots/kebun-teh-gunung-mas.jpg",
    stops: [
      {
        stop_number: 1,
        name: "Kebun Teh Gunung Mas",
        visit_duration: "1 - 2 Jam",
        best_visit_hour: "07.00 - 10.00 WIB",
        additional_cost: "Trekking guide (opsional): Rp 50.000 | Sewa sepeda: Rp 30.000",
        spot_important_note: "Udara pagi sangat dingin (15-18°C). Bawa jaket atau sweater. Jalan setapak bisa licin setelah hujan.",
        spot_slug: "kebun-teh-gunung-mas",
      },
      {
        stop_number: 2,
        name: "Telaga Warna Puncak",
        visit_duration: "1 - 2 Jam",
        best_visit_hour: "09.00 - 12.00 WIB",
        additional_cost: "Sewa perahu (opsional): Rp 50.000 | Swafoto: Rp 5.000",
        spot_important_note: "Telaga Warna terkenal dengan fenomena air yang bisa berubah warna. Waktu terbaik untuk melihat fenomena ini adalah pagi hari saat sinar matahari pertama muncul.",
        spot_slug: "telaga-warna-puncak",
      },
      {
        stop_number: 3,
        name: "Sate Maranggi Cianjur",
        visit_duration: "1 Jam",
        best_visit_hour: "11.00 - 14.00 WIB (Waktu Makan Siang)",
        additional_cost: "Minuman dan tambahan lontong: Rp 10.000 - Rp 20.000",
        spot_important_note: "Beberapa warung sate maranggi legendaris tutup di hari Senin. Pastikan datang sebelum jam 14.00 karena sering habis.",
        spot_slug: "sate-maranggi-cianjur",
      },
    ],
  },
  {
    slug: "road-trip-bogor-sukabumi-pelabuhanratu",
    title: "Jelajah Bogor - Sukabumi: Dari Kebun Raya hingga Pelabuhan Ratu",
    itinerary_duration: "2 Hari 1 Malam",
    total_distance: "± 120 km",
    road_condition: "Jalur variatif: kota padat di Bogor, pegunungan berkelok di Ciawi-Cicurug, dan jalan lurus pesisir selatan.",
    estimated_cost: "Bensin & Tol: ± Rp 200.000 - Rp 350.000",
    best_driving_time: "Berangkat pagi (06.00 WIB) untuk menghindari macet Bogor. Perjalanan ke selatan sebaiknya siang hari.",
    route_facilities: ["SPBU di kota besar", "Rest Area", "Bengkel Umum", "Mini Market"],
    maps_embed_url: "https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!...",
    driving_safety_tips: "Jalur Ciawi-Cicurug rawan longsor dan pohon tumbang saat hujan deras. Sediakan uang tunai karena tidak semua SPBU menerima kartu.",
    culinary_notes: "Coba Soto Bogor di perjalanan awal, dan Ikan Bakar Cipanas untuk makan malam. Jangan lupa oleh-oleh Roti Unyil Venus dari Kota Bogor.",
    cover_image: "https://pub-1a37d792e7bc411380f4fed507dc7100.r2.dev/prod/spots/kebun-raya-bogor.jpg",
    stops: [
      {
        stop_number: 1,
        name: "Kebun Raya Bogor",
        visit_duration: "2 - 3 Jam",
        best_visit_hour: "07.00 - 10.00 WIB",
        additional_cost: "Sewa sepeda (opsional): Rp 30.000 | Tour guide: Rp 75.000",
        spot_important_note: "Weekend sangat ramai. Datang pagi-pagi untuk pengalaman terbaik. Bawa topi dan lotion anti nyamuk.",
        spot_slug: "kebun-raya-bogor",
      },
      {
        stop_number: 2,
        name: "Taman Safari Bogor",
        visit_duration: "3 - 4 Jam",
        best_visit_hour: "09.00 - 14.00 WIB",
        additional_cost: "Pakan satwa: Rp 10.000 - Rp 20.000 | Naik gajah: Rp 50.000",
        spot_important_note: "Ikuti jadwal pertunjukan satwa (11.00 dan 14.00). Jangan memberi makan sembarangan, beli pakan resmi dari petugas.",
        spot_slug: "taman-safari-bogor",
      },
      {
        stop_number: 3,
        name: "Cipanas Hot Spring",
        visit_duration: "2 Jam",
        best_visit_hour: "15.00 - 17.00 WIB (Sore hari sebelum lanjut perjalanan)",
        additional_cost: "Sewa bilik pribadi: Rp 50.000 - Rp 100.000",
        spot_important_note: "Air panas mengandung belerang. Jangan berendam lebih dari 30 menit. Bawa baju ganti.",
        spot_slug: "cipanas-hot-spring",
      },
      {
        stop_number: 4,
        name: "Pantai Pelabuhan Ratu",
        visit_duration: "2 - 3 Jam",
        best_visit_hour: "16.00 - 18.00 WIB (Mengejar Sunset)",
        additional_cost: "Sewa penginapan (jika menginap): Rp 200.000 - Rp 500.000",
        spot_important_note: "Ombak Pantai Selatan sangat besar. Dilarang berenang di area berbahaya. Nikmati sunset dari tepi pantai yang aman.",
        spot_slug: "pantai-ujung-genteng",
      },
    ],
  },
]

export async function seedItinerary() {
  log("🏎️", "Seeding roadtrip itineraries...")
  let inserted = 0
  let skipped = 0
  let errors = 0

  for (const rt of ROADTRIPS) {
    const { data: existing } = await supabase
      .from("itineraries")
      .select("id")
      .eq("slug", rt.slug)
      .maybeSingle()

    if (existing) {
      log("⏭️", `${rt.title} already exists, skipping`)
      skipped++
      continue
    }

    const { data: itinerary, error } = await supabase
      .from("itineraries")
      .insert({
        slug: rt.slug,
        title: rt.title,
        itinerary_duration: rt.itinerary_duration,
        total_distance: rt.total_distance,
        road_condition: rt.road_condition,
        estimated_cost: rt.estimated_cost,
        best_driving_time: rt.best_driving_time,
        route_facilities: rt.route_facilities,
        maps_embed_url: rt.maps_embed_url,
        driving_safety_tips: rt.driving_safety_tips,
        culinary_notes: rt.culinary_notes,
        cover_image: rt.cover_image,
        is_published: true,
      })
      .select("id")
      .single()

    if (error || !itinerary) {
      log("❌", `Failed to create "${rt.title}": ${error?.message}`)
      errors++
      continue
    }

    const stopRows = rt.stops.map((stop) => ({
      itinerary_id: itinerary.id,
      stop_number: stop.stop_number,
      name: stop.name,
      visit_duration: stop.visit_duration,
      best_visit_hour: stop.best_visit_hour,
      additional_cost: stop.additional_cost,
      spot_important_note: stop.spot_important_note,
      spot_slug: stop.spot_slug,
    }))

    const { error: stopsError } = await supabase
      .from("itinerary_stops")
      .insert(stopRows)

    if (stopsError) {
      log("❌", `Failed to create stops for "${rt.title}": ${stopsError.message}`)
      await supabase.from("itineraries").delete().eq("id", itinerary.id)
      errors++
      continue
    }

    log("✅", `Created "${rt.title}" with ${stopRows.length} stops`)
    inserted++
  }

  divider()
  log("📊", `Itineraries: ${inserted} inserted, ${skipped} skipped, ${errors} errors`)
  return { inserted, skipped, errors }
}

import { supabase } from "./config"

const DATA = {
  slug: "road-trip-malang-menyisir-eksotisme-pantai-perawan-di-jalur-lintas-selatan",
  title: "Road Trip Malang: Menyisir Eksotisme Pantai Perawan di Jalur Lintas Selatan",
  itinerary_duration: "1 Hari",
  total_distance: "± 75 km",
  road_condition: "Jalur Lintas Selatan (JLS) Malang didominasi oleh aspal yang sangat mulus, lebar, dan minim lubang. Namun, pengendara harus tetap waspada karena terdapat beberapa tikungan tajam dan turunan landai yang panjang dengan pemandangan tebing karst di sisi jalan.",
  estimated_cost: "Bensin & Tol: ± Rp 150.000 - Rp 250.000",
  best_driving_time: "Mulai berkendara dari pusat Kota Malang pukul 05.30 WIB agar bisa melewati jalur perbukitan sebelum terik matahari menyengat dan tiba di pantai pertama saat udara masih terasa segar.",
  route_facilities: ["SPBU Pertamina Gondanglegi", "Rest Area dadakan JLS Balekambang", "Mini Market di Jalur Raya Bantur", "Bengkel Tambal Ban di sekitar pemukiman warga Bantur"],
  maps_embed_url: "https://www.google.com/maps/dir/?api=1&origin=Pantai+Balekambang&destination=Pantai+Tiga+Warna&waypoints=Pantai+Gondomayit|Pantai+Clungup&travelmode=driving",
  driving_safety_tips: "Jaga kecepatan kendaraan Anda di sepanjang JLS karena aspal yang terlalu mulus sering kali membuat pengendara terlena untuk mengebut. Selalu perhatikan rambu peringatan daerah rawan longsor, terutama saat berkendara di musim hujan.",
  culinary_notes: "Menikmati kesegaran Es Kelapa Muda langsung dari buahnya di sepanjang bibir Pantai Balekambang. \nMencicipi kuliner laut segar seperti Ikan Bakar Sambal Korek di warung-warung makan sekitar Pantai Sendang Biru sebelum menyeberang ke area Tiga Warna.",
  cover_image: "",
  stops: [
    {
      stop_number: 1,
      name: "Pantai Balekambang",
      visit_duration: "2 - 3 Jam",
      best_visit_hour: "08.00 - 11.00 WIB",
      additional_cost: "Retribusi jembatan penyeberangan ke pulau karang Rp 5.000",
      spot_important_note: "Area parkir sangat luas dan teduh di bawah pohon kelapa. Hati-hati dengan korosi air laut, sebaiknya bilas atau cuci kendaraan Anda setelah pulang dari area pantai ini.",
    },
    {
      stop_number: 2,
      name: "Pantai Gondomayit",
      visit_duration: "1 - 2 Jam",
      best_visit_hour: "11.30 - 13.30 WIB",
      additional_cost: "Biaya kebersihan toilet umum Rp 2.000",
      spot_important_note: "Akses jalan masuk dari jalur utama JLS agak menyempit dan masih berupa tanah berpasir padat. Pengendara mobil dengan ground clearance rendah disarankan untuk ekstra hati-hati memilih lajur.",
    },
    {
      stop_number: 3,
      name: "Pantai Clungup",
      visit_duration: "1 - 1.5 Jam",
      best_visit_hour: "14.00 - 15.30 WIB",
      additional_cost: "Jasa titip kantong plastik sampah (wajib) Rp 10.000",
      spot_important_note: "Kendaraan roda empat hanya bisa masuk sampai ke kantong parkir utama CMC (Clungup Mangrove Conservation). Dari sana, perjalanan ke bibir pantai harus dilanjutkan dengan berjalan kaki atau sewa ojek lokal.",
    },
    {
      stop_number: 4,
      name: "Pantai Tiga Warna",
      visit_duration: "2 - 2.5 Jam",
      best_visit_hour: "15.30 - 18.00 WIB",
      additional_cost: "Sewa pemandu wisata lokal (guide wajib) Rp 150.000 per kelompok",
      spot_important_note: "Karena merupakan kawasan konservasi terikat, pastikan Anda sudah melakukan reservasi kuota kunjungan terlebih dahulu sebelum berangkat. Area parkir dijaga ketat oleh petugas lokal, pastikan kunci ganda kendaraan Anda.",
    },
  ],
}

async function main() {
  console.log("")
  console.log("  ╔═══════════════════════════════════════╗")
  console.log("  ║   Seed Single Roadtrip                ║")
  console.log("  ╚═══════════════════════════════════════╝")
  console.log("")

  // Create itinerary
  const { data: itinerary, error } = await supabase
    .from("itineraries")
    .insert({
      slug: DATA.slug,
      title: DATA.title,
      itinerary_duration: DATA.itinerary_duration,
      total_distance: DATA.total_distance,
      road_condition: DATA.road_condition,
      estimated_cost: DATA.estimated_cost,
      best_driving_time: DATA.best_driving_time,
      route_facilities: DATA.route_facilities,
      maps_embed_url: DATA.maps_embed_url,
      driving_safety_tips: DATA.driving_safety_tips,
      culinary_notes: DATA.culinary_notes,
      cover_image: DATA.cover_image || null,
      is_published: true,
    })
    .select("id")
    .single()

  if (error) {
    console.log("  ❌ Error creating itinerary:", error.message)
    process.exit(1)
  }

  console.log("  ✅ Itinerary created:", DATA.title)

  // Create stops
  const stopRows = DATA.stops.map((stop) => ({
    itinerary_id: itinerary.id,
    stop_number: stop.stop_number,
    name: stop.name,
    visit_duration: stop.visit_duration,
    best_visit_hour: stop.best_visit_hour,
    additional_cost: stop.additional_cost || null,
    spot_important_note: stop.spot_important_note || null,
  }))

  const { error: stopsError } = await supabase
    .from("itinerary_stops")
    .insert(stopRows)

  if (stopsError) {
    console.log("  ❌ Error creating stops:", stopsError.message)
    await supabase.from("itineraries").delete().eq("id", itinerary.id)
    process.exit(1)
  }

  console.log(`  ✅ ${stopRows.length} stops created`)
  console.log("")
  console.log("  ✅ Seed complete!")
  console.log("")
}

main()

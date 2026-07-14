import { supabase, log, divider } from "./config"

const DATA = {
  slug: "road-trip-lombok-menyisir-eksotisme-pantai-dan-budaya-sasak-jalur-selatan",
  title: "Road Trip Lombok: Menyisir Eksotisme Pantai dan Budaya Sasak Jalur Selatan",
  itinerary_duration: "1 Hari",
  total_distance: "± 45 km",
  road_condition: "Jalur lintas selatan Lombok didominasi aspal mulus berstandar internasional bypass Mandalika. Jalanan cenderung sepi dan lebar, namun pengendara harus tetap waspada terhadap hewan ternak warga yang sesekali menyeberang jalan secara mendadak.",
  estimated_cost: "Bensin & Tol: ± Rp 100.000",
  best_driving_time: "Mulai berkendara dari Kota Mataram atau Bandara pukul 08.00 WITA agar memiliki waktu eksplorasi yang panjang di desa adat sebelum menikmati suasana pantai di siang hingga sore hari.",
  route_facilities: ["SPBU Pertamina Mandalika", "Kantong Parkir Sirkuit", "Mini Market Kuta Lombok", "Bengkel Motor & Mobil Area Pujut"],
  maps_embed_url: "https://www.google.com/maps/dir/?api=1&origin=Desa+Sade&destination=Pantai+Tanjung+Aan&waypoints=Pantai+Kuta+Lombok&travelmode=driving",
  driving_safety_tips: "Tetap jaga batas kecepatan aman meskipun jalanan Bypass Mandalika sangat mulus dan sepi. Hindari berkendara terlalu larut malam di jalur penghubung antar pantai karena penerangan jalan umum masih tergolong minim.",
  culinary_notes: "Mencicipi pedasnya Ayam Taliwang asli dengan plecing kangkung yang segar di kawasan sekitar rute Pujut. \nMenikmati segarnya es kelapa muda langsung dari batoknya sambil memandangi hamparan laut selatan di deretan warung Pantai Kuta.",
  cover_image: "",
  stops: [
    {
      name: "Desa Sade",
      category: "budaya",
      province: "Nusa Tenggara Barat",
      description: "Desa adat suku Sasak yang masih mempertahankan keaslian arsitektur rumah berbahan bambu, atap alang-alang, serta tradisi tenun ikat khas Lombok.",
      ticket_price: "Sukarela / Seikhlasnya",
      parking_fee: "Motor: Rp 5.000 | Mobil: Rp 10.000",
      visit_duration: "1 - 2 Jam",
      best_visit_hour: "08.30 - 10.30 WITA",
      additional_cost: "Jasa pemandu lokal (guide) berkisar Rp 50.000 - Rp 100.000",
      spot_important_note: "Lokasi desa berada tepat di pinggir jalan raya utama Mataram-Kuta. Area parkir mobil berada di pinggir jalan raya, pastikan posisi kendaraan sejajar dan tidak memakan badan jalan.",
      opening_hours: "08.00 - 19.00 WITA",
      physical_effort: "Ringan",
      road_access: "Akses jalan aspal utama sangat mulus dan lebar, dapat diakses semua jenis kendaraan.",
      rating: 4.6,
      image_url: "",
      tips: "Gunakan pakaian yang sopan karena memasuki kawasan desa adat yang kental dengan norma lokal.",
      facilities: ["Parkir", "Toilet", "Mushola", "Kios Souvenir"],
    },
    {
      name: "Pantai Kuta Lombok",
      category: "alam",
      province: "Nusa Tenggara Barat",
      description: "Pantai berpasir putih unik menyerupai merica dengan garis pantai yang panjang serta dikelilingi oleh perbukitan hijau yang menawan.",
      ticket_price: "Gratis",
      parking_fee: "Motor: Rp 5.000 | Mobil: Rp 10.000",
      visit_duration: "2 - 3 Jam",
      best_visit_hour: "11.00 - 14.00 WITA",
      additional_cost: "Sewa payung pantai Rp 50.000",
      spot_important_note: "Area parkir kawasan Kuta Mandalika sangat luas, tertata rapi, dan menggunakan sistem satu pintu (gate).",
      opening_hours: "24 Jam",
      physical_effort: "Ringan",
      road_access: "Jalanan aspal mulus perkotaan dengan marka jalan yang sangat jelas.",
      rating: 4.5,
      image_url: "",
      tips: "Gunakan tabir surya (sunblock) karena cuaca di pinggir pantai saat siang hari cenderung sangat terik menyengat.",
      facilities: ["Parkir", "Toilet", "Mushola", "Restoran", "Playground"],
    },
    {
      name: "Pantai Tanjung Aan",
      category: "alam",
      province: "Nusa Tenggara Barat",
      description: "Pantai berbentuk teluk dengan ombak yang sangat tenang, gradasi air laut hijau toska, dan berhadapan langsung dengan Bukit Merese.",
      ticket_price: "Gratis",
      parking_fee: "Motor: Rp 5.000 | Mobil: Rp 10.000",
      visit_duration: "2 - 3 Jam",
      best_visit_hour: "15.00 - 18.00 WITA",
      additional_cost: "Sewa perahu ke Batu Payung Rp 150.000",
      spot_important_note: "Beberapa ratus meter menjelang titik lokasi pantai, jalanan masih berupa tanah padat berpasir.",
      opening_hours: "24 Jam",
      physical_effort: "Sedang",
      road_access: "Akses JLS beraspal mulus, hanya menyisakan sedikit jalan tanah saat mendekati bibir pantai.",
      rating: 4.7,
      image_url: "",
      tips: "Sempatkan untuk mendaki Bukit Merese yang berada di sisi kanan pantai untuk menikmati pemandangan sunset.",
      facilities: ["Parkir", "Toilet", "Warung Kuliner", "Sewa Gazebo"],
    },
  ],
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

function randomLatLng(): { lat: number; lng: number } {
  const latlngs: Record<string, { lat: number; lng: number }> = {
    "Desa Sade": { lat: -8.8339, lng: 116.2935 },
    "Pantai Kuta Lombok": { lat: -8.8938, lng: 116.2831 },
    "Pantai Tanjung Aan": { lat: -8.9043, lng: 116.3533 },
  }
  return latlngs[DATA.stops[0].name] || { lat: -8.8, lng: 116.3 }
}

async function main() {
  console.log("")
  console.log("  ╔═══════════════════════════════════════╗")
  console.log("  ║   Seed: Road Trip Lombok              ║")
  console.log("  ╚═══════════════════════════════════════╝")
  console.log("")

  // Create spots
  const spotSlugs: { name: string; slug: string }[] = []
  for (const stop of DATA.stops) {
    const slug = generateSlug(stop.name)
    const { data: existing } = await supabase.from("spots").select("slug").eq("slug", slug).maybeSingle()
    if (existing) {
      log("⏭️", `Spot "${stop.name}" already exists`)
      spotSlugs.push({ name: stop.name, slug })
      continue
    }

    const loc = randomLatLng()
    const { error } = await supabase.from("spots").insert({
      slug,
      name: stop.name,
      category: stop.category,
      province: stop.province,
      region: "Nusa Tenggara Barat",
      location: `POINT(${loc.lng} ${loc.lat})`,
      description: stop.description,
      why_special: stop.description,
      rating: stop.rating || null,
      ticket_price: stop.ticket_price || null,
      opening_hours: stop.opening_hours || null,
      road_access: stop.road_access || null,
      tips: stop.tips || null,
      facilities: stop.facilities || null,
      tags: [stop.category],
      image_url: stop.image_url || null,
      is_featured: false,
    })
    if (error) { log("❌", `Spot "${stop.name}": ${error.message}`); process.exit(1) }
    else log("✅", `Spot "${stop.name}" created (${slug})`)

    // Update new columns via raw SQL (bypass schema cache)
    const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").match(/https:\/\/(.+)\.supabase\.co/)?.[1]
    if (projectRef && process.env.SUPABASE_DB_PASSWORD && (stop.parking_fee || stop.visit_duration || stop.best_visit_hour || stop.additional_cost || stop.spot_important_note || stop.physical_effort)) {
      try {
        const { Client } = await import("pg")
        const pc = new Client({ host: `db.${projectRef}.supabase.co`, port: 5432, database: "postgres", user: "postgres", password: process.env.SUPABASE_DB_PASSWORD, ssl: { rejectUnauthorized: false } })
        await pc.connect()
        await pc.query("UPDATE spots SET parking_fee = $1, visit_duration = $2, best_visit_hour = $3, additional_cost = $4, spot_important_note = $5, physical_effort = $6 WHERE slug = $7", [
          stop.parking_fee || null, stop.visit_duration || null, stop.best_visit_hour || null,
          stop.additional_cost || null, stop.spot_important_note || null, stop.physical_effort || null, slug,
        ])
        await pc.end()
      } catch {}
    }
    spotSlugs.push({ name: stop.name, slug })
  }

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

  if (error) { log("❌", `Itinerary: ${error.message}`); process.exit(1) }
  log("✅", `Itinerary "${DATA.title}" created`)

  // Create stops
  const stopRows = spotSlugs.map((s, i) => ({
    itinerary_id: itinerary.id,
    stop_number: i + 1,
    name: s.name,
    spot_slug: s.slug,
  }))

  const { error: stopsError } = await supabase.from("itinerary_stops").insert(stopRows)
  if (stopsError) { log("❌", `Stops: ${stopsError.message}`); process.exit(1) }
  else log("✅", `${stopRows.length} stops linked`)

  divider()
  log("📊", "Itineraries: 1 inserted, 0 skipped, 0 errors")
  log("🎉", "Road Trip Lombok seeded successfully!")
  console.log("")
}

main()

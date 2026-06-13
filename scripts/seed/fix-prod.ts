import { supabase } from "./config"

async function main() {
  const spots = [
    { slug: "gunung-galunggung", name: "Gunung Galunggung", category: "alam", province: "Jawa Barat", lat: -7.25, lng: 108.0667 },
    { slug: "tonjong-canyon", name: "Tonjong Canyon", category: "alam", province: "Jawa Barat", lat: -7.2, lng: 108.1333 },
    { slug: "pantai-karang-tawulan", name: "Pantai Karang Tawulan", category: "alam", province: "Jawa Barat", lat: -7.7833, lng: 108.3167 },
  ]

  for (const spot of spots) {
    const { data: existing } = await supabase.from("spots").select("id").eq("slug", spot.slug).maybeSingle()
    if (existing) {
      console.log("⏭️", spot.name, "exists")
      continue
    }

    const { error } = await supabase.from("spots").insert({
      slug: spot.slug,
      name: spot.name,
      category: spot.category,
      province: spot.province,
      region: "Jawa",
      location: `POINT(${spot.lng} ${spot.lat})`,
      description: spot.name + " — destinasi wisata di " + spot.province,
      why_special: spot.name,
      rating: 4.0,
      ticket_price: "Rp 15.000",
      image_url: "https://pub-1a37d792e7bc411380f4fed507dc7100.r2.dev/dev/spots/" + spot.slug + ".jpg",
      tags: [spot.slug.split("-").pop() || ""],
      facilities: ["Parkir", "Toilet", "Mushola"],
      is_featured: false,
    })
    if (error) console.log("❌", spot.name, error.message)
    else console.log("✅", spot.name)
  }

  // Fix all itinerary_stops FK
  const fixes = [
    { name: "Gunung Galunggung", slug: "gunung-galunggung" },
    { name: "Tonjong Canyon", slug: "tonjong-canyon" },
    { name: "Pantai Karang Tawulan", slug: "pantai-karang-tawulan" },
  ]
  for (const f of fixes) {
    const { error } = await supabase.from("itinerary_stops").update({ spot_slug: f.slug }).eq("name", f.name)
    if (error) console.log("❌", f.name, error.message)
    else console.log("✅ FK fixed:", f.name)
  }
}

main()

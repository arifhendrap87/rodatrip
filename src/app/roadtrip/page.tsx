import { getItineraries } from "@/lib/services/itineraries"
import { db } from "@/lib/services/db"
import RoadtripPageClient from "./RoadtripPageClient"

export default async function RoadtripListPage() {
  const itineraries = await getItineraries({ published: true, limit: 100 })

  const { data: itinerariesAll } = await db
    .from("itineraries")
    .select("id")
    .eq("is_published", true)

  const ids = (itinerariesAll || []).map((r: { id: string }) => r.id)

  let provinceList: string[] = []
  let cityMap: Record<string, string[]> = {}

  if (ids.length > 0) {
    const { data: stops } = await db
      .from("itinerary_stops")
      .select("spot:spots!inner(slug, province, city)")
      .in("itinerary_id", ids)

    if (stops) {
      const stopSpots = stops as unknown as { spot: { slug: string; province: string; city: string } }[]
      provinceList = [...new Set(stopSpots.map((s) => s.spot?.province).filter(Boolean))].sort() as string[]

      for (const s of stopSpots) {
        const p = s.spot?.province
        const c = s.spot?.city
        if (p && c) {
          if (!cityMap[p]) cityMap[p] = []
          if (!cityMap[p].includes(c)) cityMap[p].push(c)
        }
      }
      for (const p of Object.keys(cityMap)) cityMap[p].sort()
    }
  }

  return (
    <RoadtripPageClient
      initialItineraries={itineraries}
      initialProvinces={provinceList}
      initialCities={cityMap}
    />
  )
}

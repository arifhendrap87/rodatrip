import { success, notFound } from "@/lib/api/response"
import { getRouteBySlug } from "@/lib/services/routes"

const FUEL_PRICE = 10000
const VEHICLES: Record<string, number> = {
  mobil: 11, motor: 30, suv: 9, mpv: 12,
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const url = new URL(_request.url)
  const vehicle = url.searchParams.get("vehicle") || "mobil"

  const route = await getRouteBySlug(slug)
  if (!route) return notFound("Route")

  const consumption = VEHICLES[vehicle] || VEHICLES.mobil
  const distance = Number(route.distance_km) || 0
  const fuelCost = Math.round((distance / consumption) * FUEL_PRICE)

  return success({
    ...route,
    estimate: {
      distanceKm: distance,
      fuelCost,
      fuelPrice: FUEL_PRICE,
      vehicleConsumption: consumption,
    },
  })
}

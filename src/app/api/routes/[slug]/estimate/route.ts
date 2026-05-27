import { createClient } from "@supabase/supabase-js"
import { success, notFound, badRequest, internalError } from "@/lib/api/response"
import { publicLimiter } from "@/lib/api/rate-limit"
import { success as estimateSuccess } from "@/lib/api/response"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const FUEL_PRICE = 10000
const VEHICLES: Record<string, number> = {
  mobil: 11, motor: 30, suv: 9, mpv: 12,
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const url = new URL(request.url)
  const vehicle = url.searchParams.get("vehicle") || "mobil"

  const { data: route, error } = await adminClient
    .from("routes")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error || !route) return notFound("Route")

  const consumption = VEHICLES[vehicle] || VEHICLES.mobil
  const distance = Number(route.distance_km) || 0
  const fuelLiters = distance / consumption
  const fuelCost = Math.round(fuelLiters * FUEL_PRICE)

  return estimateSuccess({
    distanceKm: distance,
    fuelCost,
    fuelLiters: Math.round(fuelLiters * 10) / 10,
    totalCost: fuelCost,
    vehicle,
    consumption,
  })
}

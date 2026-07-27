import { getSpots } from "@/lib/services/spots"
import SpotPageClient from "./SpotPageClient"
import type { SpotData } from "@/lib/services/spots"

export default async function SpotIstimewaPage() {
  const { data: spots } = await getSpots({ limit: 100 })

  return <SpotPageClient initialSpots={(spots || []) as SpotData[]} />
}

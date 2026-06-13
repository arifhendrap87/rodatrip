import { success } from "@/lib/api/response"
import { getItineraries } from "@/lib/services/itineraries"

export async function GET() {
  try {
    const itineraries = await getItineraries({ published: true })
    return success(itineraries)
  } catch {
    return success([])
  }
}

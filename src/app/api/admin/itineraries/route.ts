import { success, badRequest, unauthorized, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { getItineraries, createItinerary } from "@/lib/services/itineraries"
import { createItinerarySchema } from "@/lib/validators/itinerary"
import { db } from "@/lib/services/db"

export async function GET(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") || undefined
  const sort = searchParams.get("sort") || "terbaru"
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100)
  const offset = Number(searchParams.get("offset")) || 0

  try {
    // Get total count for pagination
    let countQuery = db.from("itineraries").select("*", { count: "exact", head: true })
    if (search) countQuery = countQuery.ilike("title", `%${search}%`)
    const { count } = await countQuery

    let orderCol = "created_at"
    let orderAsc = false
    if (sort === "judul") { orderCol = "title"; orderAsc = true }

    let idsQuery = db.from("itineraries").select("id").order(orderCol, { ascending: orderAsc })
    if (search) idsQuery = idsQuery.ilike("title", `%${search}%`)
    const { data: idRows } = await idsQuery

    if (!idRows || idRows.length === 0) {
      return success({ data: [], pagination: { total: 0, limit, offset, hasMore: false } })
    }

    const ids = idRows.map((r: any) => r.id)
    const filteredIds = ids.slice(offset, offset + limit)

    const itineraries = await getItineraries({ ids: filteredIds })
    return success({
      data: itineraries,
      pagination: { total: count || 0, limit, offset, hasMore: (offset + limit) < (count || 0) },
    })
  } catch {
    return success({ data: [], pagination: { total: 0, limit, offset, hasMore: false } })
  }
}

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const body = await request.json()
  const parsed = createItinerarySchema.safeParse(body)
  if (!parsed.success) {
    return badRequest(parsed.error.issues.map(e => e.message).join(", "))
  }

  const slug = parsed.data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  const result = await createItinerary({ ...parsed.data, slug })
  if (!result) return internalError("Failed to create itinerary")

  return success(result, 201)
}

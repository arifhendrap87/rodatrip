import { success, badRequest, unauthorized } from "@/lib/api/response"
import { createRouteSchema } from "@/lib/validators/route"
import { getServerAdmin } from "@/lib/api/auth"
import { getRoutes } from "@/lib/services/routes"
import { db } from "@/lib/services/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const origin = searchParams.get("origin")
  const destination = searchParams.get("destination")
  const search = searchParams.get("search")

  try {
    const routes = await getRoutes()
    let filtered = routes
    if (origin) filtered = filtered.filter((r) => r.origin.toLowerCase().includes(origin.toLowerCase()))
    if (destination) filtered = filtered.filter((r) => r.destination.toLowerCase().includes(destination.toLowerCase()))
    if (search) filtered = filtered.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    return success(filtered)
  } catch {
    return success([])
  }
}

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const body = await request.json()
  const parsed = createRouteSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(", "))

  const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const { data, error } = await db
    .from("routes")
    .insert([{ ...parsed.data, slug }])
    .select("id, slug, name, created_at")
    .single()

  if (error) return new Response(JSON.stringify({ error: { message: error.message } }), { status: 500 })
  return success(data, 201)
}

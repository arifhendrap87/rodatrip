import { createClient } from "@supabase/supabase-js"
import { success, badRequest, internalError, unauthorized } from "@/lib/api/response"
import { createRouteSchema, updateRouteSchema } from "@/lib/validators/route"
import { getServerAdmin } from "@/lib/api/auth"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const origin = searchParams.get("origin")
  const destination = searchParams.get("destination")
  const search = searchParams.get("search")

  let query = adminClient.from("routes").select("*").order("name")
  if (origin) query = query.ilike("origin", `%${origin}%`)
  if (destination) query = query.ilike("destination", `%${destination}%`)
  if (search) query = query.ilike("name", `%${search}%`)

  const { data, error } = await query
  if (error) return internalError(error.message)
  return success(data || [])
}

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const body = await request.json()
  const parsed = createRouteSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(", "))

  const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const { data, error } = await adminClient
    .from("routes")
    .insert([{ ...parsed.data, slug }])
    .select("id, slug, name, created_at")
    .single()

  if (error) return internalError(error.message)
  return success(data, 201)
}

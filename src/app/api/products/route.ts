import { createClient } from "@supabase/supabase-js"
import { success, paginated, badRequest, internalError, unauthorized } from "@/lib/api/response"
import { adminLimiter } from "@/lib/api/rate-limit"
import { createProductSchema, updateProductSchema } from "@/lib/validators/product"
import { getServerAdmin } from "@/lib/api/auth"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100)
  const offset = Number(searchParams.get("offset")) || 0

  let query = adminClient.from("products").select("*", { count: "exact" }).order("created_at", { ascending: false })
  if (category) query = query.eq("category", category)
  if (search) query = query.ilike("name", `%${search}%`)

  const { data, count, error } = await query.range(offset, offset + limit - 1)
  if (error) return internalError(error.message)
  return paginated(data || [], count || 0, limit, offset)
}

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const body = await request.json()
  const parsed = createProductSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(", "))

  const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const { data, error } = await adminClient
    .from("products")
    .insert([{ ...parsed.data, slug }])
    .select("id, slug, name, created_at")
    .single()

  if (error) return internalError(error.message)
  return success(data, 201)
}

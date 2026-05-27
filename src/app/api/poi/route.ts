import { createClient } from "@supabase/supabase-js"
import { success, badRequest, internalError, unauthorized } from "@/lib/api/response"
import { createPOISchema, updatePOISchema } from "@/lib/validators/poi"
import { getServerAdmin } from "@/lib/api/auth"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET() {
  const { data, error } = await adminClient.from("poi").select("*").order("name")
  if (error) return internalError(error.message)
  return success(data || [])
}

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const body = await request.json()
  const parsed = createPOISchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(", "))

  const { data, error } = await adminClient
    .from("poi")
    .insert([{
      ...parsed.data,
      location: `POINT(${parsed.data.longitude} ${parsed.data.latitude})`,
    }])
    .select("id, name, created_at")
    .single()

  if (error) return internalError(error.message)
  return success(data, 201)
}

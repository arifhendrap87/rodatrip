import { createClient } from "@supabase/supabase-js"
import { success, paginated, badRequest, conflict, internalError, unauthorized, csv } from "@/lib/api/response"
import { adminLimiter } from "@/lib/api/rate-limit"
import { createWaitlistSchema } from "@/lib/validators/waitlist"
import { getServerAdmin } from "@/lib/api/auth"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = await adminLimiter(`waitlist:${ip}`)
  if (!allowed) return unauthorized("Rate limited")

  const body = await request.json()
  const parsed = createWaitlistSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(", "))

  const { data, error } = await adminClient
    .from("waitlist")
    .insert([{ email: parsed.data.email, source: parsed.data.source }])
    .select("id, email, created_at")
    .single()

  if (error?.code === "23505") return conflict("Email already registered")
  if (error) return internalError(error.message)

  return success(data, 201)
}

export async function GET(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 200)
  const offset = Number(searchParams.get("offset")) || 0

  const { data, count, error } = await adminClient
    .from("waitlist")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return internalError(error.message)
  return paginated(data || [], count || 0, limit, offset)
}

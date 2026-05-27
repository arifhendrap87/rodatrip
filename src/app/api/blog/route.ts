import { createClient } from "@supabase/supabase-js"
import { success, internalError, badRequest } from "@/lib/api/response"
import { publicLimiter } from "@/lib/api/rate-limit"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = publicLimiter(`blog:${ip}`)
  if (!allowed) return badRequest("Rate limited")

  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100)

  let query = adminClient
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })

  if (category) query = query.eq("category", category)

  const { data, error } = await query.limit(limit)
  if (error) return internalError(error.message)
  return success(data || [])
}

import { createClient } from "@supabase/supabase-js"
import { success, internalError, notFound } from "@/lib/api/response"
import { publicLimiter } from "@/lib/api/rate-limit"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const { data, error } = await adminClient
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (error && error.code === "PGRST116") return notFound("Blog post")
  if (error) return internalError(error.message)
  return success(data)
}

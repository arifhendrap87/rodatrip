import { createClient } from "@supabase/supabase-js"
import { success, internalError } from "@/lib/api/response"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: spot } = await adminClient
    .from("spots")
    .select("view_count")
    .eq("slug", slug)
    .single()

  const currentCount = (spot?.view_count as number) || 0

  const { error: updateError } = await adminClient
    .from("spots")
    .update({ view_count: currentCount + 1 })
    .eq("slug", slug)

  if (updateError) return internalError(updateError.message)

  return success({ viewCount: currentCount + 1 })
}

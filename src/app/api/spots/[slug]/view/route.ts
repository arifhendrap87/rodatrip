import { createClient } from "@supabase/supabase-js"
import { success, internalError } from "@/lib/api/response"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data, error: dbError } = await adminClient.rpc("increment_view_count", { slug_param: slug })
  if (dbError) {
    const { error: updateError } = await adminClient
      .from("spots")
      .update({ view_count: adminClient.rpc("increment", { x: 1 }) as unknown as number })
      .eq("slug", slug)

    if (updateError) return internalError(updateError.message)
  }

  const { data: spot } = await adminClient
    .from("spots")
    .select("view_count")
    .eq("slug", slug)
    .single()

  return success({ viewCount: spot?.view_count || 0 })
}

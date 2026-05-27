import { createClient } from "@supabase/supabase-js"
import { success, internalError, unauthorized } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET() {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { data, error } = await adminClient
    .from("analytics")
    .select("event_type", { count: "exact" })

  if (error) return internalError(error.message)
  return success({ totalViews: data?.length || 0 })
}

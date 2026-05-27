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
    .from("spots")
    .select("category")

  if (error) return internalError(error.message)

  const counts: Record<string, number> = {}
  for (const spot of data || []) {
    counts[spot.category] = (counts[spot.category] || 0) + 1
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const distribution = Object.entries(counts).map(([category, count]) => ({
    category,
    count,
    percentage: Math.round((count / total) * 100),
  }))

  return success(distribution)
}

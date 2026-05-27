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

  const [spotsCount, productsCount, waitlistCount, viewsCount] = await Promise.all([
    adminClient.from("spots").select("id", { count: "exact", head: true }),
    adminClient.from("products").select("id", { count: "exact", head: true }),
    adminClient.from("waitlist").select("id", { count: "exact", head: true }),
    adminClient.from("analytics").select("id", { count: "exact", head: true }),
  ])

  if (spotsCount.error) return internalError(spotsCount.error.message)
  if (productsCount.error) return internalError(productsCount.error.message)
  if (waitlistCount.error) return internalError(waitlistCount.error.message)
  if (viewsCount.error) return internalError(viewsCount.error.message)

  return success({
    spots: spotsCount.count || 0,
    products: productsCount.count || 0,
    waitlist: waitlistCount.count || 0,
    views: viewsCount.count || 0,
  })
}

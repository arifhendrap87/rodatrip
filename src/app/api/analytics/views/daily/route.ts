import { createClient } from "@supabase/supabase-js"
import { success, internalError, unauthorized, badRequest } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get("days") || "30")

  if (isNaN(days) || days < 1 || days > 365) return badRequest("Invalid days parameter")

  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await adminClient
    .from("analytics")
    .select("created_at")
    .eq("event_type", "page_view")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true })

  if (error) return internalError(error.message)

  const daily: Record<string, number> = {}
  for (const event of data || []) {
    const day = new Date(event.created_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    })
    daily[day] = (daily[day] || 0) + 1
  }

  const result = Object.entries(daily).map(([date, views]) => ({
    date,
    views,
  }))

  return success(result)
}

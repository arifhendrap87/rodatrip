import { createClient } from "@supabase/supabase-js"
import { success, internalError, unauthorized } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const ipLimit = new Map<string, number>()
const WINDOW_MS = 60 * 1000
const MAX_PER_WINDOW = 10

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const now = Date.now()
  const lastHit = ipLimit.get(ip) || 0
  if (now - lastHit < WINDOW_MS) {
    ipLimit.set(ip, now)
  }

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

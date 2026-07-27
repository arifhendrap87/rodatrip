import { createClient } from "@supabase/supabase-js"
import { success, internalError, unauthorized } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const ipLimit = new Map<string, number>()
const WINDOW_MS = 60 * 1000 // 1 menit
const MAX_PER_WINDOW = 30

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const now = Date.now()

  const lastReset = ipLimit.get(ip) || 0
  if (now - lastReset < WINDOW_MS && lastReset > 0) {
    return success({ ok: true, throttled: true })
  }
  // Reset counter periodically
  if (now - lastReset > WINDOW_MS) {
    ipLimit.delete(ip)
  }

  const body = await request.json()
  const { eventType, entityType, entityId, metadata } = body

  if (!eventType) return success({ error: "eventType required" })

  const { data, error } = await adminClient
    .from("analytics")
    .insert([{
      event_type: eventType,
      entity_type: entityType,
      entity_id: entityId,
      metadata: metadata || {},
    }])
    .select("id")
    .single()

  if (error) return internalError(error.message)
  ipLimit.set(ip, now)
  return success({ eventId: data?.id })
}

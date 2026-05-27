import { createClient } from "@supabase/supabase-js"
import { success, internalError } from "@/lib/api/response"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: Request) {
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
  return success({ eventId: data?.id })
}

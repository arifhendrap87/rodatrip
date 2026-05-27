import { createClient } from "@supabase/supabase-js"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function logAudit(params: {
  userId?: string
  action: "CREATE" | "UPDATE" | "DELETE"
  entityType: string
  entityId?: string
  oldValue?: unknown
  newValue?: unknown
}) {
  try {
    await adminClient.from("audit_logs").insert({
      user_id: params.userId,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      old_value: params.oldValue ? JSON.stringify(params.oldValue) : null,
      new_value: params.newValue ? JSON.stringify(params.newValue) : null,
    })
  } catch (err) {
    console.error("Audit log error:", err)
  }
}

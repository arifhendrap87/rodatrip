import { success, badRequest, unauthorized } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { session_id, role, content } = await request.json()

  if (!session_id || !role || !content) {
    return badRequest("session_id, role, dan content wajib diisi")
  }

  if (!["user", "assistant"].includes(role)) {
    return badRequest("Role harus 'user' atau 'assistant'")
  }

  const { data, error } = await db
    .from("chat_messages")
    .insert({ session_id, role, content })
    .select("id, role, content, created_at")
    .single()

  if (error) return badRequest(error.message)

  await db
    .from("chat_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", session_id)

  return success(data, 201)
}

import { success, unauthorized, internalError, notFound } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { id } = await params

  const { data: session } = await db
    .from("chat_sessions")
    .select("id, title")
    .eq("id", id)
    .eq("user_id", admin.id)
    .maybeSingle()

  if (!session) return notFound("Session")

  const { data: messages } = await db
    .from("chat_messages")
    .select("role, content, created_at")
    .eq("session_id", id)
    .order("created_at", { ascending: true })

  return success({ session, messages: messages || [] })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { id } = await params

  const { error } = await db
    .from("chat_sessions")
    .delete()
    .eq("id", id)
    .eq("user_id", admin.id)

  if (error) return internalError(error.message)
  return success({ deleted: true })
}

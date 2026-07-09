import { success, badRequest, unauthorized } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

export async function GET() {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { data } = await db
    .from("chat_sessions")
    .select("id, title, created_at, updated_at")
    .eq("user_id", admin.id)
    .order("updated_at", { ascending: false })
    .limit(50)

  return success(data || [])
}

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const body = await request.json()
  const title = body.title || "Chat Baru"

  const { data, error } = await db
    .from("chat_sessions")
    .insert({ user_id: admin.id, title })
    .select("id, title, created_at")
    .single()

  if (error) return badRequest(error.message)
  return success(data, 201)
}

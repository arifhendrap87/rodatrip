import { success, created, badRequest, unauthorized, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const body = await request.json()
  const { access_token, refresh_token, account_name, account_id } = body

  if (!access_token || !account_id) {
    return badRequest("access_token dan account_id wajib diisi")
  }

  const { data, error } = await db
    .from("social_accounts")
    .upsert(
      {
        platform: "twitter",
        account_name: account_name || null,
        account_id,
        access_token,
        refresh_token: refresh_token || null,
        connected: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "platform" }
    )
    .select()
    .single()

  if (error) return internalError(error.message)

  return created(data)
}

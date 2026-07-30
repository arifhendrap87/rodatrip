import { NextResponse } from "next/server"
import { unauthorized } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID
const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI

const SCOPE = [
  "pages_manage_posts",
  "pages_show_list",
].join(",")

export async function GET() {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  if (!FACEBOOK_APP_ID || !REDIRECT_URI) {
    return NextResponse.json(
      { error: { code: "MISSING_CONFIG", message: "Facebook OAuth not configured" } },
      { status: 500 }
    )
  }

  const state = Buffer.from(JSON.stringify({ adminId: admin.id, ts: Date.now() })).toString("base64")

  const params = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    redirect_uri: REDIRECT_URI,
    state,
    scope: SCOPE,
    response_type: "code",
  })

  return NextResponse.redirect(`https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`)
}

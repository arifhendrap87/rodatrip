import { NextResponse } from "next/server"
import { unauthorized } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID
const REDIRECT_URI = process.env.THREADS_REDIRECT_URI || process.env.FACEBOOK_REDIRECT_URI

export async function GET() {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  if (!FACEBOOK_APP_ID || !REDIRECT_URI) {
    return NextResponse.json(
      { error: { code: "MISSING_CONFIG", message: "Threads OAuth not configured" } },
      { status: 500 }
    )
  }

  const params = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    redirect_uri: REDIRECT_URI,
    scope: "threads_basic,threads_content_publish",
    response_type: "code",
  })

  return NextResponse.redirect(`https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`)
}

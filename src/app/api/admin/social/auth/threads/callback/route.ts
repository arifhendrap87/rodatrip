import { NextResponse } from "next/server"
import { unauthorized, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET
const REDIRECT_URI = process.env.THREADS_REDIRECT_URI || process.env.FACEBOOK_REDIRECT_URI
const API_BASE = "https://graph.threads.net/v1.0"

export async function GET(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(new URL("/admin/social?error=" + error, request.url))
  }
  if (!code) {
    return NextResponse.redirect(new URL("/admin/social?error=no_code", request.url))
  }
  if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET || !REDIRECT_URI) {
    return internalError("Threads OAuth not configured")
  }

  try {
    const tokenRes = await fetch(`${API_BASE}/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
        code,
      }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL("/admin/social?error=token_exchange_failed", request.url))
    }

    const shortToken = tokenData.access_token

    const longRes = await fetch(`${API_BASE}/access_token?grant_type=th_exchange_token&client_secret=${FACEBOOK_APP_SECRET}&access_token=${shortToken}`)
    const longData = await longRes.json()
    const accessToken = longData.access_token || shortToken

    const meRes = await fetch(`${API_BASE}/me?fields=id,username&access_token=${accessToken}`)
    const meData = await meRes.json()

    const threadsUserId = meData.id
    const username = meData.username

    if (!threadsUserId) {
      return NextResponse.redirect(new URL("/admin/social?error=no_account", request.url))
    }

    await db
      .from("social_accounts")
      .upsert(
        {
          platform: "threads",
          account_name: username,
          account_id: threadsUserId,
          access_token: accessToken,
          connected: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "platform" }
      )

    return NextResponse.redirect(new URL("/admin/social?connected=threads", request.url))
  } catch (err) {
    return NextResponse.redirect(new URL("/admin/social?error=callback_failed", request.url))
  }
}

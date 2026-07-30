import { NextResponse } from "next/server"
import { unauthorized, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET
const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI
const API_BASE = "https://graph.facebook.com/v21.0"

export async function GET(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const errorReason = searchParams.get("error_reason")

  if (error || errorReason) {
    return NextResponse.redirect(new URL("/admin/social?error=" + (error || errorReason), request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/admin/social?error=no_code", request.url))
  }

  if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET || !REDIRECT_URI) {
    return internalError("Facebook OAuth not configured")
  }

  try {
    const tokenRes = await fetch(`${API_BASE}/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        redirect_uri: REDIRECT_URI,
        code,
      }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return NextResponse.redirect(
        new URL("/admin/social?error=token_exchange_failed", request.url)
      )
    }

    const shortToken = tokenData.access_token

    const longTokenRes = await fetch(`${API_BASE}/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        grant_type: "fb_exchange_token",
        fb_exchange_token: shortToken,
      }),
    })

    const longTokenData = await longTokenRes.json()
    const accessToken = longTokenData.access_token || shortToken

    const pagesRes = await fetch(`${API_BASE}/me/accounts?access_token=${accessToken}`)
    const pagesData = await pagesRes.json()

    const page = pagesData.data?.[0]
    if (!page) {
      return NextResponse.redirect(
        new URL("/admin/social?error=no_page", request.url)
      )
    }

    const pageAccessToken = page.access_token
    const pageId = page.id
    const pageName = page.name

    let igAccountId: string | null = null
    const igRes = await fetch(`${API_BASE}/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`)
    const igData = await igRes.json()
    igAccountId = igData.instagram_business_account?.id || null

    await db
      .from("social_accounts")
      .upsert(
        {
          platform: "facebook",
          account_name: pageName,
          account_id: pageId,
          page_id: pageId,
          page_name: pageName,
          access_token: pageAccessToken,
          connected: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "platform" }
      )

    if (igAccountId) {
      await db
        .from("social_accounts")
        .upsert(
          {
            platform: "instagram",
            account_name: pageName,
            account_id: igAccountId,
            ig_account_id: igAccountId,
            access_token: pageAccessToken,
            connected: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "platform" }
        )
    }

    return NextResponse.redirect(new URL("/admin/social?connected=facebook", request.url))
  } catch (err) {
    return NextResponse.redirect(
      new URL("/admin/social?error=callback_failed", request.url)
    )
  }
}

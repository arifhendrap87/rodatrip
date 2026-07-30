import { db } from "@/lib/services/db"

const API_BASE = "https://graph.facebook.com/v21.0"

interface SocialAccount {
  platform: string
  account_name: string | null
  account_id: string | null
  access_token: string | null
  refresh_token: string | null
  page_id?: string | null
  page_name?: string | null
}

interface Post {
  id: string
  draft_id: string
  platform: string
  scheduled_at?: string
  status?: string
}

export async function publishToFacebook(
  post: Post,
  account: SocialAccount
): Promise<{ success: boolean; error?: string; post_url?: string }> {
  const token = account.access_token
  const pageId = account.page_id || account.account_id

  if (!token || !pageId) {
    return { success: false, error: "Facebook account not fully connected (missing token or page ID)" }
  }

  const { data: draft } = await db
    .from("content_drafts")
    .select("caption, title, hashtags, slide_images")
    .eq("id", post.draft_id)
    .single()

  if (!draft) {
    return { success: false, error: "Draft not found" }
  }

  let message = draft.caption || draft.title || ""
  if (draft.hashtags) {
    message += "\n\n" + draft.hashtags
  }

  try {
    const res = await fetch(`${API_BASE}/${pageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        access_token: token,
      }),
    })

    const data = await res.json()

    if (data.error) {
      return { success: false, error: `Facebook API error: ${data.error.message}` }
    }

    return {
      success: true,
      post_url: `https://facebook.com/${pageId}/posts/${data.id}`,
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}

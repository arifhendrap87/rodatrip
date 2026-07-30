import { db } from "@/lib/services/db"

const API_BASE = "https://graph.threads.net/v1.0"

interface SocialAccount {
  platform: string
  account_name: string | null
  account_id: string | null
  access_token: string | null
}

interface Post {
  id: string
  draft_id: string
  platform: string
}

export async function publishToThreads(
  post: Post,
  account: SocialAccount
): Promise<{ success: boolean; error?: string; post_url?: string }> {
  const token = account.access_token
  const threadsUserId = account.account_id

  if (!token || !threadsUserId) {
    return { success: false, error: "Threads account not fully connected (missing token or user ID)" }
  }

  const { data: draft } = await db
    .from("content_drafts")
    .select("caption, title, hashtags")
    .eq("id", post.draft_id)
    .single()

  if (!draft) {
    return { success: false, error: "Draft not found" }
  }

  let text = draft.caption || draft.title || ""
  if (draft.hashtags) {
    text += "\n\n" + draft.hashtags
  }

  try {
    const threadRes = await fetch(`${API_BASE}/${threadsUserId}/threads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        access_token: token,
      }),
    })

    const threadData = await threadRes.json()

    if (threadData.error) {
      return { success: false, error: `Threads API error (create): ${threadData.error.message}` }
    }

    const creationId = threadData.id

    const publishRes = await fetch(`${API_BASE}/${threadsUserId}/threads_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: token,
      }),
    })

    const publishData = await publishRes.json()

    if (publishData.error) {
      return { success: false, error: `Threads API error (publish): ${publishData.error.message}` }
    }

    return {
      success: true,
      post_url: `https://threads.net/@${account.account_name}/post/${publishData.id}`,
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}

import { db } from "@/lib/services/db"

const API_BASE = "https://graph.facebook.com/v21.0"

interface SocialAccount {
  platform: string
  account_name: string | null
  account_id: string | null
  access_token: string | null
  ig_account_id?: string | null
}

interface Post {
  id: string
  draft_id: string
  platform: string
}

export async function publishToInstagram(
  post: Post,
  account: SocialAccount
): Promise<{ success: boolean; error?: string; post_url?: string }> {
  const token = account.access_token
  const igUserId = account.ig_account_id || account.account_id

  if (!token || !igUserId) {
    return { success: false, error: "Instagram account not fully connected (missing token or IG account ID)" }
  }

  const { data: draft } = await db
    .from("content_drafts")
    .select("caption, title, hashtags, slide_images, image_prompts, concept_type")
    .eq("id", post.draft_id)
    .single()

  if (!draft) {
    return { success: false, error: "Draft not found" }
  }

  let caption = draft.caption || draft.title || ""
  if (draft.hashtags) {
    caption += "\n\n" + draft.hashtags
  }

  let imageUrl: string | null = null

  if (Array.isArray(draft.slide_images) && draft.slide_images.length > 0) {
    const slides = draft.slide_images as Record<string, unknown>[]
    const firstSlide = slides[0]
    if (typeof firstSlide === "string") {
      imageUrl = firstSlide
    } else if (typeof firstSlide?.url === "string") {
      imageUrl = firstSlide.url as string
    }
  }

  if (!imageUrl) {
    return { success: false, error: "No image available for Instagram post. Generate images first." }
  }

  try {
    const mediaRes = await fetch(`${API_BASE}/${igUserId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: token,
      }),
    })

    const mediaData = await mediaRes.json()

    if (mediaData.error) {
      return { success: false, error: `Instagram API error (media): ${mediaData.error.message}` }
    }

    const creationId = mediaData.id

    const publishRes = await fetch(`${API_BASE}/${igUserId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: token,
      }),
    })

    const publishData = await publishRes.json()

    if (publishData.error) {
      return { success: false, error: `Instagram API error (publish): ${publishData.error.message}` }
    }

    return {
      success: true,
      post_url: `https://instagram.com/p/${publishData.id}/`,
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}

import { publishToFacebook } from "./facebook"
import { publishToInstagram } from "./instagram"
import { publishToThreads } from "./threads"

interface SocialAccount {
  platform: string
  account_name: string | null
  account_id: string | null
  access_token: string | null
  refresh_token: string | null
  page_id?: string | null
  page_name?: string | null
  ig_account_id?: string | null
}

interface Post {
  id: string
  draft_id: string
  platform: string
  scheduled_at?: string
  status?: string
}

async function publishToTwitter(_post: Post, _account: SocialAccount): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: "Twitter/X API is paid. Not implemented." }
}

export async function publishToPlatform(
  post: Post,
  account: SocialAccount
): Promise<{ success: boolean; error?: string; post_url?: string }> {
  const platformPublishers: Record<string, (post: Post, account: SocialAccount) => Promise<{ success: boolean; error?: string; post_url?: string }>> = {
    twitter: publishToTwitter,
    instagram: publishToInstagram,
    facebook: publishToFacebook,
    threads: publishToThreads,
  }

  const publisher = platformPublishers[account.platform]
  if (!publisher) {
    return { success: false, error: `Unknown platform: ${account.platform}` }
  }

  return publisher(post, account)
}

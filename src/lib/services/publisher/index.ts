interface SocialAccount {
  platform: string
  account_name: string | null
  account_id: string | null
  access_token: string | null
  refresh_token: string | null
}

interface Post {
  id: string
  draft_id: string
  platform: string
  content?: string
  media_urls?: string[]
}

async function publishToTwitter(post: Post, _account: SocialAccount): Promise<{ success: boolean; error?: string }> {
  console.log(`[Publisher] Publishing to Twitter`, {
    postId: post.id,
    draftId: post.draft_id,
    content: post.content?.slice(0, 100),
    mediaCount: post.media_urls?.length || 0,
  })
  return { success: true }
}

async function publishToInstagram(post: Post, _account: SocialAccount): Promise<{ success: boolean; error?: string }> {
  console.log(`[Publisher] Publishing to Instagram`, {
    postId: post.id,
    draftId: post.draft_id,
    content: post.content?.slice(0, 100),
    mediaCount: post.media_urls?.length || 0,
  })
  return { success: true }
}

async function publishToFacebook(post: Post, _account: SocialAccount): Promise<{ success: boolean; error?: string }> {
  console.log(`[Publisher] Publishing to Facebook`, {
    postId: post.id,
    draftId: post.draft_id,
    content: post.content?.slice(0, 100),
  })
  return { success: true }
}

async function publishToThreads(post: Post, _account: SocialAccount): Promise<{ success: boolean; error?: string }> {
  console.log(`[Publisher] Publishing to Threads`, {
    postId: post.id,
    draftId: post.draft_id,
    content: post.content?.slice(0, 100),
  })
  return { success: true }
}

export async function publishToPlatform(
  post: Post,
  account: SocialAccount
): Promise<{ success: boolean; error?: string }> {
  const platformPublishers: Record<string, (post: Post, account: SocialAccount) => Promise<{ success: boolean; error?: string }>> = {
    twitter: publishToTwitter,
    instagram: publishToInstagram,
    facebook: publishToFacebook,
    threads: publishToThreads,
  }

  const publisher = platformPublishers[account.platform]
  if (!publisher) {
    const msg = `Unknown platform: ${account.platform}`
    console.error(`[Publisher] ${msg}`)
    return { success: false, error: msg }
  }

  return publisher(post, account)
}

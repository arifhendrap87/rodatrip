import { success, internalError, rateLimited } from "@/lib/api/response"
import { publicLimiter } from "@/lib/api/rate-limit"
import { db } from "@/lib/services/db"
import { publishToPlatform } from "@/lib/services/publisher"

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "cron-job"
  const { allowed } = await publicLimiter(`cron-publish:${ip}`)
  if (!allowed) return rateLimited(30)

  const now = new Date().toISOString()

  const { data: posts, error: fetchError } = await db
    .from("scheduled_posts")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_at", now)

  if (fetchError) return internalError(fetchError.message)

  const results: { id: string; status: string; error?: string }[] = []

  for (const post of posts || []) {
    const { data: accounts } = await db
      .from("social_accounts")
      .select("*")
      .eq("platform", (post as Record<string, unknown>).platform)
      .eq("connected", true)

    const account = accounts?.[0]
    if (!account) {
      await db
        .from("scheduled_posts")
        .update({ status: "failed", error_message: "No connected account found", updated_at: now })
        .eq("id", (post as Record<string, unknown>).id)

      results.push({ id: String((post as Record<string, unknown>).id), status: "failed", error: "No connected account" })
      continue
    }

    const result = await publishToPlatform(post as never, account as never)

    if (result.success) {
      const updateData: Record<string, unknown> = {
        status: "published",
        published_at: now,
        updated_at: now,
      }
      if (result.post_url) {
        updateData.post_url = result.post_url
      }
      await db
        .from("scheduled_posts")
        .update(updateData)
        .eq("id", (post as Record<string, unknown>).id)

      results.push({ id: String((post as Record<string, unknown>).id), status: "published" })
    } else {
      await db
        .from("scheduled_posts")
        .update({ status: "failed", error_message: result.error || "Unknown error", updated_at: now })
        .eq("id", (post as Record<string, unknown>).id)

      results.push({ id: String((post as Record<string, unknown>).id), status: "failed", error: result.error })
    }
  }

  return success({ processed: results.length, results })
}

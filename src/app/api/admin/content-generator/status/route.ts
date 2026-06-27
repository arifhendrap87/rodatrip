import { success, unauthorized, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

export async function GET(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const contentType = searchParams.get("content_type") || "spot"

  try {
    const { data, error } = await db
      .from("content_drafts")
      .select("source_id, platform, tone, updated_at")
      .eq("content_type", contentType)
      .eq("created_by", admin.id)

    if (error) return internalError(error.message)

    const statusMap: Record<string, Record<string, { tone: string; updatedAt: string }>> = {}
    for (const draft of data || []) {
      if (!statusMap[draft.source_id]) statusMap[draft.source_id] = {}
      statusMap[draft.source_id][draft.platform] = {
        tone: draft.tone,
        updatedAt: draft.updated_at,
      }
    }

    return success({ status: statusMap })
  } catch (err) {
    return internalError(err instanceof Error ? err.message : "Failed to fetch status")
  }
}

import { success, created, badRequest, unauthorized, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

export async function GET(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const platform = searchParams.get("platform")
  const status = searchParams.get("status")
  const contentType = searchParams.get("content_type")
  const search = searchParams.get("search")
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
  const offset = parseInt(searchParams.get("offset") || "0")

  let query = db
    .from("content_drafts")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false })

  if (platform) query = query.eq("platform", platform)
  if (status) query = query.eq("status", status)
  if (contentType) query = query.eq("content_type", contentType)
  if (search) query = query.ilike("title", `%${search}%`)

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) return internalError(error.message)

  return success({
    drafts: data || [],
    pagination: {
      total: count || 0,
      limit,
      offset,
      hasMore: (offset + limit) < (count || 0),
    },
  })
}

export async function POST(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const body = await request.json()
  const { title, platform, tone, content_type, source_id, source_title, caption, hashtags, skrip_tiktok, scheduled_at } = body

  if (!title || !platform || !tone || !content_type) {
    return badRequest("title, platform, tone, content_type wajib diisi")
  }

  const validPlatforms = ["facebook", "instagram", "tiktok"]
  if (!validPlatforms.includes(platform)) {
    return badRequest("platform harus facebook, instagram, atau tiktok")
  }

  const validTones = ["promo", "edukasi", "inspirasi", "storytelling"]
  if (!validTones.includes(tone)) {
    return badRequest("tone harus promo, edukasi, inspirasi, atau storytelling")
  }

  const { data, error } = await db
    .from("content_drafts")
    .insert({
      title,
      platform,
      tone,
      content_type,
      source_id: source_id || null,
      source_title: source_title || null,
      caption: caption || "",
      hashtags: hashtags || "",
      skrip_tiktok: skrip_tiktok || "",
      scheduled_at: scheduled_at || null,
      created_by: admin.id,
    })
    .select()
    .single()

  if (error) return internalError(error.message)

  return created({ draft: data })
}

export async function PUT(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const body = await request.json()
  const { id, ...fields } = body

  if (!id) return badRequest("id wajib diisi")

  const allowedFields = ["title", "caption", "hashtags", "skrip_tiktok", "status", "scheduled_at"]

  const updates: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (fields[key] !== undefined) {
      updates[key] = fields[key]
    }
  }
  updates.updated_at = new Date().toISOString()

  const { data, error } = await db
    .from("content_drafts")
    .update(updates)
    .eq("id", id)
    .eq("created_by", admin.id)
    .select()
    .single()

  if (error) return internalError(error.message)
  if (!data) return badRequest("Draft tidak ditemukan")

  return success({ draft: data })
}

export async function DELETE(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) return badRequest("id wajib diisi")

  const { error } = await db
    .from("content_drafts")
    .delete()
    .eq("id", id)
    .eq("created_by", admin.id)

  if (error) return internalError(error.message)

  return success({ deleted: true })
}

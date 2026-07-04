import { success, badRequest, unauthorized, internalError, notFound } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { slug } = await params

  const { data, error } = await db
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()

  if (error) return internalError(error.message)
  if (!data) return notFound("Blog post")

  return success(data)
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { slug } = await params
  const body = await request.json()
  const { title, excerpt, content, image_url, category, author, tags, read_time, is_published } = body

  const updates: Record<string, unknown> = {}
  if (title !== undefined) updates.title = title
  if (excerpt !== undefined) updates.excerpt = excerpt
  if (content !== undefined) updates.content = content
  if (image_url !== undefined) updates.image_url = image_url
  if (category !== undefined) updates.category = category
  if (author !== undefined) updates.author = author
  if (read_time !== undefined) updates.read_time = read_time
  if (tags !== undefined) updates.tags = tags
  if (is_published !== undefined) {
    updates.is_published = is_published
    if (is_published) updates.published_at = new Date().toISOString()
  }

  const { data, error } = await db
    .from("blog_posts")
    .update(updates)
    .eq("slug", slug)
    .select()
    .single()

  if (error) return internalError(error.message)
  if (!data) return notFound("Blog post")

  return success({ post: data })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { slug } = await params

  const { error } = await db
    .from("blog_posts")
    .delete()
    .eq("slug", slug)

  if (error) return internalError(error.message)
  return success({ deleted: true })
}

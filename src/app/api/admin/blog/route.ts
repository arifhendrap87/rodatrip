import { success, badRequest, unauthorized, conflict, internalError } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

export async function GET(request: Request) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100)
  const offset = Number(searchParams.get("offset")) || 0
  const search = searchParams.get("search") || undefined
  const category = searchParams.get("category") || undefined
  const status = searchParams.get("status") || undefined
  const sort = searchParams.get("sort") || "terbaru"

  let query = db.from("blog_posts").select("*", { count: "exact" })

  if (sort === "terbaru") query = query.order("created_at", { ascending: false })
  else if (sort === "judul") query = query.order("title", { ascending: true })
  else if (sort === "judul_desc") query = query.order("title", { ascending: false })

  if (search) {
    query = query.ilike("title", `%${search}%`)
  }
  if (category) {
    query = query.eq("category", category)
  }
  if (status === "published") {
    query = query.eq("is_published", true)
  } else if (status === "draft") {
    query = query.eq("is_published", false)
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) return internalError(error.message)

  return success({
    posts: data || [],
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
  const { title, slug, excerpt, content, image_url, category, author, tags, read_time, is_published, seo_title, meta_description, prompt_gambar } = body

  if (!title) return badRequest("title wajib diisi")
  if (!slug) return badRequest("slug wajib diisi")

  const { data: existingSlug } = await db
    .from("blog_posts")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle()

  if (existingSlug) return conflict(`Slug "${slug}" sudah digunakan`)

  const { data, error } = await db
    .from("blog_posts")
    .insert({
      title,
      slug,
      excerpt: excerpt || "",
      content: content || "",
      image_url: image_url || "",
      category: category || "Tips",
      author: author || "RodaTrip",
      tags: tags || [],
      read_time: read_time || "5 min",
      is_published: is_published || false,
      published_at: is_published ? new Date().toISOString() : null,
      seo_title: seo_title || null,
      meta_description: meta_description || null,
      prompt_gambar: prompt_gambar || null,
    })
    .select()
    .single()

  if (error) return internalError(error.message)
  return success({ post: data }, 201)
}

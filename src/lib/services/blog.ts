import { db } from "./db"

export interface BlogPostData {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  image_url: string
  category: string
  author: string
  published_at: string
  read_time: string
  tags: string[]
  is_published: boolean
  created_at: string
  updated_at: string
}

export async function getPosts(options?: {
  category?: string
  limit?: number
}): Promise<BlogPostData[]> {
  try {
    let query = db
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false })

    if (options?.category) query = query.eq("category", options.category)
    if (options?.limit) query = query.limit(options.limit)

    const { data, error } = await query
    if (error) return []
    return (data || []) as BlogPostData[]
  } catch {
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPostData | null> {
  try {
    const { data, error } = await db
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single()

    if (error) return null
    return data as BlogPostData
  } catch {
    return null
  }
}

import { success, notFound } from "@/lib/api/response"
import { getPostBySlug } from "@/lib/services/blog"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return notFound("Blog post")
  return success(post)
}

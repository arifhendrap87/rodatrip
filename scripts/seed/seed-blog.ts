import { blogPosts } from "../../src/data/blog"
import { supabase, ensureTable, log, divider } from "./config"

const CREATE_BLOG_TABLE = `
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text NOT NULL,
  image_url text,
  category text,
  author text,
  published_at timestamptz,
  read_time text,
  tags text[] DEFAULT '{}',
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at) WHERE is_published = true;
`

export async function seedBlog() {
  log("📝", "Seeding blog posts...")
  await ensureTable("blog_posts", CREATE_BLOG_TABLE)

  let inserted = 0
  let skipped = 0
  let errors = 0

  for (const post of blogPosts) {
    const { data: existing } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", post.slug)
      .maybeSingle()

    if (existing) {
      skipped++
      continue
    }

    const { error } = await supabase.from("blog_posts").insert({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      image_url: post.image || null,
      category: post.category,
      author: post.author,
      published_at: post.date,
      read_time: post.readTime,
      tags: post.tags,
      is_published: true,
    })

    if (error) {
      log("❌", `Failed to insert blog "${post.title}": ${error.message}`)
      errors++
    } else {
      inserted++
    }
  }

  divider()
  log("📊", `Blog posts: ${inserted} inserted, ${skipped} skipped, ${errors} errors`)
  return { inserted, skipped, errors }
}

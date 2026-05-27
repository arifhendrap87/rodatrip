import Link from "next/link"
import { SITE_NAME } from "@/lib/constants"

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  image_url: string
  category: string
  author: string
  published_at: string
  read_time: string
  tags: string[]
}

export const dynamic = "force-dynamic"

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/blog`, {
      next: { revalidate: 3600 },
    })
    const json = await res.json()
    return json.data || []
  } catch {
    return []
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts()
  const categories = [...new Set(posts.map((p) => p.category))]

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.08] via-accent/[0.03] to-background py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">Blog</span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold font-heading leading-tight">
            Blog{" "}
            <span className="bg-gradient-to-r from-primary via-[hsl(340_85%_55%)] to-accent bg-clip-text text-transparent">Roadtrip</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">Tips, panduan, dan cerita seru seputar roadtrip di Indonesia.</p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <span key={cat} className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">{cat}</span>
            ))}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}
                className="group rounded-2xl border border-border/50 bg-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <span className="text-5xl opacity-30">🚗</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{post.category}</span>
                    <span>{post.read_time}</span>
                  </div>
                  <h2 className="text-lg font-bold font-heading group-hover:text-primary transition-colors">{post.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <span>{new Date(post.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

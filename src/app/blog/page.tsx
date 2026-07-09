import Link from "next/link"
import { SITE_NAME } from "@/lib/constants"
import { getPosts } from "@/lib/services/blog"
import type { BlogPostData } from "@/lib/services/blog"
import { BlogImage } from "@/components/ui/BlogImage"

export const dynamic = "force-dynamic"

const CATEGORIES = [
  { value: "", label: "Semua" },
  { value: "Destinasi", label: "Destinasi" },
  { value: "Tips", label: "Tips" },
  { value: "Inspirasi", label: "Inspirasi" },
  { value: "Tutorial", label: "Tutorial" },
  { value: "Review", label: "Review" },
  { value: "Perawatan Mobil", label: "Perawatan Mobil" },
  { value: "Kendaraan", label: "Kendaraan" },
]

export default async function BlogPage(props: { searchParams?: Promise<{ category?: string }> }) {
  const searchParams = await props.searchParams
  const activeCategory = searchParams?.category || ""
  const posts = await getPosts({ category: activeCategory || undefined })

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.08] via-accent/[0.03] to-background py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">Blog</span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold font-heading leading-tight">
            Blog{" "}<span className="bg-gradient-to-r from-primary via-[hsl(340_85%_55%)] to-accent bg-clip-text text-transparent">Roadtrip</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">Tips, panduan, dan cerita seru seputar roadtrip di Indonesia.</p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.value
              const href = cat.value ? `/blog?category=${encodeURIComponent(cat.value)}` : "/blog"
              return (
                <Link
                  key={cat.value}
                  href={href}
                  className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </Link>
              )
            })}
          </div>

          {posts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">Belum ada blog</p>
              {activeCategory && (
                <Link href="/blog" className="mt-2 inline-flex text-sm text-primary hover:underline">
                  Lihat semua blog
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`}
                  className="group rounded-2xl border border-border/50 bg-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                    <BlogImage src={post.image_url} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
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
          )}
        </div>
      </section>
    </>
  )
}

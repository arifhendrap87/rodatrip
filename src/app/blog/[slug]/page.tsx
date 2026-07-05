import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SITE_NAME, SITE_URL } from "@/lib/constants"
import { getPosts, getPostBySlug } from "@/lib/services/blog"

function isHtmlContent(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str)
}

export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  const seoTitle = (post as any).seo_title || post.title
  const metaDesc = (post as any).meta_description || post.excerpt
  return {
    title: `${seoTitle} — Blog — ${SITE_NAME}`,
    description: metaDesc,
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: seoTitle,
      description: metaDesc,
      type: "article",
      publishedTime: post.published_at,
      authors: [post.author],
      url: `${SITE_URL}/blog/${slug}`,
      locale: "id_ID",
      images: post.image_url
        ? [{ url: post.image_url, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: metaDesc,
      images: post.image_url ? [post.image_url] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const allPosts = await getPosts()
  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 3)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.image_url,
    datePublished: post.published_at,
    dateModified: (post as any).updated_at || post.published_at,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: SITE_NAME },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          Kembali ke Blog
        </Link>

        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">{post.category}</span>
          <span>{post.read_time}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading leading-tight">{post.title}</h1>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span>Oleh {post.author}</span><span>•</span>
          <span>{new Date(post.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>

        <div className="mt-8 aspect-[16/9] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
          {post.image_url ? (
            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-30">🚗</span>
            </div>
          )}
        </div>

        <div className="mt-10 prose prose-gray max-w-none">
          {isHtmlContent(post.content) ? (
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            post.content.split("\n").map((line, i) => {
              if (line.startsWith("## ")) return <h2 key={i} className="text-xl font-bold font-heading mt-8 mb-3">{line.replace("## ", "")}</h2>
              if (line.startsWith("- **")) {
                const match = line.match(/- \*\*(.+?)\*\*[：:] (.+)/)
                if (match) return <div key={i} className="mb-4"><h3 className="text-lg font-bold font-heading">{match[1]}</h3><p className="text-muted-foreground">{match[2]}</p></div>
              }
              if (line.startsWith("- ")) return <li key={i} className="text-muted-foreground ml-4 list-disc">{line.replace("- ", "")}</li>
              if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold mt-4">{line.replace(/\*\*/g, "")}</p>
              if (line.trim() === "") return null
              return <p key={i} className="text-muted-foreground leading-relaxed mb-3">{line}</p>
            })
          )}
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {post.tags?.map((tag: string) => (
            <span key={tag} className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">#{tag}</span>
          ))}
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-border/30 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold font-heading mb-8">Artikel Terkait</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`}
                  className="group rounded-2xl border border-border/50 bg-white p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{p.category}</span>
                    <span>{p.read_time}</span>
                  </div>
                  <h3 className="font-bold font-heading group-hover:text-primary transition-colors">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
    </>
  )
}

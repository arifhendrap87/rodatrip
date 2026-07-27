"use client"

import Link from "next/link"
import type { BlogPostData } from "@/lib/services/blog"
import { BlogImage } from "@/components/ui/BlogImage"

interface BlogSectionProps {
  posts: BlogPostData[]
}

export function BlogSection({ posts }: BlogSectionProps) {
  if (posts.length === 0) return null

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-primary/[0.03]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary shadow-sm mb-4">
            📖 Blog Roadtrip
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
            Blog Roadtrip
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tips, panduan, dan inspirasi perjalanan roadtrip seru di Indonesia.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-2xl border border-border/50 bg-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <BlogImage src={post.image_url} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-foreground shadow-sm">
                    {post.category}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold font-heading leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                      {post.author?.charAt(0) || "R"}
                    </div>
                    <span className="truncate max-w-[100px]">
                      {post.author || "RodaTrip"}
                    </span>
                  </div>
                  <span>{post.read_time}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {posts.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
            >
              Lihat Semua Artikel
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

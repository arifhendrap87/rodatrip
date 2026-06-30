"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api/client"
import type { BlogPostData } from "@/lib/services/blog"

const CARD_COLORS = [
  "bg-[#D95D39]",  // burnt orange
  "bg-[#2C4A3E]",  // forest
  "bg-[#1E232A]",  // asphalt
]

export function BlogSection() {
  const [posts, setPosts] = useState<BlogPostData[]>([])

  useEffect(() => {
    api.blog.list({ limit: "3" })
      .then((res: any) => setPosts(res?.data || []))
      .catch(() => setPosts([]))
  }, [])

  if (posts.length === 0) return null

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2
          className="text-4xl sm:text-5xl font-black text-center mb-12"
          style={{ fontFamily: "Montserrat, sans-serif", color: "#1E232A" }}
        >
          Cerita Dari Jalanan
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => {
            const bgColor = CARD_COLORS[i % CARD_COLORS.length]
            const textColor = i === 2 ? "text-white" : "text-[#1E232A]"
            const btnBorderColor = i === 2 ? "border-white/40" : "border-[#1E232A]/20"
            const btnTextColor = i === 2 ? "text-white" : "text-[#1E232A]"

            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={`${bgColor} rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group`}
              >
                {post.image_url ? (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
                    <span className="text-5xl opacity-30">🚗</span>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  <h3 className={`text-lg font-bold leading-snug ${textColor}`}>
                    {post.title}
                  </h3>

                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold text-white">
                      {post.author?.charAt(0) || "R"}
                    </div>
                    <span className={`text-sm ${textColor} opacity-80`}>{post.author || "RodaTrip"}</span>
                  </div>

                  <div className="mt-auto pt-4">
                    <div className={`w-full text-center py-3 rounded-xl border ${btnBorderColor} ${btnTextColor} text-sm font-semibold transition-colors group-hover:bg-white/10`}>
                      Baca Artikel
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

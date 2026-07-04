"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowLeft, Copy, Check, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  image_url: string
  category: string
  author: string
  read_time: string
  tags: string[]
  is_published: boolean
  published_at: string
}

function renderContent(html: string): string {
  if (!html) return ""
  return html
    .replace(/<\/?[^>]+(>|$)/g, (match) => {
      if (match.startsWith("</")) return "\n"
      if (match.startsWith("<h2") || match.startsWith("<h3")) return "\n\n"
      if (match.startsWith("<li>")) return "• "
      if (match.startsWith("<p>")) return ""
      if (match.startsWith("<strong>")) return ""
      if (match.startsWith("</strong>")) return ""
      if (match.startsWith("<ul>") || match.startsWith("</ul>")) return "\n"
      return ""
    })
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export default function BlogPreviewPage() {
  const params = useParams()
  const slug = params.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [fbCopied, setFbCopied] = useState(false)

  function generateFbText(): string {
    if (!post) return ""
    const lines: string[] = []
    lines.push(`📖 BLOG: ${post.title}`)
    lines.push("")

    if (post.excerpt) {
      lines.push(post.excerpt.replace(/<[^>]+>/g, "").slice(0, 300))
      lines.push("")
    } else if (post.content) {
      const clean = post.content.replace(/<[^>]+>/g, "").trim().slice(0, 300)
      lines.push(clean + "...")
      lines.push("")
    }

    lines.push(`📂 ${post.category}  •  ✍️ ${post.author}  •  ⏱️ ${post.read_time}`)
    lines.push("")
    lines.push(`🔗 Baca selengkapnya: https://gaskuy-roadtrip.vercel.app/blog/${post.slug}`)
    lines.push("")
    lines.push("#RodaTrip #Blog #Roadtrip")

    return lines.join("\n")
  }

  function handleFbCopy() {
    navigator.clipboard.writeText(generateFbText())
    setFbCopied(true)
    setTimeout(() => setFbCopied(false), 2000)
    toast.success("Teks Facebook tersalin!")
  }

  useEffect(() => {
    fetch(`/api/admin/blog/${slug}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.id) setPost(json.data)
        else setError(json?.error?.message || "Blog tidak ditemukan")
      })
      .catch(() => setError("Gagal memuat blog"))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D95D39]" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] gap-4">
        <p className="text-lg font-medium text-[#1E232A]">{error || "Blog tidak ditemukan"}</p>
        <Link href="/admin/blog" className="text-sm text-[#D95D39] hover:underline">← Kembali ke daftar blog</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Admin Top Bar */}
      <div className="sticky top-0 z-50 bg-[#2C4A3E] text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/admin/blog" className="flex items-center gap-2 text-sm text-white/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Admin
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <button onClick={handleFbCopy} className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white">
              {fbCopied ? <Check className="h-4 w-4 text-green-300" /> : <ExternalLink className="h-4 w-4" />}
              {fbCopied ? "Tersalin!" : "Copy FB"}
            </button>
            <span className={post.is_published ? "text-green-300" : "text-yellow-300"}>
              {post.is_published ? "Published" : "Draft"}
            </span>
          </div>
        </div>
      </div>

      {/* Blog Content Preview */}
      <article className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 text-sm text-[#6B7280] mb-4">
          <span className="inline-flex items-center rounded-full bg-[#D95D39]/10 px-3 py-1 text-xs font-medium text-[#D95D39]">{post.category}</span>
          <span>{post.read_time}</span>
          <span>•</span>
          <span>{post.author}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black leading-tight text-[#1E232A] mb-6" style={{ fontFamily: "Montserrat, sans-serif" }}>
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg text-[#6B7280] mb-8 leading-relaxed">{post.excerpt}</p>
        )}

        {/* Cover Image */}
        {post.image_url && (
          <div className="rounded-2xl overflow-hidden mb-10">
            <img src={post.image_url} alt={post.title} className="w-full object-cover max-h-[400px]" />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none text-[#1E232A]">
          {renderContent(post.content).split("\n").map((line, i) => {
            if (line.startsWith("• ")) {
              return <li key={i} className="text-[#1E232A] ml-4">{line.slice(2)}</li>
            }
            if (line.startsWith("## ")) {
              return <h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-[#1E232A]">{line.slice(3)}</h2>
            }
            if (line.trim() === "") return null
            return <p key={i} className="mb-4 leading-relaxed">{line}</p>
          })}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[#E5E0D8]">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center rounded-full bg-[#F0EDE8] px-3 py-1 text-xs text-[#6B7280]">#{tag}</span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}

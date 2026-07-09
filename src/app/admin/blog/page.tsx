"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, ExternalLink, FileText } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import { toast } from "sonner"

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  is_published: boolean
  read_time: string
  published_at: string | null
  created_at: string
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)

  async function fetchPosts() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: "50" })
      if (debouncedSearch) params.set("search", debouncedSearch)

      const res = await fetch(`/api/admin/blog?${params}`)
      if (!res.ok) throw new Error(res.statusText)
      const json = await res.json()
      setPosts(json.data?.posts || [])
    } catch {
      toast.error("Gagal memuat blog")
      setPosts([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Hapus "${title}"?`)) return
    try {
      const res = await fetch(`/api/admin/blog/${slug}`, { method: "DELETE" })
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.slug !== slug))
        toast.success("Blog dihapus")
      } else {
        throw new Error(res.statusText)
      }
    } catch {
      toast.error("Gagal menghapus blog")
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Blog</h1>
          <p className="text-muted-foreground">Kelola artikel blog ({posts.length} total)</p>
        </div>
        <Link href="/admin/blog/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Tulis Blog Baru</Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari blog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Memuat blog...</div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <FileText className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-lg font-medium text-muted-foreground">Belum ada blog</p>
            <Link href="/admin/blog/new">
              <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Tulis Blog Baru</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {posts.map((post) => (
                <div key={post.slug} className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{post.title}</h3>
                      <Badge variant={post.is_published ? "default" : "secondary"}>
                        {post.is_published ? "Published" : "Draft"}
                      </Badge>
                      <span className="text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">{post.category}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {post.excerpt || "Tidak ada excerpt"}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{post.author}</span>
                      <span>•</span>
                      <span>{post.read_time}</span>
                      <span>•</span>
                      <span>{post.published_at ? new Date(post.published_at).toLocaleDateString("id-ID") : "Belum dipublish"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link href={`/admin/blog/preview/${post.slug}`} target="_blank"
                      className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
                      <Eye className="h-4 w-4" />
                    </Link>
                    {post.is_published && (
                      <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <Link href={`/admin/blog/${post.slug}/edit`}
                      className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <Button variant="ghost" size="icon" className="text-destructive h-8 w-8"
                      onClick={() => handleDelete(post.slug, post.title)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

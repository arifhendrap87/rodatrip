"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, ExternalLink, FileText, ChevronDown, ImageIcon, Camera, Loader2 } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import { toast } from "sonner"
import { ImagePicker } from "@/components/admin/ImagePicker"

interface BlogPost {
  id: string
  slug: string
  title: string
  content?: string
  excerpt: string
  category: string
  author: string
  is_published: boolean
  read_time: string
  image_url?: string
  tags?: string[]
  seo_title?: string
  meta_description?: string
  published_at: string | null
  created_at: string
}

function blogScore(post: BlogPost): number {
  const checks = [
    !!post.title,
    !!post.content,
    !!post.image_url,
    !!post.seo_title,
    !!post.meta_description,
    (post.tags || []).length > 0,
    !!post.category,
    !!post.is_published,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

function scoreColor(score: number): string {
  if (score >= 80) return "bg-green-500"
  if (score >= 50) return "bg-yellow-500"
  return "bg-red-500"
}

function scoreLabel(score: number): string {
  if (score >= 80) return "✅"
  if (score >= 50) return "⚠️"
  return "❌"
}

const CATEGORIES_FILTER = [
  { value: "", label: "Semua Kategori" },
  { value: "Tips", label: "Tips" },
  { value: "Inspirasi", label: "Inspirasi" },
  { value: "Destinasi", label: "Destinasi" },
  { value: "Tutorial", label: "Tutorial" },
  { value: "Review", label: "Review" },
  { value: "Perawatan Mobil", label: "Perawatan Mobil" },
  { value: "Kendaraan", label: "Kendaraan" },
]

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
]

const SORT_OPTIONS = [
  { value: "terbaru", label: "Terbaru" },
  { value: "judul", label: "Judul A-Z" },
  { value: "judul_desc", label: "Judul Z-A" },
]

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [status, setStatus] = useState("")
  const [sort, setSort] = useState("terbaru")
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set())
  const [batchLoading, setBatchLoading] = useState(false)
  const [pickerSlug, setPickerSlug] = useState<string | null>(null)
  const [updatingImage, setUpdatingImage] = useState<Set<string>>(new Set())
  const debouncedSearch = useDebounce(search, 300)

  function buildParams(pageOffset = 0) {
    const params = new URLSearchParams({ limit: "20", offset: String(pageOffset) })
    if (debouncedSearch) params.set("search", debouncedSearch)
    if (category) params.set("category", category)
    if (status) params.set("status", status)
    params.set("sort", sort)
    return params
  }

  async function fetchPosts(pageOffset = 0) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/blog?${buildParams(pageOffset)}`)
      if (!res.ok) throw new Error(res.statusText)
      const json = await res.json()
      const data = json.data
      if (pageOffset === 0) {
        setPosts(data?.posts || [])
      } else {
        setPosts((prev) => [...prev, ...(data?.posts || [])])
      }
      setHasMore(data?.pagination?.hasMore || false)
      setTotal(data?.pagination?.total || 0)
      setOffset(pageOffset)
    } catch {
      toast.error("Gagal memuat blog")
      if (pageOffset === 0) setPosts([])
    }
    setLoading(false)
  }

  function handleFilterChange() {
    setOffset(0)
    fetchPosts(0)
  }

  useEffect(() => {
    handleFilterChange()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, category, status, sort])

  // Selection
  const allSelected = posts.length > 0 && selectedSlugs.size === posts.length

  function toggleSelect(slug: string) {
    setSelectedSlugs((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedSlugs(new Set())
    } else {
      setSelectedSlugs(new Set(posts.map((p) => p.slug)))
    }
  }

  async function handleBatch(action: "publish" | "unpublish" | "delete") {
    if (selectedSlugs.size === 0) return
    if (action === "delete" && !confirm(`Hapus ${selectedSlugs.size} blog?`)) return

    setBatchLoading(true)
    try {
      await fetch("/api/admin/blog/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, slugs: [...selectedSlugs] }),
      })
      setSelectedSlugs(new Set())
      fetchPosts(offset)
      const label = action === "delete" ? "dihapus" : action === "publish" ? "dipublikasi" : "diunpublikasi"
      toast.success(`${selectedSlugs.size} blog ${label}`)
    } catch {
      toast.error("Gagal memproses")
    }
    setBatchLoading(false)
  }

  async function handleSinglePublish(slug: string, publish: boolean) {
    await fetch(`/api/admin/blog/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: publish }),
    })
    fetchPosts(offset)
    toast.success(publish ? "Dipublikasi" : "Diunpublikasi")
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
        <CardContent className="p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari blog..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground">
            {CATEGORIES_FILTER.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground">
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground">
            {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <span className="text-xs text-muted-foreground self-center hidden sm:inline">{total} total</span>
        </CardContent>
      </Card>

      {/* Batch action bar */}
      {selectedSlugs.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 mb-4 rounded-lg border border-primary/20 bg-primary/5">
          <span className="text-sm font-medium">{selectedSlugs.size} terpilih</span>
          <Button size="sm" variant="default" onClick={() => handleBatch("publish")} disabled={batchLoading}>Publish</Button>
          <Button size="sm" variant="secondary" onClick={() => handleBatch("unpublish")} disabled={batchLoading}>Unpublish</Button>
          <Button size="sm" variant="destructive" onClick={() => handleBatch("delete")} disabled={batchLoading}>Hapus</Button>
        </div>
      )}

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
              {posts.length > 0 && (
                <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 text-xs text-muted-foreground">
                  <input type="checkbox" checked={allSelected}
                    onChange={toggleSelectAll}
                    className="shrink-0 rounded border-gray-300" />
                  <span>{allSelected ? `${posts.length} terpilih` : "Pilih semua"}</span>
                </div>
              )}
              {posts.map((post) => (
                <div key={post.slug} className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors">
                  <input type="checkbox" checked={selectedSlugs.has(post.slug)}
                    onChange={() => toggleSelect(post.slug)}
                    className="mt-1 shrink-0 rounded border-gray-300" />
                  <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-muted border group mt-0.5">
                    {post.image_url ? (
                      <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setPickerSlug(post.slug)}
                      className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center"
                    >
                      {updatingImage.has(post.slug) ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <Camera className={`h-4 w-4 text-white transition-opacity ${post.image_url ? 'opacity-0 group-hover:opacity-100' : 'opacity-60'}`} />
                      )}
                    </button>
                    {post.image_url && (
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation()
                          setUpdatingImage(prev => new Set(prev).add(post.slug))
                          try {
                            await fetch(`/api/admin/blog/${post.slug}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ image_url: '' }),
                            })
                            setPosts(prev => prev.map(p => p.slug === post.slug ? { ...p, image_url: '' } : p))
                            toast.success("Gambar dihapus")
                          } catch {
                            toast.error("Gagal menghapus gambar")
                          }
                          setUpdatingImage(prev => { const n = new Set(prev); n.delete(post.slug); return n })
                        }}
                        className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500/80 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{post.title || "(tanpa judul)"}</h3>
                      <Badge variant={post.is_published ? "default" : "secondary"} className="shrink-0">
                        {post.is_published ? "Published" : "Draft"}
                      </Badge>
                      <button onClick={() => handleSinglePublish(post.slug, !post.is_published)}
                        className="text-xs text-muted-foreground hover:text-primary shrink-0">
                        {post.is_published ? "Unpublish" : "Publish"}
                      </button>
                      <span className="text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">{post.category}</span>
                    </div>

                    {/* Score */}
                    {(() => {
                      const score = blogScore(post)
                      return (
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-xs font-medium shrink-0">{scoreLabel(score)} {score}%</span>
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-[120px]">
                            <div className={`h-full rounded-full ${scoreColor(score)}`} style={{ width: `${score}%` }} />
                          </div>
                        </div>
                      )
                    })()}

                    {/* Checklist */}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                      <span className={`text-[11px] ${post.title ? "text-green-600" : "text-red-400"}`}>{post.title ? "✅" : "❌"} Judul</span>
                      <span className={`text-[11px] ${post.content ? "text-green-600" : "text-red-400"}`}>{post.content ? "✅" : "❌"} Konten</span>
                      <span className={`text-[11px] ${post.image_url ? "text-green-600" : "text-red-400"}`}>{post.image_url ? "✅" : "❌"} Gambar</span>
                      <span className={`text-[11px] ${post.seo_title ? "text-green-600" : "text-red-400"}`}>{post.seo_title ? "✅" : "❌"} SEO</span>
                      <span className={`text-[11px] ${post.meta_description ? "text-green-600" : "text-red-400"}`}>{post.meta_description ? "✅" : "❌"} Meta Desc</span>
                      <span className={`text-[11px] ${(post.tags || []).length > 0 ? "text-green-600" : "text-red-400"}`}>{(post.tags || []).length > 0 ? "✅" : "❌"} Tags</span>
                      <span className={`text-[11px] ${post.category ? "text-green-600" : "text-red-400"}`}>{post.category ? "✅" : "❌"} Kategori</span>
                      <span className={`text-[11px] ${post.is_published ? "text-green-600" : "text-red-400"}`}>{post.is_published ? "✅" : "❌"} Publish</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{post.author}</span>
                      <span>•</span>
                      <span>{post.read_time}</span>
                      <span>•</span>
                      <span>{post.published_at ? new Date(post.published_at).toLocaleDateString("id-ID") : "Belum dipublish"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 pt-1">
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
                      onClick={async () => {
                        if (!confirm(`Hapus "${post.title}"?`)) return
                        await fetch("/api/admin/blog/batch", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "delete", slugs: [post.slug] }),
                        })
                        fetchPosts(offset)
                        toast.success("Blog dihapus")
                      }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {!loading && hasMore && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => fetchPosts(offset + 20)} className="gap-2">
            Muat Lebih Banyak ({total - (offset + 20) > 0 ? total - (offset + 20) : 0} tersisa)
          </Button>
        </div>
      )}

      <ImagePicker
        open={pickerSlug !== null}
        onClose={() => setPickerSlug(null)}
        onSelect={async (urls) => {
          const url = urls[0]
          if (!url || !pickerSlug) return
          setUpdatingImage(prev => new Set(prev).add(pickerSlug))
          try {
            await fetch(`/api/admin/blog/${pickerSlug}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image_url: url }),
            })
            setPosts(prev => prev.map(p => p.slug === pickerSlug ? { ...p, image_url: url } : p))
            toast.success("Gambar diperbarui")
          } catch {
            toast.error("Gagal menyimpan gambar")
          }
          setUpdatingImage(prev => { const n = new Set(prev); n.delete(pickerSlug!); return n })
          setPickerSlug(null)
        }}
      />
    </div>
  )
}

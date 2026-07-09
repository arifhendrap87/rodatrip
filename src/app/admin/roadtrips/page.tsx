"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, ExternalLink, EyeOff, FileDown } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import { toast } from "sonner"

const SORT_OPTIONS = [
  { value: "terbaru", label: "Terbaru" },
  { value: "judul", label: "Judul A-Z" },
]

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
]

function roadtripScore(rt: any): number {
  const checks = [
    !!rt.title,
    !!rt.coverImage,
    !!rt.itineraryDuration,
    (rt.stops || []).length > 0,
    !!rt.roadCondition,
    !!rt.isPublished,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

function scoreColor(s: number): string {
  if (s >= 80) return "bg-green-500"
  if (s >= 50) return "bg-yellow-500"
  return "bg-red-500"
}

function scoreLabel(s: number): string {
  if (s >= 80) return "✅"
  if (s >= 50) return "⚠️"
  return "❌"
}

export default function RoadtripsPage() {
  const router = useRouter()
  const [roadtrips, setRoadtrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [status, setStatus] = useState("")
  const [sort, setSort] = useState("terbaru")
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set())
  const [batchLoading, setBatchLoading] = useState(false)

  async function fetchRoadtrips(pageOffset = 0) {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: "20", offset: String(pageOffset) })
      if (debouncedSearch) params.set("search", debouncedSearch)
      if (status) params.set("status", status)
      if (sort !== "terbaru") params.set("sort", sort)

      const res = await fetch(`/api/admin/itineraries?${params}`)
      const json = await res.json()
      const data = json.data?.data || json.data || []

      let filtered = data
      if (status === "published") filtered = data.filter((r: any) => r.isPublished)
      else if (status === "draft") filtered = data.filter((r: any) => !r.isPublished)

      if (pageOffset === 0) {
        setRoadtrips(filtered)
      } else {
        setRoadtrips((prev) => [...prev, ...filtered])
      }
      setHasMore(json.data?.pagination?.hasMore || false)
      setTotal(json.data?.pagination?.total || 0)
      setOffset(pageOffset)
    } catch {
      if (pageOffset === 0) setRoadtrips([])
    }
    setLoading(false)
  }

  useEffect(() => {
    setOffset(0)
    setRoadtrips([])
    fetchRoadtrips(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, status, sort])

  // Selection
  const allSelected = roadtrips.length > 0 && selectedSlugs.size === roadtrips.length

  function toggleSelect(slug: string) {
    setSelectedSlugs((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  function toggleSelectAll() {
    if (allSelected) setSelectedSlugs(new Set())
    else setSelectedSlugs(new Set(roadtrips.map((r) => r.slug)))
  }

  async function handleBatch(action: "publish" | "unpublish" | "delete") {
    if (selectedSlugs.size === 0) return
    if (action === "delete" && !confirm(`Hapus ${selectedSlugs.size} roadtrip?`)) return
    setBatchLoading(true)
    try {
      await fetch("/api/admin/roadtrips/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, slugs: [...selectedSlugs] }),
      })
      setSelectedSlugs(new Set())
      fetchRoadtrips(offset)
      const label = action === "delete" ? "dihapus" : action === "publish" ? "dipublikasi" : "diunpublikasi"
      toast.success(`${selectedSlugs.size} roadtrip ${label}`)
    } catch { toast.error("Gagal") }
    setBatchLoading(false)
  }

  async function handleSinglePublish(slug: string, publish: boolean) {
    await fetch("/api/admin/itineraries", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, is_published: publish }),
    })
    fetchRoadtrips(offset)
    toast.success(publish ? "Dipublikasi" : "Diunpublikasi")
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Roadtrips</h1>
          <p className="text-muted-foreground">
            Manage curated road trip itineraries ({roadtrips.length} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/roadtrips/import">
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Import from JSON
            </Button>
          </Link>
          <Link href="/admin/roadtrips/new">
            <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Roadtrip
                </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cari roadtrip..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground">
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground">
              {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <span className="text-xs text-muted-foreground self-center hidden sm:inline">{total} total</span>
          </div>
        </CardContent>
      </Card>

      {selectedSlugs.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 mb-4 rounded-lg border border-primary/20 bg-primary/5">
          <span className="text-sm font-medium">{selectedSlugs.size} terpilih</span>
          <Button size="sm" variant="default" onClick={() => handleBatch("publish")} disabled={batchLoading}>Publish</Button>
          <Button size="sm" variant="secondary" onClick={() => handleBatch("unpublish")} disabled={batchLoading}>Unpublish</Button>
          <Button size="sm" variant="destructive" onClick={() => handleBatch("delete")} disabled={batchLoading}>Hapus</Button>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Memuat roadtrip...</div>
      ) : roadtrips.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-lg font-medium">Belum ada roadtrip</p>
            <p className="text-sm text-muted-foreground">
              {search ? "Coba ubah kata kunci" : "Buat roadtrip pertama untuk memulai"}
            </p>
            <Link href="/admin/roadtrips/new">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Roadtrip
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {roadtrips.length > 0 && (
                <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 text-xs text-muted-foreground">
                  <input type="checkbox" checked={allSelected}
                    onChange={toggleSelectAll}
                    className="shrink-0 rounded border-gray-300" />
                  <span>{allSelected ? `${roadtrips.length} terpilih` : "Pilih semua"}</span>
                </div>
              )}
              {roadtrips.map((rt) => (
                <div
                  key={rt.id}
                  className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/50"
                >
                  <input type="checkbox" checked={selectedSlugs.has(rt.slug)}
                    onChange={() => toggleSelect(rt.slug)}
                    className="shrink-0 rounded border-gray-300" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{rt.title}</h3>
                      {rt.isPublished ? (
                        <Badge variant="secondary" className="shrink-0 text-xs">Published</Badge>
                      ) : (
                        <Badge variant="outline" className="shrink-0 text-xs text-muted-foreground">
                          <EyeOff className="mr-1 h-3 w-3" />
                          Draft
                        </Badge>
                      )}
                      <button onClick={() => handleSinglePublish(rt.slug, !rt.isPublished)}
                        className="text-xs text-muted-foreground hover:text-primary shrink-0">
                        {rt.isPublished ? "Unpublish" : "Publish"}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{rt.itineraryDuration || "-"}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{rt.stops?.length || 0} stops</span>
                    </div>

                    {/* Score */}
                    {(() => {
                      const score = roadtripScore(rt)
                      return (
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-xs font-medium shrink-0">{scoreLabel(score)} {score}%</span>
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-[120px]">
                            <div className={`h-full rounded-full ${scoreColor(score)}`} style={{ width: `${score}%` }} />
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {rt.title ? "✅" : "❌"} Judul · {rt.coverImage ? "✅" : "❌"} Cover · {rt.itineraryDuration ? "✅" : "❌"} Durasi · {(rt.stops || []).length > 0 ? "✅" : "❌"} Stops · {rt.roadCondition ? "✅" : "❌"} Kondisi · {rt.isPublished ? "✅" : "❌"} Publish
                          </span>
                        </div>
                      )
                    })()}
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/roadtrip/${rt.slug}`}
                      target="_blank"
                      className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/roadtrips/${rt.slug}/edit`}
                      className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={async () => {
                        if (!confirm(`Hapus "${rt.title}"?`)) return
                        await fetch("/api/admin/roadtrips/batch", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "delete", slugs: [rt.slug] }),
                        })
                        fetchRoadtrips(offset)
                        toast.success("Roadtrip dihapus")
                      }}
                    >
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
          <Button variant="outline" onClick={() => fetchRoadtrips(offset + 20)} className="gap-2">
            Muat Lebih Banyak ({total - (offset + 20) > 0 ? total - (offset + 20) : 0} tersisa)
          </Button>
        </div>
      )}
    </div>
  )
}
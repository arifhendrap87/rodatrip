/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { api } from "@/lib/api/client"
import { parseLocation } from "@/lib/utils/location"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, EyeOff, ExternalLink, Sparkles, ImageIcon, Camera, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDebounce } from "@/hooks/useDebounce"
import { toast } from "sonner"
import { ImagePicker } from "@/components/admin/ImagePicker"

function spotScore(spot: any): number {
  const parsed = parseLocation(spot.location)
  const checks = [
    !!spot.name, !!spot.description, !!spot.image_url,
    !!spot.category, !!spot.province, parsed !== null, (spot.rating || 0) > 0,
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

const CATEGORIES = [
  { value: "alam", label: "Alam", color: "emerald" },
  { value: "kuliner", label: "Kuliner", color: "orange" },
  { value: "budaya", label: "Budaya", color: "purple" },
  { value: "foto", label: "Spot Foto", color: "pink" },
  { value: "petualangan", label: "Petualangan", color: "blue" },
  { value: "sejarah", label: "Sejarah", color: "amber" },
  { value: "hotel", label: "Hotel", color: "indigo" },
  { value: "restaurant", label: "Restoran", color: "red" },
]

const SORT_OPTIONS = [
  { value: "terbaru", label: "Terbaru" },
  { value: "nama", label: "Nama A-Z" },
  { value: "rating", label: "Rating" },
  { value: "dilihat", label: "Paling Dilihat" },
]

export default function SpotsPage() {
  const [spots, setSpots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [provinceFilter, setProvinceFilter] = useState("all")
  const [provinceList, setProvinceList] = useState<{ code: string; name: string }[]>([])
  const [loadingProv, setLoadingProv] = useState(true)
  const [roadtripFilter, setRoadtripFilter] = useState("all")
  const [roadtripList, setRoadtripList] = useState<{ id: string; title: string }[]>([])
  const [loadingRoadtrips, setLoadingRoadtrips] = useState(true)
  const [sort, setSort] = useState("terbaru")
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const initialFetchDone = useRef(false)
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set())
  const [batchLoading, setBatchLoading] = useState(false)
  const [pickerSpot, setPickerSpot] = useState<string | null>(null)
  const [updatingImage, setUpdatingImage] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch("/api/wilayah/provinces")
      .then((r) => r.json())
      .then((json) => { setProvinceList(json.data || []); setLoadingProv(false) })
      .catch(() => setLoadingProv(false))

    fetch("/api/admin/roadtrips-mini")
      .then((r) => r.json())
      .then((json) => { setRoadtripList(json.data || []); setLoadingRoadtrips(false) })
      .catch(() => setLoadingRoadtrips(false))
  }, [])

  useEffect(() => {
    setOffset(0)
    setSpots([])
    fetchSpots(0)
  }, [debouncedSearch, categoryFilter, provinceFilter, roadtripFilter, sort])

  async function fetchSpots(pageOffset = 0) {
    setLoading(true)
    const params: Record<string, string> = { limit: "20", offset: String(pageOffset) }
    if (debouncedSearch) params.search = debouncedSearch
    if (categoryFilter !== "all") params.category = categoryFilter
    if (provinceFilter !== "all") params.province = provinceFilter
    if (roadtripFilter !== "all") params.roadtrip = roadtripFilter
    if (sort !== "terbaru") params.sort = sort

    const res = await api.spots.list(params)
    const data = res.data as any[]
    const pagination = (res as any).pagination

    if (pageOffset === 0) {
      setSpots(data || [])
    } else {
      setSpots((prev) => [...prev, ...(data || [])])
    }
    setTotal(pagination?.total || data?.length || 0)
    setHasMore((pagination?.offset || 0) + (pagination?.limit || 20) < (pagination?.total || 0))
    setOffset(pageOffset)
    setLoading(false)
  }

  // Selection
  const allSelected = spots.length > 0 && selectedSlugs.size === spots.length

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
    else setSelectedSlugs(new Set(spots.map((s) => s.slug)))
  }

  async function handleBatch(action: "delete" | "publish" | "unpublish") {
    if (selectedSlugs.size === 0) return
    if (action === "delete" && !confirm(`Hapus ${selectedSlugs.size} spot?`)) return
    setBatchLoading(true)
    try {
      await fetch("/api/admin/spots/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, slugs: [...selectedSlugs] }),
      })
      setSelectedSlugs(new Set())
      fetchSpots(offset)
      const label = action === "delete" ? "dihapus" : action === "publish" ? "dipublikasi" : "diunpublikasi"
      toast.success(`${selectedSlugs.size} spot ${label}`)
    } catch { toast.error("Gagal") }
    setBatchLoading(false)
  }

  async function handleDelete(slug: string, name: string) {
    if (!confirm(`Hapus "${name}"?`)) return
    await api.spots.delete(slug)
    fetchSpots()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Spots</h1>
          <p className="text-muted-foreground">
            Kelola panduan destinasi ({spots.length} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/spots/scrape">
            <Button variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              Scrape dari Wikipedia
            </Button>
          </Link>
          <Link href="/admin/spots/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Spot
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari spot..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={provinceFilter} onValueChange={(v) => v && setProvinceFilter(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Provinsi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Provinsi</SelectItem>
                {loadingProv ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  provinceList.map((p) => (
                    <SelectItem key={p.code} value={p.name}>{p.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Select value={roadtripFilter} onValueChange={(v) => v && setRoadtripFilter(v)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Roadtrip">
                  {roadtripFilter !== "all"
                    ? roadtripList.find(r => r.id === roadtripFilter)?.title
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Roadtrip</SelectItem>
                {loadingRoadtrips ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : roadtripList.length === 0 ? (
                  <SelectItem value="empty" disabled>Tidak ada roadtrip</SelectItem>
                ) : (
                  roadtripList.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground hidden sm:inline">Urut:</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground">
                {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <span className="text-xs text-muted-foreground hidden sm:inline">{total} total</span>
            </div>
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
        <div className="py-12 text-center text-muted-foreground">
          Memuat spot...
        </div>
      ) : spots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-lg font-medium">Tidak ada spot</p>
            <p className="text-sm text-muted-foreground">
              {search || categoryFilter !== "all"
                ? "Try adjusting your filters"
                : "Buat spot pertama untuk memulai"}
            </p>
            <Link href="/admin/spots/new">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
Tambah Spot
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {spots.length > 0 && (
                <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 text-xs text-muted-foreground">
                  <input type="checkbox" checked={allSelected}
                    onChange={toggleSelectAll}
                    className="shrink-0 rounded border-gray-300" />
                  <span>{allSelected ? `${spots.length} terpilih` : "Pilih semua"}</span>
                </div>
              )}
              {spots.map((spot) => {
                const cat = CATEGORIES.find((c) => c.value === spot.category)
                return (
                  <div
                    key={spot.id}
                    className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/50"
                  >
                    <input type="checkbox" checked={selectedSlugs.has(spot.slug)}
                      onChange={() => toggleSelect(spot.slug)}
                      className="shrink-0 rounded border-gray-300" />
                    <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-muted border group">
                      {spot.image_url ? (
                        <img src={spot.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setPickerSpot(spot.slug)}
                        className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center"
                      >
                        {updatingImage.has(spot.slug) ? (
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                        ) : (
                          <Camera className={`h-4 w-4 text-white transition-opacity ${spot.image_url ? 'opacity-0 group-hover:opacity-100' : 'opacity-60'}`} />
                        )}
                      </button>
                      {spot.image_url && (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation()
                            setUpdatingImage(prev => new Set(prev).add(spot.slug))
                            try {
                              await api.spots.update(spot.slug, { imageUrl: '' })
                              setSpots(prev => prev.map(s => s.slug === spot.slug ? { ...s, image_url: '' } : s))
                              toast.success("Gambar dihapus")
                            } catch {
                              toast.error("Gagal menghapus gambar")
                            }
                            setUpdatingImage(prev => { const n = new Set(prev); n.delete(spot.slug); return n })
                          }}
                          className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500/80 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{spot.name}</h3>
                        {spot.is_published === false ? (
                          <Badge variant="outline" className="shrink-0 text-xs text-muted-foreground">
                            <EyeOff className="mr-1 h-3 w-3" />
                            Draft
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="shrink-0 text-xs">Published</Badge>
                        )}
                        {spot.is_featured && (
                          <Badge variant="secondary" className="shrink-0">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {cat && (
                          <Badge variant="outline" className="text-xs">
                            {cat.label}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {spot.province}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ⭐ {spot.rating}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          👁 {spot.view_count || 0}
                        </span>
                      </div>

                      {/* Score */}
                      {(() => {
                        const score = spotScore(spot)
                        return (
                          <div className="mt-2 flex items-center gap-3">
                            <span className="text-xs font-medium shrink-0">{scoreLabel(score)} {score}%</span>
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-[120px]">
                              <div className={`h-full rounded-full ${scoreColor(score)}`} style={{ width: `${score}%` }} />
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              {spot.name ? "✅" : "❌"} Nama · {spot.description ? "✅" : "❌"} Deskripsi · {spot.image_url ? "✅" : "❌"} Gambar · {spot.category ? "✅" : "❌"} Kategori · {spot.province ? "✅" : "❌"} Provinsi · {parseLocation(spot.location) ? "✅" : "❌"} Koordinat · {(spot.rating || 0) > 0 ? "✅" : "❌"} Rating
                            </span>
                          </div>
                        )
                      })()}
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/spots/preview/${spot.slug}`}
                        target="_blank"
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={async () => {
                          const publish = spot.is_published === false
                          try {
                            await api.spots.update(spot.slug, { isPublished: publish })
                            setSpots(prev => prev.map(s => s.slug === spot.slug ? { ...s, is_published: publish } : s))
                            toast.success(publish ? "Dipublikasi" : "Diunpublikasi")
                          } catch { toast.error("Gagal") }
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted text-xs font-medium"
                        title={spot.is_published === false ? "Publish" : "Unpublish"}
                      >
                        {spot.is_published === false ? "📝" : "🔴"}
                      </button>
                      {spot.is_published !== false && (
                        <Link
                          href={`/spot-istimewa/${spot.slug}`}
                          target="_blank"
                          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                      <Link
                        href={`/admin/spots/${spot.slug}/edit`}
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(spot.slug, spot.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
      {!loading && hasMore && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => fetchSpots(offset + 20)} className="gap-2">
            Muat Lebih Banyak ({total - (offset + 20) > 0 ? total - (offset + 20) : 0} tersisa)
          </Button>
        </div>
      )}

      <ImagePicker
        open={pickerSpot !== null}
        onClose={() => setPickerSpot(null)}
        onSelect={async (urls) => {
          const url = urls[0]
          if (!url || !pickerSpot) return
          setUpdatingImage(prev => new Set(prev).add(pickerSpot))
          try {
            await api.spots.update(pickerSpot, { imageUrl: url })
            setSpots(prev => prev.map(s => s.slug === pickerSpot ? { ...s, image_url: url } : s))
            toast.success("Gambar diperbarui")
          } catch {
            toast.error("Gagal menyimpan gambar")
          }
          setUpdatingImage(prev => { const n = new Set(prev); n.delete(pickerSpot!); return n })
          setPickerSpot(null)
        }}
      />
    </div>
  )
}

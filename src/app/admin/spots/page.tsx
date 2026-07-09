/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { api } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, ExternalLink, Sparkles } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDebounce } from "@/hooks/useDebounce"

const CATEGORIES = [
  { value: "alam", label: "Alam", color: "emerald" },
  { value: "kuliner", label: "Kuliner", color: "orange" },
  { value: "budaya", label: "Budaya", color: "purple" },
  { value: "foto", label: "Spot Foto", color: "pink" },
  { value: "petualangan", label: "Petualangan", color: "blue" },
  { value: "sejarah", label: "Sejarah", color: "amber" },
]

const PLATFORM_BADGES: Record<string, { label: string; className: string }> = {
  facebook: { label: "f", className: "bg-[#1877F2] text-white min-w-[18px]" },
  instagram: { label: "IG", className: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white min-w-[22px]" },
  tiktok: { label: "TT", className: "bg-black text-white min-w-[22px]" },
}

export default function SpotsPage() {
  const [spots, setSpots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [provinceFilter, setProvinceFilter] = useState("all")
  const [provinceList, setProvinceList] = useState<{ code: string; name: string }[]>([])
  const [loadingProv, setLoadingProv] = useState(true)
  const [contentStatus, setContentStatus] = useState<Record<string, Record<string, { tone: string; updatedAt: string }>>>({})
  const initialFetchDone = useRef(false)

  useEffect(() => {
    // Fetch provinces from API
    fetch("/api/wilayah/provinces")
      .then((r) => r.json())
      .then((json) => {
        setProvinceList(json.data || [])
        setLoadingProv(false)
      })
      .catch(() => setLoadingProv(false))
  }, [])

  useEffect(() => {
    fetchSpots()
  }, [debouncedSearch, categoryFilter, provinceFilter])

  async function fetchSpots() {
    setLoading(true)
    const params: Record<string, string> = {}
    if (debouncedSearch) params.search = debouncedSearch
    if (categoryFilter !== "all") params.category = categoryFilter
    if (provinceFilter !== "all") params.province = provinceFilter

    const res = await api.spots.list(params)
    setSpots(res.data as any[])
    setLoading(false)
  }

  useEffect(() => {
    fetchContentStatus()
  }, [])

  async function fetchContentStatus() {
    try {
      const res = await fetch("/api/admin/content-generator/status?content_type=spot")
      const json = await res.json()
      if (res.ok) setContentStatus(json.data.status || {})
    } catch {}
  }

  async function handleDelete(slug: string, name: string) {
    if (!confirm(`Hapus "${name}"?`)) return
    await api.spots.delete(slug)
    fetchSpots()
    fetchContentStatus()
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
          </div>
        </CardContent>
      </Card>

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
              {spots.map((spot) => {
                const cat = CATEGORIES.find((c) => c.value === spot.category)
                return (
                  <div
                    key={spot.id}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{spot.name}</h3>
                        {spot.is_featured && (
                          <Badge variant="secondary" className="shrink-0">
                            Featured
                          </Badge>
                        )}
                        <div className="flex items-center gap-0.5 shrink-0">
                          {["facebook", "instagram", "tiktok"].map((p) => {
                            const hasContent = !!contentStatus[spot.slug]?.[p]
                            const badge = PLATFORM_BADGES[p]
                            return (
                              <span
                                key={p}
                                className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-bold leading-none ${
                                  hasContent ? badge.className : "bg-muted text-muted-foreground/40"
                                }`}
                                title={`${p}: ${hasContent ? "Sudah ada" : "Kosong"}`}
                              >
                                {badge.label}
                                {hasContent && <span>●</span>}
                              </span>
                            )
                          })}
                        </div>
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
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/spot-istimewa/${spot.slug}`}
                        target="_blank"
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
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
    </div>
  )
}

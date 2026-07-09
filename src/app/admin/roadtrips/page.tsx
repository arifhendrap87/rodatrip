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

  useEffect(() => {
    fetchRoadtrips()
  }, [debouncedSearch])

  async function fetchRoadtrips() {
    setLoading(true)
    try {
      const res = await api.admin.itineraries.list()
      setRoadtrips(res.data as any[])
    } catch {
      setRoadtrips([])
    }
    setLoading(false)
  }

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Hapus "${title}"?`)) return
    await api.admin.itineraries.delete(slug)
    fetchRoadtrips()
  }

  const filtered = search
    ? roadtrips.filter((r) => r.title?.toLowerCase().includes(search.toLowerCase()))
    : roadtrips

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
              <Input
                placeholder="Cari roadtrip..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Memuat roadtrip...</div>
      ) : filtered.length === 0 ? (
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
              {filtered.map((rt) => (
                <div
                  key={rt.id}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
                >
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
                            {rt.coverImage ? "✅ Cover" : "❌ Cover"} · {rt.roadCondition ? "✅ Kondisi" : "❌ Kondisi"}
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
                      onClick={() => handleDelete(rt.slug, rt.title)}
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
    </div>
  )
}

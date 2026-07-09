"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ExternalLink, Eye } from "lucide-react"
import { toast } from "sonner"

interface CheckItem {
  label: string
  ok: boolean
}

interface ReadinessItem {
  slug: string
  title: string
  type: "blog" | "spot" | "roadtrip"
  score: number
  checks: CheckItem[]
  previewUrl?: string
  isPublished: boolean
}

const TABS = [
  { value: "all", label: "Semua" },
  { value: "blog", label: "Blog" },
  { value: "spot", label: "Spot" },
  { value: "roadtrip", label: "Roadtrip" },
]

function scoreColor(score: number): string {
  if (score >= 80) return "bg-green-500"
  if (score >= 50) return "bg-yellow-500"
  return "bg-red-500"
}

function statusBadge(score: number): { label: string; variant: "default" | "secondary" | "outline" | "destructive" } {
  if (score >= 80) return { label: "✅ Siap", variant: "default" }
  if (score >= 50) return { label: "⚠️ Kurang", variant: "secondary" }
  return { label: "❌ Belum", variant: "outline" }
}

const TYPE_LABELS: Record<string, string> = {
  blog: "Blog",
  spot: "Spot",
  roadtrip: "Roadtrip",
}

export default function ContentReadinessPage() {
  const [items, setItems] = useState<ReadinessItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("all")

  useEffect(() => {
    fetch("/api/admin/content-readiness")
      .then((r) => r.json())
      .then((json) => setItems(json.data || []))
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false))
  }, [])

  const filtered = tab === "all" ? items : items.filter((i) => i.type === tab)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading">📋 Kesiapan Konten</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Status kelengkapan blog, spot, dan roadtrip sebelum publikasi
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted rounded-lg p-0.5 w-fit">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === t.value ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
            }`}
          >
            {t.label}
            {t.value !== "all" && (
              <span className="ml-1.5 text-xs text-muted-foreground">
                ({items.filter((i) => i.type === t.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">Belum ada konten</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const status = statusBadge(item.score)
            return (
              <div
                key={`${item.type}-${item.slug}`}
                className="rounded-xl border border-border/50 bg-white p-4 transition-all hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                        {TYPE_LABELS[item.type]}
                      </Badge>
                      <Badge variant={status.variant} className="text-xs">
                        {status.label}
                      </Badge>
                      {!item.isPublished && item.type !== "spot" && (
                        <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300 bg-yellow-50">
                          Draft
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold font-heading truncate">{item.title || "(tanpa judul)"}</h3>

                    {/* Progress bar */}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${scoreColor(item.score)}`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground shrink-0">{item.score}%</span>
                    </div>

                    {/* Checklist */}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      {item.checks.map((c, i) => (
                        <span key={i} className={`text-xs ${c.ok ? "text-green-600" : "text-red-400"}`}>
                          {c.ok ? "✅" : "❌"} {c.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    {item.previewUrl && (
                      <Link href={item.previewUrl} target="_blank">
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                          <Eye className="h-3.5 w-3.5" />
                          Preview
                        </Button>
                      </Link>
                    )}
                    {(() => {
                      const base = item.type === "blog" ? "/admin/blog" : item.type === "spot" ? "/admin/spots" : "/admin/roadtrips"
                      const editPath = item.type === "blog" ? `${base}/${item.slug}/edit` : `${base}/${item.slug}/edit`
                      return (
                        <Link href={editPath}>
                          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                            Edit
                          </Button>
                        </Link>
                      )
                    })()}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

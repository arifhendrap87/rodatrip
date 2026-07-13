/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileText,
  Copy,
  Check,
  Trash2,
  Search,
  MessageCircle,
  Camera,
  Music2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layout,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

const PLATFORM_ICONS: Record<string, any> = {
  facebook: MessageCircle,
  instagram: Camera,
  tiktok: Music2,
}

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
}

const TONE_LABELS: Record<string, string> = {
  promo: "Promo",
  edukasi: "Edukasi",
  inspirasi: "Inspirasi",
  storytelling: "Storytelling",
}

interface Draft {
  id: string
  title: string
  platform: string
  tone: string
  content_type: string
  source_id: string
  source_title: string
  caption: string
  hashtags: string
  skrip_tiktok: string
  concept_type: string
  text_overlays: string[]
  image_prompts: string[]
  status: string
  scheduled_at: string | null
  created_at: string
  updated_at: string
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [conceptFilter, setConceptFilter] = useState("all")
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)
  const [copied, setCopied] = useState<string | null>(null)
  const limit = 20
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCaption, setEditCaption] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setOffset(0)
    fetchDrafts()
  }, [platformFilter, statusFilter, conceptFilter, search])

  async function fetchDrafts() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("limit", String(limit))
      params.set("offset", String(offset))
      if (platformFilter !== "all") params.set("platform", platformFilter)
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (conceptFilter !== "all") params.set("concept_type", conceptFilter)
      if (search) params.set("search", search)

      const res = await fetch(`/api/admin/content-generator/drafts?${params}`)
      const json = await res.json()
      if (res.ok) {
        setDrafts(json.data.drafts || [])
        setTotal(json.data.pagination?.total || 0)
      }
    } catch {
      toast.error("Gagal memuat draft")
    }
    setLoading(false)
  }

  function handleSearch() {
    setOffset(0)
    fetchDrafts()
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus draft ini?")) return
    try {
      const res = await fetch(`/api/admin/content-generator/drafts?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setDrafts((prev) => prev.filter((d) => d.id !== id))
        toast.success("Draft dihapus")
      }
    } catch {
      toast.error("Gagal menghapus draft")
    }
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
    toast.success("Tersalin!")
  }

  function startEdit(draft: Draft) {
    setEditingId(draft.id)
    setEditCaption(draft.caption)
  }

  async function saveEdit(draft: Draft) {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/content-generator/drafts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draft.id, caption: editCaption }),
      })
      if (res.ok) {
        setDrafts((prev) => prev.map((d) => d.id === draft.id ? { ...d, caption: editCaption } : d))
        setEditingId(null)
        toast.success("Draft diperbarui")
      }
    } catch {
      toast.error("Gagal menyimpan")
    }
    setSaving(false)
  }

  function getDisplayText(draft: Draft): string {
    if (draft.platform === "tiktok") return draft.skrip_tiktok || draft.caption
    let text = draft.caption
    if (draft.hashtags && draft.platform === "instagram") text += "\n\n" + draft.hashtags
    return text
  }

  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit) + 1

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Draft Konten
          </h1>
          <p className="text-muted-foreground">{total} draft tersimpan</p>
        </div>
        <Link href="/admin/content-generator">
          <Button variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            Buat Konten Baru
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari draft..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>
            <Select value={platformFilter} onValueChange={(v) => v && (setPlatformFilter(v), setOffset(0))}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Platform</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => v && (setStatusFilter(v), setOffset(0))}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={conceptFilter} onValueChange={(v) => v && (setConceptFilter(v), setOffset(0))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="caption">Caption</SelectItem>
                <SelectItem value="carousel">Carousel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Memuat draft...</div>
      ) : drafts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <FileText className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-lg font-medium text-muted-foreground">Belum ada draft</p>
            <p className="text-sm text-muted-foreground/60">Generate konten dan simpan sebagai draft</p>
            <Link href="/admin/content-generator">
              <Button variant="outline">Buat Konten Baru</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {drafts.map((draft) => {
              const isCarousel = draft.concept_type === "carousel"
              const PlatformIcon = isCarousel ? Layout : (PLATFORM_ICONS[draft.platform] || FileText)
              const displayText = getDisplayText(draft)
              const previewText = displayText.slice(0, 200) + (displayText.length > 200 ? "..." : "")
              const slideCount = draft.text_overlays?.length || 0

              return (
                <Card key={draft.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <PlatformIcon className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-medium truncate">{draft.title}</h3>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            draft.status === "published" ? "bg-green-100 text-green-700" :
                            draft.status === "archived" ? "bg-gray-100 text-gray-500" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {draft.status}
                          </span>
                          {isCarousel && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-purple-100 text-purple-700">
                              🎠 Carousel
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          {isCarousel ? (
                            <span>🎠 {slideCount} slide</span>
                          ) : (
                            <span>{PLATFORM_LABELS[draft.platform] || draft.platform}</span>
                          )}
                          <span className="capitalize">{draft.content_type}</span>
                          <span>{new Date(draft.updated_at).toLocaleDateString("id-ID")}</span>
                        </div>
                        {editingId === draft.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editCaption}
                              onChange={(e) => setEditCaption(e.target.value)}
                              className="min-h-[150px] text-sm font-mono"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => saveEdit(draft)} disabled={saving}>
                                Simpan
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                                Batal
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{previewText}</p>
                        )}
                      </div>
                      {editingId !== draft.id && (
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCopy(displayText, draft.id)}
                            title="Copy caption"
                          >
                            {copied === draft.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => startEdit(draft)}
                            title="Edit caption"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(draft.id)}
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - limit))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={offset + limit >= total}
                onClick={() => setOffset(offset + limit)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

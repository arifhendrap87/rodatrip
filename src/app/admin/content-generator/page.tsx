/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Sparkles,
  Copy,
  Check,
  Loader2,
  Save,
  FileText,
  MapPin,
  Route,
  MessageCircle,
  Camera,
  Music2,
  Info,
  Code,
  ChevronDown,
  ChevronRight,
  Search,
  Star,
  Layout,
  ImageIcon,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

const PLATFORMS = [
  { value: "facebook", label: "Facebook", icon: MessageCircle },
  { value: "instagram", label: "Instagram", icon: Camera },
  { value: "tiktok", label: "TikTok", icon: Music2 },
]

const TONES = [
  { value: "promo", label: "Promo" },
  { value: "edukasi", label: "Edukasi" },
  { value: "inspirasi", label: "Inspirasi" },
  { value: "storytelling", label: "Storytelling" },
]

const PLATFORM_BADGES: Record<string, { label: string; className: string }> = {
  facebook: { label: "f", className: "bg-[#1877F2] text-white min-w-[18px]" },
  instagram: { label: "IG", className: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white min-w-[22px]" },
  tiktok: { label: "TT", className: "bg-black text-white min-w-[22px]" },
}

const PLATFORM_SPECS: Record<string, { maxChars: string; style: string; structure: string }> = {
  facebook: { maxChars: "1.000-2.000", style: "Storytelling, personal, emoji", structure: "Hook → Detail → Tips → CTA" },
  instagram: { maxChars: "150-300", style: "Estetik, ringan, emoji", structure: "Hook → Deskripsi → CTA → Hashtag" },
  tiktok: { maxChars: "15-60 detik", style: "Cepat, engaging, text overlay", structure: "Hook → Info → Tips → CTA" },
}

interface SourceItem {
  slug: string
  title?: string
  name?: string
  category?: string
  province?: string
  rating?: number
  excerpt?: string
  author?: string
}

interface GenerateResult {
  caption: string
  hashtags: string
  skrip_tiktok: string
  visual_prompt: string
}

interface DraftPayload {
  title: string
  platform: string
  tone: string
  content_type: string
  source_id: string
  source_title: string
  caption: string
  hashtags: string
  skrip_tiktok: string
}

export default function ContentGeneratorPage() {
  const [sourceType, setSourceType] = useState<"blog" | "roadtrip" | "spot">("spot")
  const [sources, setSources] = useState<SourceItem[]>([])
  const [loadingSources, setLoadingSources] = useState(false)
  const [search, setSearch] = useState("")
  const [contentStatus, setContentStatus] = useState<Record<string, Record<string, { tone: string; updatedAt: string }>>>({})

  const [selectedItem, setSelectedItem] = useState<SourceItem | null>(null)

  const [selectedPlatform, setSelectedPlatform] = useState("facebook")
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState<Record<string, GenerateResult> | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedPlatforms, setSavedPlatforms] = useState<Record<string, boolean>>({})

  const [mode, setMode] = useState<"caption" | "carousel">("caption")
  const [carouselResult, setCarouselResult] = useState<{
    text_overlays: string[]
    image_prompts: string[]
    caption: string
    hashtags: string
  } | null>(null)
  const [carouselGenerating, setCarouselGenerating] = useState(false)

  useEffect(() => {
    fetchSources()
  }, [sourceType])

  useEffect(() => {
    if (sources.length > 0) fetchStatus()
  }, [sources])

  async function fetchSources() {
    setLoadingSources(true)
    try {
      let endpoint: string
      if (sourceType === "roadtrip") endpoint = "/api/admin/itineraries"
      else if (sourceType === "blog") endpoint = "/api/admin/blog?limit=50"
      else endpoint = "/api/spots"

      const res = await fetch(endpoint)
      const json = await res.json()

      let list: SourceItem[]
      if (sourceType === "blog") {
        const posts = json.data?.posts || json.data || []
        list = (posts as any[]).map((p: any) => ({
          slug: p.slug,
          title: p.title,
          category: p.category,
          excerpt: p.excerpt,
          author: p.author,
        }))
      } else if (sourceType === "roadtrip") {
        list = (json.data?.data || []) as SourceItem[]
      } else {
        list = (json.data || []) as SourceItem[]
      }

      setSources(list)
      if (!selectedItem && list.length > 0) {
        setSelectedItem(list[0])
      }
    } catch {
      setSources([])
    }
    setLoadingSources(false)
  }

  async function fetchStatus() {
    try {
      const res = await fetch(`/api/admin/content-generator/status?content_type=${sourceType}`)
      const json = await res.json()
      if (res.ok) setContentStatus(json.data.status || {})
    } catch {}
  }

  const filteredSources = sources.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    const title = (s.title || s.name || "").toLowerCase()
    const prov = (s.province || "").toLowerCase()
    return title.includes(q) || prov.includes(q)
  })

  function getPlatformStatus(slug: string): Record<string, boolean> {
    const itemStatus = contentStatus[slug] || {}
    const result: Record<string, boolean> = {}
    for (const p of PLATFORMS) {
      result[p.value] = !!itemStatus[p.value]
    }
    return result
  }

  async function handleSelectItem(item: SourceItem) {
    setSelectedItem(item)
    setResults(null)
  }

  async function handleGenerate() {
    if (!selectedItem) return
    const slug = selectedItem.slug
    setGenerating(true)
    setResults(null)
    setSavedPlatforms({})
    try {
      const res = await fetch("/api/admin/content-generator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType,
          sourceId: slug,
          platforms: [selectedPlatform],
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error?.message || "Gagal generate")
      setResults(json.data.results)
      setSavedPlatforms({})
      toast.success("Konten berhasil digenerate!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal generate konten")
    }
    setGenerating(false)
  }

  async function handleSave(platform: string, result: GenerateResult) {
    if (!selectedItem) return
    const slug = selectedItem.slug
    const title = selectedItem.title || selectedItem.name || slug
    setSaving(true)
    try {
      const res = await fetch("/api/admin/content-generator/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${title} — ${platform}`,
          platform,
          tone: "auto",
          content_type: sourceType,
          source_id: slug,
          source_title: title,
          caption: result.caption,
          hashtags: result.hashtags || "",
          skrip_tiktok: result.skrip_tiktok || "",
        }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body?.error?.message || "Gagal simpan")
      setSavedPlatforms((prev) => ({ ...prev, [platform]: true }))
      await fetchStatus()
      toast.success("Draft tersimpan!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan draft")
    }
    setSaving(false)
  }

  async function handleGenerateCarousel() {
    if (!selectedItem) return
    setCarouselGenerating(true)
    setCarouselResult(null)
    try {
      const res = await fetch("/api/admin/content-generator/viral-carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType,
          sourceId: selectedItem.slug,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error?.message || "Gagal generate carousel")
      setCarouselResult(json.data?.data || json.data)
      toast.success("Carousel siap!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal generate carousel")
    }
    setCarouselGenerating(false)
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
    toast.success("Tersalin!")
  }

  const [showStructure, setShowStructure] = useState(true)

  function cleanCaption(text: string): string {
    return text
      .replace(/^━+.*$/gm, "")
      .replace(/^───.*$/gm, "")
      .replace(/^╔[═╗║]+$|^╠[═╣║]+$|^╚[═╝║]+$/gm, "")
      .replace(/^║.*$/gm, "")
      .replace(/^📊.*$|^🎨.*$|^📋.*$/gm, "")
      .replace(/^💡 Tips publikasi:.*$/gm, "")
      .replace(/^🎬 Transisi:.*$/gm, "")
      .replace(/^🎵 MUSIK:.*$/gm, "")
      .replace(/^⏱️ DURASI:.*$/gm, "")
      .replace(/^🎬 Caption editor:.*$/gm, "")
      .replace(/^💬 Caption:.*$/gm, "")
      .replace(/^🎬 Visual:.*$/gm, "")
      .replace(/^🔊 VO:.*$/gm, "")
      .replace(/^📝 Caption editor:.*$/gm, "")
      .replace(/^Transisi:.*$/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  }

  function getResultText(platform: string, tone: string, result: GenerateResult): string {
    if (platform === "tiktok") return result.skrip_tiktok || result.caption
    let text = result.caption
    if (result.hashtags && platform === "instagram") text += "\n\n" + result.hashtags
    return showStructure ? text : cleanCaption(text)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Konten Sosial Media
          </h1>
          <p className="text-muted-foreground">Generate konten untuk Facebook, Instagram, dan TikTok</p>
        </div>
        <Link href="/admin/content-generator/drafts">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Lihat Draft
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left panel: list of items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Daftar Konten</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant={sourceType === "spot" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSourceType("spot")}
                    className="h-7 gap-1 text-xs"
                  >
                    <MapPin className="h-3 w-3" />
                    Spot
                  </Button>
                  <Button
                    variant={sourceType === "roadtrip" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSourceType("roadtrip")}
                    className="h-7 gap-1 text-xs"
                  >
                    <Route className="h-3 w-3" />
                    Roadtrip
                  </Button>
                  <Button
                    variant={sourceType === "blog" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSourceType("blog")}
                    className="h-7 gap-1 text-xs"
                  >
                    <FileText className="h-3 w-3" />
                    Blog
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-8 text-sm"
                />
              </div>

              <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
                {loadingSources ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">Memuat...</div>
                ) : filteredSources.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    {search ? "Tidak ditemukan" : "Belum ada data"}
                  </div>
                ) : (
                  filteredSources.map((item) => {
                    const slug = item.slug
                    const status = getPlatformStatus(slug)
                    const isSelected = selectedItem?.slug === slug
                    const title = item.title || item.name || slug

                    return (
                      <button
                        key={slug}
                        onClick={() => handleSelectItem(item)}
                        className={`w-full text-left rounded-lg border p-3 transition-colors hover:bg-muted/50 ${
                          isSelected ? "border-primary bg-primary/5" : "border-border/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {sourceType === "blog"
                                ? (item.category || "")
                                : `${item.province || ""}${item.category ? ` · ${item.category}` : ""}`
                              }
                              {sourceType === "blog" && item.author ? ` · ${item.author}` : ""}
                              {item.rating ? (
                                <span className="inline-flex items-center gap-0.5 ml-1">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                  {item.rating}
                                </span>
                              ) : null}
                            </p>
                            {sourceType === "blog" && item.excerpt && (
                              <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">{item.excerpt}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0 mt-0.5">
                            {PLATFORMS.map((p) => {
                              const hasContent = status[p.value]
                              const badge = PLATFORM_BADGES[p.value]
                              return (
                                <div
                                  key={p.value}
                                  className={`flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-bold leading-none ${
                                    hasContent ? badge.className : "bg-muted text-muted-foreground/40"
                                  }`}
                                  title={`${p.label}: ${hasContent ? "Sudah ada" : "Kosong"}`}
                                >
                                  <span>{badge.label}</span>
                                  {hasContent && <span>●</span>}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Status per Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-xs">
                {PLATFORMS.map((p) => {
                  const totalWithContent = filteredSources.filter(
                    (s) => !!contentStatus[s.slug]?.[p.value]
                  ).length
                  const badge = PLATFORM_BADGES[p.value]
                  return (
                    <div key={p.value} className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center justify-center rounded px-1 py-0.5 text-[10px] font-bold leading-none ${badge.className}`}>
                        {badge.label}
                      </span>
                      <span className="text-muted-foreground">{totalWithContent}/{filteredSources.length}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right panel: generate + results */}
        <div className="lg:col-span-3 space-y-4">
          {!selectedItem ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Pilih konten dari daftar</p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  Klik spot atau roadtrip untuk mulai generate
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Generate controls */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{selectedItem.title || selectedItem.name || selectedItem.slug}</CardTitle>
                      <CardDescription>Pilih platform, tone, dan metode generate</CardDescription>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">✨ AI DeepSeek — otomatis</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Mode selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground shrink-0">Mode:</span>
                    <div className="flex gap-1">
                      <Button
                        variant={mode === "caption" ? "default" : "outline"}
                        size="sm"
                        onClick={() => { setMode("caption"); setResults(null); setCarouselResult(null) }}
                        className="gap-1.5"
                      >
                        <FileText className="h-4 w-4" />
                        Caption
                      </Button>
                      <Button
                        variant={mode === "carousel" ? "default" : "outline"}
                        size="sm"
                        onClick={() => { setMode("carousel"); setCarouselResult(null) }}
                        className="gap-1.5"
                      >
                        <Layout className="h-4 w-4" />
                        Viral Carousel
                      </Button>
                    </div>
                  </div>

                  {mode === "caption" ? (
                    <>
                      {/* Platform selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground shrink-0">Platform:</span>
                        <div className="flex gap-1">
                          {PLATFORMS.map((p) => {
                            const Icon = p.icon
                            const isSelected = selectedPlatform === p.value
                            return (
                              <Button
                                key={p.value}
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => { setSelectedPlatform(p.value); setResults(null) }}
                                className="gap-1.5"
                              >
                                <Icon className="h-4 w-4" />
                                {p.label}
                              </Button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Mobile: tone + method */}
                      <div className="flex sm:hidden items-center">
                        <span className="text-xs text-muted-foreground">✨ AI DeepSeek — otomatis</span>
                      </div>

                      <Button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full gap-2"
                        size="lg"
                      >
                        {generating ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Sparkles className="h-5 w-5" />
                        )}
                        {generating
                          ? `Generate ${selectedPlatform}...`
                          : `✨ Generate ${selectedPlatform}`}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleGenerateCarousel}
                        disabled={carouselGenerating}
                        className="w-full gap-2"
                        size="lg"
                      >
                        {carouselGenerating ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Layout className="h-5 w-5" />
                        )}
                        {carouselGenerating
                          ? "Generate Carousel..."
                          : "🎨 Generate Viral Carousel"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Results: Caption Mode */}
              {mode === "caption" && results ? (
                (() => {
                  const platform = selectedPlatform
                  const toneResult = results[platform]
                  if (!toneResult) return null

                  const fullText = `📝 CAPTION\n${toneResult.caption}${toneResult.hashtags ? `\n\n🏷️ HASHTAG\n${toneResult.hashtags}` : ""}${toneResult.skrip_tiktok ? `\n\n🎬 SKRIP TIKTOK\n${toneResult.skrip_tiktok}` : ""}${toneResult.visual_prompt ? `\n\n${toneResult.visual_prompt}` : ""}`
                  const copyKey = `${platform}`

                  return (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="capitalize text-base">{platform}</CardTitle>
                            <CardDescription>
                              {platform === "tiktok" ? "Skrip + Visual" : "Caption + Visual"}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => handleCopy(fullText, copyKey)}
                            >
                              {copied === copyKey ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                              {copied === copyKey ? "Tersalin!" : "Copy All"}
                            </Button>
                            {!savedPlatforms[platform] ? (
                              <Button
                                variant="default"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => handleSave(platform, toneResult)}
                                disabled={saving}
                              >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Simpan
                              </Button>
                            ) : (
                              <Badge variant="secondary" className="gap-1 text-xs">
                                <Check className="h-3 w-3 text-green-500" />
                                Tersimpan
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={fullText}
                          readOnly
                          className="min-h-[450px] font-mono text-sm leading-relaxed resize-y whitespace-pre"
                        />
                      </CardContent>
                    </Card>
                  )
                })()
              ) : mode === "caption" && generating ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              ) : mode === "caption" ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Klik Generate untuk membuat konten
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              {/* Results: Carousel Mode */}
              {mode === "carousel" && carouselResult ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">🎨 Viral Carousel</CardTitle>
                        <CardDescription>
                          Text overlay + prompt gambar — otomatis sesuai data
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleCopy(JSON.stringify(carouselResult.text_overlays, null, 2), "overlays")}
                        >
                          {copied === "overlays" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          Copy Overlay
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => {
                            const all = carouselResult.image_prompts.map((p, i) => `🎨 SLIDE ${i + 1}\n${p}`).join("\n\n")
                            navigator.clipboard.writeText(all)
                            toast.success("Semua prompt tersalin!")
                          }}
                        >
                          <ImageIcon className="h-4 w-4" />
                          Copy Prompt
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {carouselResult.text_overlays.map((text, i) => {
                        const gradients = [
                          "from-sky-400/80 via-blue-500/80 to-indigo-600/80",
                          "from-emerald-400/80 via-teal-500/80 to-cyan-600/80",
                          "from-orange-400/80 via-rose-500/80 to-pink-600/80",
                          "from-violet-400/80 via-purple-500/80 to-fuchsia-600/80",
                          "from-amber-400/80 via-yellow-500/80 to-orange-600/80",
                        ]
                        const bg = gradients[i % gradients.length]
                        return (
                          <div key={i} className="rounded-xl border border-border/50 overflow-hidden bg-white shadow-sm">
                            {/* IG Post Mockup */}
                            <div className={`aspect-[4/5] bg-gradient-to-br ${bg} relative flex flex-col justify-end p-0`}>
                              <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                                {i + 1}
                              </div>
                              <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(text)
                                    setCopied(`overlay-${i}`)
                                    setTimeout(() => setCopied(null), 2000)
                                    toast.success("Text overlay tersalin!")
                                  }}
                                  className="h-5 w-5 flex items-center justify-center rounded bg-black/30 hover:bg-black/50 transition-colors"
                                >
                                  {copied === `overlay-${i}` ? <Check className="h-2.5 w-2.5 text-green-400" /> : <Copy className="h-2.5 w-2.5 text-white/60" />}
                                </button>
                                <span className="bg-black/30 text-white/60 text-[9px] px-1.5 py-0.5 rounded-full">
                                  IG
                                </span>
                              </div>
                              <div className="bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 pt-12">
                                <p className="text-white font-bold text-sm leading-snug break-words drop-shadow-lg">
                                  {text}
                                </p>
                              </div>
                            </div>
                            {/* Prompt */}
                            <div className="p-3 bg-muted/30 border-t border-border/30">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-[11px] text-muted-foreground font-mono leading-relaxed flex-1 min-w-0">
                                  🤖 {carouselResult.image_prompts[i]}
                                </p>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(carouselResult.image_prompts[i])
                                    setCopied(`prompt-${i}`)
                                    setTimeout(() => setCopied(null), 2000)
                                    toast.success("Prompt slide tersalin!")
                                  }}
                                  className="shrink-0 h-6 w-6 flex items-center justify-center rounded hover:bg-muted-foreground/10 transition-colors"
                                >
                                  {copied === `prompt-${i}` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground/60" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="rounded-xl border border-border/50 p-4 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">💬 Caption</p>
                      <p className="text-sm">{carouselResult.caption}</p>
                      {carouselResult.hashtags && (
                        <>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mt-3">🏷️ Hashtag</p>
                          <p className="text-sm text-muted-foreground">{carouselResult.hashtags}</p>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 mt-2"
                        onClick={() => {
                          const text = `${carouselResult.caption}\n\n${carouselResult.hashtags}`
                          navigator.clipboard.writeText(text)
                          toast.success("Caption + hashtag tersalin!")
                        }}
                      >
                        {copied === "caption" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        Copy Caption + Hashtag
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : mode === "carousel" && carouselGenerating ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              ) : mode === "carousel" ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Layout className="h-8 w-8 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Pilih jumlah slide, lalu klik Generate Viral Carousel
                    </p>
                  </CardContent>
                </Card>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

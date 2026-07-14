/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  Info,
  Code,
  ChevronDown,
  ChevronRight,
  Search,
  Star,
  Layout,
  ImageIcon,
  Eye,
  Download,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

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

export default function ContentGeneratorPage() {
  const [sourceType, setSourceType] = useState<"blog" | "roadtrip" | "spot">("spot")
  const [sources, setSources] = useState<SourceItem[]>([])
  const [loadingSources, setLoadingSources] = useState(false)
  const [search, setSearch] = useState("")

  const [selectedItem, setSelectedItem] = useState<SourceItem | null>(null)

  const [copied, setCopied] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [carouselResult, setCarouselResult] = useState<{
    text_overlays: string[]
    image_prompts: string[]
    caption: string
    hashtags: string
  } | null>(null)
  const [carouselGenerating, setCarouselGenerating] = useState(false)
  const [slideImages, setSlideImages] = useState<(string | null)[]>([])
  const [slideDragOver, setSlideDragOver] = useState<number | null>(null)
  const [slideImageUpdating, setSlideImageUpdating] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchSources()
  }, [sourceType])

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

  const filteredSources = sources.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    const title = (s.title || s.name || "").toLowerCase()
    const prov = (s.province || "").toLowerCase()
    return title.includes(q) || prov.includes(q)
  })

  async function handleSelectItem(item: SourceItem) {
    setSelectedItem(item)
    setCarouselResult(null)
    setSlideImages([])
  }

  async function handleSaveCarousel(conceptTitle?: string) {
    if (!selectedItem || !carouselResult) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/content-generator/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: conceptTitle || `${selectedItem.title || selectedItem.name || selectedItem.slug} — Carousel`,
          concept_type: "carousel",
          content_type: sourceType,
          source_id: selectedItem.slug,
          source_title: selectedItem.title || selectedItem.name || selectedItem.slug,
          caption: carouselResult.caption,
          hashtags: carouselResult.hashtags || "",
          text_overlays: carouselResult.text_overlays,
          image_prompts: carouselResult.image_prompts,
          slide_images: slideImages,
        }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body?.error?.message || "Gagal simpan")
      toast.success("Konsep carousel tersimpan!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan konsep")
    }
    setSaving(false)
  }

  async function handleGenerateCarousel() {
    if (!selectedItem) return
    setCarouselGenerating(true)
    setCarouselResult(null)
    setSlideImages([])
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
      const data = json.data?.data || json.data
      setCarouselResult(data)
      setSlideImages((data?.text_overlays || []).map(() => null))
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

  async function handleSlideUpload(index: number, file: File) {
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) { toast.error("File maksimal 10MB"); return }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"]
    if (!allowed.includes(file.type)) { toast.error("Tipe file harus jpg, png, webp, atau avif"); return }

    setSlideImageUpdating(prev => new Set(prev).add(index))
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "carousel")
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error?.message || "Gagal upload")
      setSlideImages(prev => { const next = [...prev]; next[index] = json.data.url; return next })
      toast.success("Gambar slide tersimpan!")
    } catch (err) {
      toast.error("Gagal upload: " + (err as Error).message)
    }
    setSlideImageUpdating(prev => { const n = new Set(prev); n.delete(index); return n })
  }

  async function downloadSlide(index: number) {
    const imageUrl = slideImages[index]
    const text = carouselResult?.text_overlays[index]
    if (!imageUrl || !text) { toast.error("Belum ada gambar untuk slide ini"); return }

    try {
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const img = new Image()
      img.src = URL.createObjectURL(blob)
      img.crossOrigin = "anonymous"

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error("Gagal load gambar"))
      })

      const canvas = document.createElement("canvas")
      const W = 1080
      const H = 1350
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext("2d")!

      // Draw image (cover fill)
      const iRatio = img.width / img.height
      const cRatio = W / H
      let sx = 0, sy = 0, sw = img.width, sh = img.height
      if (iRatio > cRatio) { sh = img.height; sw = sh * cRatio; sx = (img.width - sw) / 2 }
      else { sw = img.width; sh = sw / cRatio; sy = (img.height - sh) / 2 }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H)

      // Gradient overlay at bottom for text
      const grad = ctx.createLinearGradient(0, H * 0.5, 0, H)
      grad.addColorStop(0, "rgba(0,0,0,0)")
      grad.addColorStop(0.4, "rgba(0,0,0,0.3)")
      grad.addColorStop(1, "rgba(0,0,0,0.8)")
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      // Text overlay
      ctx.textAlign = "left"
      ctx.textBaseline = "bottom"
      const fontSize = 64
      const padding = 64
      const maxWidth = W - padding * 2

      // Auto-fit text
      let adjustedSize = fontSize
      ctx.font = `bold ${adjustedSize}px "Montserrat", "Helvetica Neue", sans-serif`
      while (ctx.measureText(text).width > maxWidth && adjustedSize > 24) {
        adjustedSize -= 2
        ctx.font = `bold ${adjustedSize}px "Montserrat", "Helvetica Neue", sans-serif`
      }

      // Draw slide number
      ctx.fillStyle = "rgba(255,255,255,0.5)"
      ctx.font = `bold 28px "Montserrat", "Helvetica Neue", sans-serif`
      ctx.textAlign = "left"
      ctx.textBaseline = "top"
      ctx.fillText(`${index + 1}/${carouselResult!.text_overlays.length}`, padding, padding)

      // Draw text
      ctx.shadowColor = "rgba(0,0,0,0.6)"
      ctx.shadowBlur = 12
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.fillStyle = "#FFFFFF"
      ctx.font = `bold ${adjustedSize}px "Montserrat", "Helvetica Neue", sans-serif`
      ctx.textAlign = "left"
      ctx.textBaseline = "bottom"

      const textX = padding
      const textY = H - padding
      wrapText(ctx, text, textX, textY, maxWidth, adjustedSize * 1.3)

      // Download
      const a = document.createElement("a")
      a.href = canvas.toDataURL("image/jpeg", 0.92)
      a.download = `carousel-slide-${index + 1}.jpg`
      a.click()
      toast.success("Slide terdownload!")
    } catch (err) {
      toast.error("Gagal download: " + (err as Error).message)
    }
  }

  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(" ")
    let line = ""
    let lineY = y
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && line) {
        ctx.fillText(line, x, lineY)
        line = word
        lineY -= lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, lineY)
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
                        </div>
                      </button>
                    )
                  })
                )}
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
                      <CardDescription>Generate Viral Carousel — text overlay + prompt gambar</CardDescription>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <Link href="/admin/content-generator/drafts">
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Eye className="h-4 w-4" /> Lihat Konsep
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
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
                </CardContent>
              </Card>

              {/* Results: Carousel Mode */}
              {carouselResult ? (
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
                        const slideImg = slideImages[i]
                        const isDragOver = slideDragOver === i
                        return (
                          <div key={i} className="rounded-xl border border-border/50 overflow-hidden bg-white shadow-sm">
                            <div
                              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setSlideDragOver(i) }}
                              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setSlideDragOver(null) }}
                              onDrop={async (e) => {
                                e.preventDefault(); e.stopPropagation(); setSlideDragOver(null)
                                const file = e.dataTransfer.files?.[0]
                                if (file) handleSlideUpload(i, file)
                              }}
                              className={`aspect-[4/5] relative flex flex-col justify-end p-0 overflow-hidden ${isDragOver ? 'ring-2 ring-primary' : ''}`}
                            >
                              {slideImg ? (
                                <img src={slideImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
                              ) : (
                                <div className={`absolute inset-0 bg-gradient-to-br ${bg}`} />
                              )}
                              {isDragOver && (
                                <div className="absolute inset-0 bg-primary/20 border-2 border-dashed border-primary z-20 flex items-center justify-center">
                                  <p className="text-white font-semibold text-sm bg-black/50 px-3 py-1.5 rounded-full">Lepaskan untuk upload</p>
                                </div>
                              )}
                              <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                                <span className="bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{i + 1}</span>
                                {slideImg && (
                                  <span className="bg-green-600/80 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full" /> Foto
                                  </span>
                                )}
                              </div>
                              <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                                <button onClick={() => { navigator.clipboard.writeText(text); setCopied(`overlay-${i}`); setTimeout(() => setCopied(null), 2000); toast.success("Text overlay tersalin!") }}
                                  className="h-5 w-5 flex items-center justify-center rounded bg-black/30 hover:bg-black/50 transition-colors">
                                  {copied === `overlay-${i}` ? <Check className="h-2.5 w-2.5 text-green-400" /> : <Copy className="h-2.5 w-2.5 text-white/60" />}
                                </button>
                                {slideImg && (
                                  <button onClick={() => downloadSlide(i)}
                                    className="h-5 w-5 flex items-center justify-center rounded bg-black/30 hover:bg-black/50 transition-colors">
                                    {slideImageUpdating.has(i) ? <Loader2 className="h-2.5 w-2.5 animate-spin text-white/60" /> : <Download className="h-2.5 w-2.5 text-white/60" />}
                                  </button>
                                )}
                                <span className="bg-black/30 text-white/60 text-[9px] px-1.5 py-0.5 rounded-full">IG</span>
                              </div>
                              <div className="relative bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 pt-12">
                                <p className="text-white font-bold text-sm leading-snug break-words drop-shadow-lg">{text}</p>
                              </div>
                              {slideImageUpdating.has(i) && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                                </div>
                              )}
                            </div>
                            <div className="p-3 bg-muted/30 border-t border-border/30">
                              <div className="flex items-start justify-between gap-2">
                                {slideImg ? (
                                  <p className="text-[11px] text-green-600 font-mono leading-relaxed flex-1 min-w-0 truncate">🖼️ Gambar terupload</p>
                                ) : (
                                  <p className="text-[11px] text-muted-foreground font-mono leading-relaxed flex-1 min-w-0">🤖 {carouselResult.image_prompts[i]}</p>
                                )}
                                <button onClick={() => { navigator.clipboard.writeText(carouselResult.image_prompts[i]); setCopied(`prompt-${i}`); setTimeout(() => setCopied(null), 2000); toast.success("Prompt slide tersalin!") }}
                                  className="shrink-0 h-6 w-6 flex items-center justify-center rounded hover:bg-muted-foreground/10 transition-colors">
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
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="outline" size="sm" className="gap-1.5"
                          onClick={() => { const text = `${carouselResult.caption}\n\n${carouselResult.hashtags}`; navigator.clipboard.writeText(text); toast.success("Caption + hashtag tersalin!") }}>
                          {copied === "caption" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          Copy Caption + Hashtag
                        </Button>
                        <Button variant="default" size="sm" className="gap-1.5"
                          disabled={saving}
                          onClick={() => handleSaveCarousel(`${selectedItem?.title || selectedItem?.name || "Carousel"} — Konsep Carousel`)}>
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Simpan sebagai Konsep
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : carouselGenerating ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Layout className="h-8 w-8 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">Pilih konten, lalu klik Generate Viral Carousel</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

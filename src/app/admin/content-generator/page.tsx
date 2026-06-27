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
}

interface GenerateResult {
  caption: string
  hashtags: string
  skrip_tiktok: string
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
  const [sourceType, setSourceType] = useState<"roadtrip" | "spot">("spot")
  const [sources, setSources] = useState<SourceItem[]>([])
  const [loadingSources, setLoadingSources] = useState(false)
  const [search, setSearch] = useState("")
  const [contentStatus, setContentStatus] = useState<Record<string, Record<string, { tone: string; updatedAt: string }>>>({})

  const [selectedItem, setSelectedItem] = useState<SourceItem | null>(null)

  // Generate form state
  const [selectedPlatform, setSelectedPlatform] = useState("facebook")
  const [selectedTone, setSelectedTone] = useState("promo")
  const [method, setMethod] = useState<"template" | "ai">("template")
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState<Record<string, Record<string, GenerateResult>> | null>(null)
  const [activePlatform, setActivePlatform] = useState("facebook")
  const [copied, setCopied] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [debugPrompts, setDebugPrompts] = useState<Record<string, Record<string, { prompt: string }>> | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [savedPlatforms, setSavedPlatforms] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchSources()
  }, [sourceType])

  useEffect(() => {
    if (sources.length > 0) fetchStatus()
  }, [sources])

  async function fetchSources() {
    setLoadingSources(true)
    try {
      const endpoint = sourceType === "roadtrip" ? "/api/admin/itineraries" : "/api/spots"
      const res = await fetch(endpoint)
      const json = await res.json()
      const list = (json.data || []) as SourceItem[]
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
    setDebugPrompts(null)
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
          tones: [selectedTone],
          method,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error?.message || "Gagal generate")
      setResults(json.data.results)
      setDebugPrompts(json.data.debug || null)
      setActivePlatform(selectedPlatform)
      toast.success("Konten berhasil digenerate!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal generate konten")
    }
    setGenerating(false)
  }

  async function handleSave(platform: string, tone: string, result: GenerateResult) {
    if (!selectedItem) return
    const slug = selectedItem.slug
    const title = selectedItem.title || selectedItem.name || slug
    setSaving(true)
    try {
      const res = await fetch("/api/admin/content-generator/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${title} — ${platform} (${tone})`,
          platform,
          tone,
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

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
    toast.success("Tersalin!")
  }

  const [showStructure, setShowStructure] = useState(false)

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
                              {item.province || ""}
                              {item.category ? ` · ${item.category}` : ""}
                              {item.rating ? (
                                <span className="inline-flex items-center gap-0.5 ml-1">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                  {item.rating}
                                </span>
                              ) : null}
                            </p>
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
                      <div className="flex gap-1 bg-muted rounded-lg p-0.5">
                        <button
                          onClick={() => setMethod("template")}
                          className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                            method === "template" ? "bg-background shadow-sm" : "text-muted-foreground"
                          }`}
                        >
                          Template
                        </button>
                        <button
                          onClick={() => setMethod("ai")}
                          className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                            method === "ai" ? "bg-background shadow-sm" : "text-muted-foreground"
                          }`}
                        >
                          AI DeepSeek
                        </button>
                      </div>
                      <Select value={selectedTone} onValueChange={(v) => v && setSelectedTone(v)}>
                        <SelectTrigger className="h-7 w-28 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TONES.map((t) => (
                            <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
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
                  <div className="flex sm:hidden items-center gap-2">
                    <div className="flex gap-1 bg-muted rounded-lg p-0.5">
                      <button
                        onClick={() => setMethod("template")}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                          method === "template" ? "bg-background shadow-sm" : "text-muted-foreground"
                        }`}
                      >
                        Template
                      </button>
                      <button
                        onClick={() => setMethod("ai")}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                          method === "ai" ? "bg-background shadow-sm" : "text-muted-foreground"
                        }`}
                      >
                        AI
                      </button>
                    </div>
                    <Select value={selectedTone} onValueChange={(v) => v && setSelectedTone(v)}>
                      <SelectTrigger className="h-7 flex-1 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TONES.map((t) => (
                          <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      : `✨ Generate ${selectedPlatform} — ${selectedTone}`}
                  </Button>
                </CardContent>
              </Card>

              {/* Results */}
              {results ? (
                (() => {
                  const platform = selectedPlatform
                  const toneResult = results[platform]?.[selectedTone]
                  if (!toneResult) return null

                  const displayText = getResultText(platform, selectedTone, toneResult)
                  const copyKey = `${platform}-${selectedTone}`

                  return (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="capitalize text-base">{platform}</CardTitle>
                            <CardDescription>
                              {platform === "tiktok" ? "Skrip video TikTok" : `Caption ${platform}`}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => handleCopy(displayText, copyKey)}
                            >
                              {copied === copyKey ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                              {copied === copyKey ? "Tersalin!" : "Copy"}
                            </Button>
                            {!savedPlatforms[platform] ? (
                              <Button
                                variant="default"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => handleSave(platform, selectedTone, toneResult)}
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
                      <CardContent className="space-y-4">
                        {PLATFORM_SPECS[platform] && (
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="gap-1">
                              <Info className="h-3 w-3" />
                              {PLATFORM_SPECS[platform].maxChars}
                            </Badge>
                            <Badge variant="outline" className="gap-1 text-muted-foreground">
                              🎨 {PLATFORM_SPECS[platform].style}
                            </Badge>
                            <Badge variant="outline" className="gap-1 text-muted-foreground">
                              📋 {PLATFORM_SPECS[platform].structure}
                            </Badge>
                            <div className="ml-auto">
                              <button
                                onClick={() => setShowStructure(!showStructure)}
                                className={`text-xs font-medium px-2.5 py-1 rounded-md border transition-colors ${
                                  showStructure
                                    ? "bg-muted text-muted-foreground border-border"
                                    : "bg-primary/10 text-primary border-primary/20"
                                }`}
                              >
                                {showStructure ? "Tampilkan Struktur" : "Siap Posting"}
                              </button>
                            </div>
                          </div>
                        )}

                        <Textarea
                          value={displayText}
                          readOnly
                          className="min-h-[350px] font-mono text-sm leading-relaxed resize-y whitespace-pre"
                        />

                        {/* Debug prompt */}
                        {debugPrompts?.[platform]?.[selectedTone]?.prompt && method === "ai" && (
                          <div className="border rounded-lg overflow-hidden">
                            <button
                              onClick={() => setShowDebug(!showDebug)}
                              className="flex w-full items-center justify-between gap-2 bg-muted/50 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                            >
                              <span className="flex items-center gap-1.5">
                                <Code className="h-3.5 w-3.5" />
                                Prompt yang dikirim ke DeepSeek
                              </span>
                              {showDebug ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                            </button>
                            {showDebug && (
                              <div className="border-t">
                                <Textarea
                                  value={debugPrompts[platform][selectedTone].prompt}
                                  readOnly
                                  className="min-h-[200px] font-mono text-xs leading-relaxed resize-y rounded-none border-0 whitespace-pre"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })()
              ) : generating ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Klik Generate untuk membuat konten 3 platform sekaligus
                    </p>
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

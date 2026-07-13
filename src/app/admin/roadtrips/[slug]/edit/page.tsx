"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { api } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ReadinessScore } from "@/components/ui/ReadinessScore"
import { ArrowLeft, Save, Loader2, Plus, Trash2, ExternalLink, Copy, Check, ImageIcon } from "lucide-react"
import Link from "next/link"
import { SpotSelect } from "@/components/admin/SpotSelect"
import { ImageUpload } from "@/components/ui/image-upload"
import { toast } from "sonner"
import { SITE_URL } from "@/lib/constants"

interface StopForm { key: string; stopNumber: number; name: string; spotSlug: string }
let stopKeyCounter = 0
function createEmptyStop(stopNumber: number): StopForm { return { key: `stop-${++stopKeyCounter}`, stopNumber, name: "", spotSlug: "" } }
function stopToForm(stop: any, index: number): StopForm { return { key: `stop-${++stopKeyCounter}`, stopNumber: index + 1, name: stop.name || "", spotSlug: stop.spotSlug || stop.spot_slug || "" } }

export default function EditRoadtripPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [imagePrompt, setImagePrompt] = useState("")
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({ title: "", itineraryDuration: "", totalDistance: "", roadCondition: "", estimatedCost: "", bestDrivingTime: "", routeFacilities: "", mapsEmbedUrl: "", drivingSafetyTips: "", culinaryNotes: "", coverImage: "", isPublished: false, promptGambar: "", coverImagePrompt: "" })
  const [stops, setStops] = useState<StopForm[]>([])
  const [fullData, setFullData] = useState<any>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.admin.itineraries.get(slug)
        const d = res.data as any
        setFullData(d)
        setForm({
          title: d.title || "", itineraryDuration: d.itineraryDuration || d.itinerary_duration || "", totalDistance: d.totalDistance || d.total_distance || "",
          roadCondition: d.roadCondition || d.road_condition || "", estimatedCost: d.estimatedCost || d.estimated_cost || "",
          bestDrivingTime: d.bestDrivingTime || d.best_driving_time || "",
          routeFacilities: Array.isArray(d.routeFacilities || d.route_facilities) ? (d.routeFacilities || d.route_facilities).join(", ") : "",
          mapsEmbedUrl: d.mapsEmbedUrl || d.maps_embed_url || "", drivingSafetyTips: d.drivingSafetyTips || d.driving_safety_tips || "",
          culinaryNotes: d.culinaryNotes || d.culinary_notes || "", coverImage: d.coverImage || d.cover_image || "", isPublished: d.isPublished || d.is_published || false,
          promptGambar: d.promptGambar || d.prompt_gambar || "",
          coverImagePrompt: d.coverImagePrompt || d.cover_image_prompt || "",
        })
        setStops((d.stops || []).map((s: any, i: number) => stopToForm(s, i)))
      } catch { router.push("/admin/roadtrips") }
      setLoading(false)
    }
    load()
  }, [slug, router])

  function addStop() { setStops((prev) => [...prev, createEmptyStop(prev.length + 1)]) }
  function removeStop(key: string) { setStops((prev) => { const f = prev.filter((s) => s.key !== key); return f.map((s, i) => ({ ...s, stopNumber: i + 1 })) }) }
  function updateField(field: string, value: string | boolean) { setForm((f) => ({ ...f, [field]: value })) }
  function handleSpotSelect(key: string, slug: string, name: string) { setStops((prev) => prev.map((s) => s.key === key ? { ...s, spotSlug: slug, name: name || s.name } : s)) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const data = {
      title: form.title, itineraryDuration: form.itineraryDuration || undefined, totalDistance: form.totalDistance || undefined,
      roadCondition: form.roadCondition || undefined, estimatedCost: form.estimatedCost || undefined, bestDrivingTime: form.bestDrivingTime || undefined,
      routeFacilities: form.routeFacilities ? form.routeFacilities.split(",").map((f) => f.trim()).filter(Boolean) : undefined,
      mapsEmbedUrl: form.mapsEmbedUrl || undefined, drivingSafetyTips: form.drivingSafetyTips || undefined, culinaryNotes: form.culinaryNotes || undefined,
      coverImage: form.coverImage || undefined, isPublished: form.isPublished,
      promptGambar: form.promptGambar || undefined,
      coverImagePrompt: form.coverImagePrompt || undefined,
      stops: stops.filter((s) => s.spotSlug).map((s) => ({ stopNumber: s.stopNumber, spotSlug: s.spotSlug })),
    }
    try { await api.admin.itineraries.update(slug, data as unknown as Record<string, unknown>); router.push("/admin/roadtrips") }
    catch (err) { toast.error("Error: " + (err as Error).message) }
    setSaving(false)
  }

  async function handleGenerateImage() {
    setGeneratingImage(true)
    setImagePrompt("")
    try {
      const res = await fetch("/api/ai/generate-image-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "roadtrip",
          title: form.title,
          description: form.culinaryNotes || form.drivingSafetyTips || "",
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error?.message || "Gagal generate prompt")
      setImagePrompt(json.data?.text || "")
      toast.success("Prompt gambar siap!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal generate prompt gambar")
    }
    setGeneratingImage(false)
  }

  function generateFacebookText(): string {
    const d = fullData || form
    const lines: string[] = []

    lines.push(`🚗 ROAD TRIP: ${d.title}`)
    lines.push(`⏱️ ${d.itineraryDuration || d.itineraryDuration}${d.totalDistance ? ` · 📏 ${d.totalDistance}` : ""}${d.estimatedCost ? ` · 💸 ${d.estimatedCost}` : ""}`)
    lines.push("")

    if (d.coverImage) {
      lines.push(`📸 COVER:`)
      lines.push(`🖼️ ${d.coverImage}`)
      lines.push("")
    }

    if (d.roadCondition) {
      lines.push(`🛣️ KONDISI JALAN:`)
      lines.push(`   ${d.roadCondition}`)
      lines.push("")
    }

    if (d.bestDrivingTime) {
      lines.push(`🌅 WAKTU TERBAIK:`)
      lines.push(`   ${d.bestDrivingTime}`)
      lines.push("")
    }

    if (d.routeFacilities && Array.isArray(d.routeFacilities) && d.routeFacilities.length > 0) {
      lines.push(`⛽ FASILITAS JALUR:`)
      lines.push(`   ${d.routeFacilities.join(", ")}`)
      lines.push("")
    }

    const stopsData = fullData?.stops || []
    if (stopsData.length > 0) {
      lines.push(`📍 DESTINASI (${stopsData.length} stop):`)
      lines.push("")
      stopsData.forEach((stop: any, i: number) => {
        const catEmojis: Record<string, string> = { alam: "🏔️", kuliner: "🍜", budaya: "🏛️", sejarah: "🏛️", petualangan: "🏞️", foto: "📸" }
        const emoji = catEmojis[stop.category] || "📍"
        lines.push(`${i + 1}. ${emoji} ${stop.name}${stop.category ? ` (${stop.category})` : ""}`)

        const infoParts: string[] = []
        if (stop.ticketPrice) infoParts.push(`🎟️ ${stop.ticketPrice}`)
        if (stop.parkingFee) infoParts.push(`🅿️ ${stop.parkingFee}`)
        if (stop.visitDuration) infoParts.push(`⏱️ ${stop.visitDuration}`)
        if (stop.bestVisitHour) infoParts.push(`🕐 ${stop.bestVisitHour}`)
        if (stop.physicalEffort) infoParts.push(`🏃 ${stop.physicalEffort}`)
        if (stop.rating) infoParts.push(`⭐ ${stop.rating}/5`)
        if (infoParts.length > 0) lines.push(`   ${infoParts.join(" | ")}`)

        if (stop.description) {
          const cleanDesc = stop.description.replace(/<[^>]+>/g, "").trim().slice(0, 250)
          lines.push(`   ${cleanDesc}`)
        }

        if (stop.spotImportantNote) {
          lines.push(`   ⚠️ ${stop.spotImportantNote.replace(/<[^>]+>/g, "").trim().slice(0, 150)}`)
        }

        if (stop.imageUrl) lines.push(`   🖼️ ${stop.imageUrl}`)

        // Handle images array (bisa berisi object {url} atau string)
        if (stop.images && stop.images.length > 0) {
          const imgUrls = stop.images.slice(0, 5).map((img: any) => typeof img === "string" ? img : (img.url || "")).filter(Boolean)
          if (imgUrls.length > 0) lines.push(`   📷 ${imgUrls.join(", ")}`)
        }

        // Nearby hotels with nested restaurants
        if (stop.nearbyHotels && stop.nearbyHotels.length > 0) {
          lines.push(`   🏨 Hotel Terdekat:`)
          stop.nearbyHotels.slice(0, 3).forEach((h: any) => {
            const hotelLine = `   • ${h.name}${h.distance ? ` (${h.distance})` : ""}${h.price ? ` — ${h.price}` : ""}`
            lines.push(hotelLine)
            if (h.nearby_restaurants && h.nearby_restaurants.length > 0) {
              h.nearby_restaurants.slice(0, 2).forEach((r: any) => {
                lines.push(`     🍜 ${r.name}${r.distance ? ` (${r.distance})` : ""}${r.price ? ` — ${r.price}` : ""}`)
              })
            }
          })
        }

        lines.push("")
      })
    }

    if (d.drivingSafetyTips) {
      lines.push(`⚠️ TIPS KESELAMATAN:`)
      lines.push(`   ${d.drivingSafetyTips}`)
      lines.push("")
    }

    if (d.culinaryNotes) {
      lines.push(`🍜 CATATAN KULINER:`)
      lines.push(`   ${d.culinaryNotes.replace(/\\n/g, "\n   ")}`)
      lines.push("")
    }

    lines.push(`🔗 Detail: ${SITE_URL}/roadtrip/${slug}`)

    return lines.join("\n")
  }

  async function handleCopy() {
    const text = generateFacebookText()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("Teks disalin! Tinggal paste ke Facebook")
      setTimeout(() => setCopied(false), 3000)
    } catch {
      toast.error("Gagal menyalin ke clipboard")
    }
  }

  if (loading) return <div className="py-12 text-center text-muted-foreground">Loading...</div>

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/roadtrips"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div><h1 className="text-2xl font-bold font-heading">Edit Roadtrip</h1><p className="text-muted-foreground">Atur urutan spot dalam roadtrip</p></div>
      </div>

      <ReadinessScore
        checks={[
          { label: "Judul", ok: !!form.title },
          { label: "Cover", ok: !!form.coverImage },
          { label: "Durasi", ok: !!form.itineraryDuration },
          { label: "Stops", ok: stops.length > 0 },
          { label: "Kondisi", ok: !!form.roadCondition },
          { label: "Publish", ok: form.isPublished },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Informasi Roadtrip</CardTitle><CardDescription>Data makro perjalanan</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Judul *</Label><Input value={form.title} onChange={(e) => updateField("title", e.target.value)} required /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label>Durasi</Label><Input value={form.itineraryDuration} onChange={(e) => updateField("itineraryDuration", e.target.value)} /></div>
              <div className="space-y-2"><Label>Jarak</Label><Input value={form.totalDistance} onChange={(e) => updateField("totalDistance", e.target.value)} /></div>
              <div className="space-y-2"><Label>Biaya</Label><Input value={form.estimatedCost} onChange={(e) => updateField("estimatedCost", e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Kondisi Jalan</Label><Input value={form.roadCondition} onChange={(e) => updateField("roadCondition", e.target.value)} /></div>
            <div className="space-y-2"><Label>Waktu Terbaik</Label><Input value={form.bestDrivingTime} onChange={(e) => updateField("bestDrivingTime", e.target.value)} /></div>
            <div className="space-y-2"><Label>Fasilitas Jalur</Label><Input value={form.routeFacilities} onChange={(e) => updateField("routeFacilities", e.target.value)} /></div>
            <div className="space-y-2"><Label>Maps Embed URL</Label><Input value={form.mapsEmbedUrl} onChange={(e) => updateField("mapsEmbedUrl", e.target.value)} /></div>
            <ImageUpload value={form.coverImage} onChange={(v) => updateField("coverImage", v)} label="Cover Banner" folder="cover" placeholder="https://pub-xxx.r2.dev/prod/cover/..." />
            <div className="pt-4 border-t border-border/50 space-y-4">
              <Button type="button" variant="outline" size="sm"
                onClick={handleGenerateImage} disabled={generatingImage || !form.title}
                className="gap-1.5 bg-white">
                {generatingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                {generatingImage ? "Generating..." : "🎨 Prompt Gambar"}
              </Button>
              {imagePrompt && (
                <div className="p-3 rounded-xl border border-border/50 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">🎨 Prompt untuk AI Image Generator</p>
                    <Button type="button" variant="ghost" size="sm" className="h-6 gap-1 text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(imagePrompt)
                        setCopiedPrompt(true)
                        setTimeout(() => setCopiedPrompt(false), 2000)
                        toast.success("Prompt tersalin!")
                      }}
                    >
                      {copiedPrompt ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      {copiedPrompt ? "Tersalin!" : "Copy"}
                    </Button>
                  </div>
                  <Textarea value={imagePrompt} readOnly rows={4} className="text-xs font-mono resize-none" />
                </div>
              )}
              <div className="space-y-2">
                <Label>AI Image Prompt (manual)</Label>
                <Textarea value={form.coverImagePrompt || form.promptGambar} onChange={(e) => updateField("coverImagePrompt", e.target.value)} placeholder="Prompt untuk generate gambar (cover image)" rows={3} className="text-xs font-mono" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div><CardTitle>Destinasi</CardTitle><CardDescription>Pilih spot yang akan dimasukkan ke roadtrip</CardDescription></div>
              <Button type="button" variant="outline" size="sm" onClick={addStop}><Plus className="mr-1 h-3 w-3" /> Tambah Stop</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {stops.map((stop) => (
              <div key={stop.key} className="rounded-xl border border-border/50 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{stop.stopNumber}</span>
                    <h4 className="font-medium font-heading">{stop.name || `Stop ${stop.stopNumber}`}</h4>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeStop(stop.key)}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <SpotSelect value={stop.spotSlug} onSelect={(slug, name) => handleSpotSelect(stop.key, slug, name)} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Catatan Tambahan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Tips Keselamatan</Label><Textarea value={form.drivingSafetyTips} onChange={(e) => updateField("drivingSafetyTips", e.target.value)} rows={2} /></div>
            <div className="space-y-2"><Label>Catatan Kuliner</Label><Textarea value={form.culinaryNotes} onChange={(e) => updateField("culinaryNotes", e.target.value)} rows={2} /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => updateField("isPublished", e.target.checked)} className="rounded" />
              <Label className="text-sm">Publikasikan</Label>
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Update</>}</Button>
          <Link href="/admin/roadtrips"><Button variant="outline">Cancel</Button></Link>
          <div className="flex-1" />
          <Button type="button" variant="outline" onClick={handleCopy}>
            {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Tersalin!" : "Copy untuk Facebook"}
          </Button>
          <Button type="button" variant="outline" onClick={() => window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${SITE_URL}/roadtrip/${slug}`)}`,
            "_blank", "width=600,height=400"
          )}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Share ke Facebook
          </Button>
        </div>
      </form>
    </div>
  )
}

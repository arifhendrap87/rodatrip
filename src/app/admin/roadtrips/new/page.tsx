"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SpotSelect } from "@/components/admin/SpotSelect"
import { toast } from "sonner"
import { RoadtripPreview } from "@/components/admin/RoadtripPreview"

interface StopForm {
  key: string
  stopNumber: number
  name: string
  spotSlug: string
}

let stopKeyCounter = 0

function createEmptyStop(stopNumber: number): StopForm {
  return { key: `stop-${++stopKeyCounter}`, stopNumber, name: "", spotSlug: "" }
}

export default function NewRoadtripPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: "", itineraryDuration: "", totalDistance: "", roadCondition: "",
    estimatedCost: "", bestDrivingTime: "", routeFacilities: "", mapsEmbedUrl: "",
    drivingSafetyTips: "", culinaryNotes: "", coverImage: "", isPublished: false,
  })
  const [stops, setStops] = useState<StopForm[]>([createEmptyStop(1)])

  function updateField(field: string, value: string | boolean) { setForm((f) => ({ ...f, [field]: value })) }
  function addStop() { setStops((prev) => [...prev, createEmptyStop(prev.length + 1)]) }
  function removeStop(key: string) { setStops((prev) => { const f = prev.filter((s) => s.key !== key); return f.map((s, i) => ({ ...s, stopNumber: i + 1 })) }) }
  function handleSpotSelect(key: string, slug: string, name: string) {
    setStops((prev) => prev.map((s) => s.key === key ? { ...s, spotSlug: slug, name: name || s.name } : s))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const data = {
      title: form.title, itineraryDuration: form.itineraryDuration || undefined,
      totalDistance: form.totalDistance || undefined, roadCondition: form.roadCondition || undefined,
      estimatedCost: form.estimatedCost || undefined, bestDrivingTime: form.bestDrivingTime || undefined,
      routeFacilities: form.routeFacilities ? form.routeFacilities.split(",").map((f) => f.trim()).filter(Boolean) : undefined,
      mapsEmbedUrl: form.mapsEmbedUrl || undefined, drivingSafetyTips: form.drivingSafetyTips || undefined,
      culinaryNotes: form.culinaryNotes || undefined, coverImage: form.coverImage || undefined,
      isPublished: form.isPublished,
      stops: stops.filter((s) => s.spotSlug).map((s) => ({ stopNumber: s.stopNumber, spotSlug: s.spotSlug })),
    }
    try {
      await api.admin.itineraries.create(data as unknown as Record<string, unknown>)
      router.push("/admin/roadtrips")
    } catch (err) { toast.error("Error: " + (err as Error).message) }
    setSaving(false)
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/roadtrips"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div><h1 className="text-2xl font-bold font-heading">New Roadtrip</h1><p className="text-muted-foreground">Pilih spot yang sudah ada untuk ditambahkan ke roadtrip</p></div>
      </div>
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
            <div className="space-y-2"><Label>Waktu Terbaik Berkendara</Label><Input value={form.bestDrivingTime} onChange={(e) => updateField("bestDrivingTime", e.target.value)} /></div>
            <div className="space-y-2"><Label>Fasilitas Jalur</Label><Input value={form.routeFacilities} onChange={(e) => updateField("routeFacilities", e.target.value)} /></div>
            <div className="space-y-2"><Label>Maps Embed URL</Label><Input value={form.mapsEmbedUrl} onChange={(e) => updateField("mapsEmbedUrl", e.target.value)} /></div>
            <div className="space-y-2"><Label>Cover Image</Label><Input value={form.coverImage} onChange={(e) => updateField("coverImage", e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div><CardTitle>Destinasi</CardTitle><CardDescription>Pilih spot yang akan dimasukkan ke roadtrip ini</CardDescription></div>
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
          <Button type="submit" disabled={saving}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Roadtrip</>}</Button>
          <Link href="/admin/roadtrips"><Button variant="outline">Cancel</Button></Link>
        </div>
      </form>
    </div>
  )
}

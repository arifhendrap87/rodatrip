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
import { SpotSelect } from "@/components/admin/SpotSelect"

interface StopForm {
  key: string
  stopNumber: number
  name: string
  visitDuration: string
  bestVisitHour: string
  additionalCost: string
  spotImportantNote: string
  spotSlug: string
}

let stopKeyCounter = 0

function createEmptyStop(stopNumber: number): StopForm {
  return {
    key: `stop-${++stopKeyCounter}`,
    stopNumber,
    name: "",
    visitDuration: "",
    bestVisitHour: "",
    additionalCost: "",
    spotImportantNote: "",
    spotSlug: "",
  }
}

export default function NewRoadtripPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: "",
    itineraryDuration: "",
    totalDistance: "",
    roadCondition: "",
    estimatedCost: "",
    bestDrivingTime: "",
    routeFacilities: "",
    mapsEmbedUrl: "",
    drivingSafetyTips: "",
    culinaryNotes: "",
    coverImage: "",
    isPublished: false,
  })
  const [stops, setStops] = useState<StopForm[]>([createEmptyStop(1)])

  function updateField(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function addStop() {
    setStops((prev) => [...prev, createEmptyStop(prev.length + 1)])
  }

  function removeStop(key: string) {
    setStops((prev) => {
      const filtered = prev.filter((s) => s.key !== key)
      return filtered.map((s, i) => ({ ...s, stopNumber: i + 1 }))
    })
  }

  function updateStop(key: string, field: string, value: string) {
    setStops((prev) =>
      prev.map((s) => (s.key === key ? { ...s, [field]: value } : s))
    )
  }

  function handleSpotSelect(key: string, slug: string, name: string) {
    setStops((prev) =>
      prev.map((s) =>
        s.key === key ? { ...s, spotSlug: slug, name: name || s.name } : s
      )
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const data = {
      title: form.title,
      itineraryDuration: form.itineraryDuration || undefined,
      totalDistance: form.totalDistance || undefined,
      roadCondition: form.roadCondition || undefined,
      estimatedCost: form.estimatedCost || undefined,
      bestDrivingTime: form.bestDrivingTime || undefined,
      routeFacilities: form.routeFacilities
        ? form.routeFacilities.split(",").map((f) => f.trim()).filter(Boolean)
        : undefined,
      mapsEmbedUrl: form.mapsEmbedUrl || undefined,
      drivingSafetyTips: form.drivingSafetyTips || undefined,
      culinaryNotes: form.culinaryNotes || undefined,
      coverImage: form.coverImage || undefined,
      isPublished: form.isPublished,
      stops: stops
        .filter((s) => s.name.trim())
        .map((s) => ({
          stopNumber: s.stopNumber,
          name: s.name,
          visitDuration: s.visitDuration || undefined,
          bestVisitHour: s.bestVisitHour || undefined,
          additionalCost: s.additionalCost || undefined,
          spotImportantNote: s.spotImportantNote || undefined,
          spotSlug: s.spotSlug || undefined,
        })),
    }

    try {
      await api.admin.itineraries.create(data as unknown as Record<string, unknown>)
      router.push("/admin/roadtrips")
    } catch (err) {
      alert("Error: " + (err as Error).message)
    }
    setSaving(false)
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/roadtrips">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-heading">New Roadtrip</h1>
          <p className="text-muted-foreground">
            Create a curated multi-stop road trip itinerary
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Roadtrip</CardTitle>
            <CardDescription>Data makro perjalanan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Roadtrip *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g. Road Trip Tasikmalaya: Menyusuri Jalur Pegunungan"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="itineraryDuration">Durasi Perjalanan</Label>
                <Input
                  id="itineraryDuration"
                  value={form.itineraryDuration}
                  onChange={(e) => updateField("itineraryDuration", e.target.value)}
                  placeholder="e.g. 3 Hari 2 Malam"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalDistance">Total Jarak</Label>
                <Input
                  id="totalDistance"
                  value={form.totalDistance}
                  onChange={(e) => updateField("totalDistance", e.target.value)}
                  placeholder="e.g. ± 140 km"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Estimasi Biaya</Label>
                <Input
                  id="estimatedCost"
                  value={form.estimatedCost}
                  onChange={(e) => updateField("estimatedCost", e.target.value)}
                  placeholder="e.g. Bensin: ± Rp 400.000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="roadCondition">Kondisi Jalan</Label>
              <Input
                id="roadCondition"
                value={form.roadCondition}
                onChange={(e) => updateField("roadCondition", e.target.value)}
                placeholder="e.g. Variatif (Pegunungan menanjak, Jalur lurus)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bestDrivingTime">Waktu Terbaik Berkendara</Label>
              <Input
                id="bestDrivingTime"
                value={form.bestDrivingTime}
                onChange={(e) => updateField("bestDrivingTime", e.target.value)}
                placeholder="e.g. Pagi hari (Hindari malam hari)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="routeFacilities">Fasilitas Jalur (comma-separated)</Label>
              <Input
                id="routeFacilities"
                value={form.routeFacilities}
                onChange={(e) => updateField("routeFacilities", e.target.value)}
                placeholder="SPBU, Rest Area, Bengkel 24 Jam, EV Charger"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mapsEmbedUrl">Google Maps Embed URL</Label>
              <Input
                id="mapsEmbedUrl"
                value={form.mapsEmbedUrl}
                onChange={(e) => updateField("mapsEmbedUrl", e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input
                id="coverImage"
                value={form.coverImage}
                onChange={(e) => updateField("coverImage", e.target.value)}
                placeholder="https://pub-...r2.dev/dev/spots/..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Destinasi (Stops)</CardTitle>
                <CardDescription>Urutan destinasi dalam roadtrip ini</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addStop}>
                <Plus className="mr-1 h-3 w-3" />
                Tambah Stop
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {stops.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada destinasi. Klik &quot;Tambah Stop&quot; untuk mulai.
              </p>
            )}

            {stops.map((stop) => (
              <div key={stop.key} className="rounded-xl border border-border/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {stop.stopNumber}
                    </span>
                    <h4 className="font-medium font-heading">{stop.name || `Stop ${stop.stopNumber}`}</h4>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive h-8 w-8"
                    onClick={() => removeStop(stop.key)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nama Destinasi *</Label>
                    <Input
                      value={stop.name}
                      onChange={(e) => updateStop(stop.key, "name", e.target.value)}
                      placeholder="e.g. Gunung Galunggung"
                    />
                  </div>

                  <SpotSelect
                    value={stop.spotSlug}
                    onSelect={(slug, name) => handleSpotSelect(stop.key, slug, name)}
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Estimasi Waktu Kunjungan</Label>
                      <Input
                        value={stop.visitDuration}
                        onChange={(e) => updateStop(stop.key, "visitDuration", e.target.value)}
                        placeholder="e.g. 2 - 3 Jam"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Waktu Terbaik Kunjungan</Label>
                      <Input
                        value={stop.bestVisitHour}
                        onChange={(e) => updateStop(stop.key, "bestVisitHour", e.target.value)}
                        placeholder="e.g. 06.00 - 09.00 WIB"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Biaya Tambahan</Label>
                      <Input
                        value={stop.additionalCost}
                        onChange={(e) => updateStop(stop.key, "additionalCost", e.target.value)}
                        placeholder="e.g. Ojek kawah: Rp 25.000"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Catatan Penting Pengendara</Label>
                    <Textarea
                      value={stop.spotImportantNote}
                      onChange={(e) => updateStop(stop.key, "spotImportantNote", e.target.value)}
                      placeholder="Peringatan khusus untuk pengendara..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catatan Tambahan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="drivingSafetyTips">Tips Keselamatan Berkendara</Label>
              <Textarea
                id="drivingSafetyTips"
                value={form.drivingSafetyTips}
                onChange={(e) => updateField("drivingSafetyTips", e.target.value)}
                placeholder="Tips keamanan untuk pengendara..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="culinaryNotes">Catatan Kuliner</Label>
              <Textarea
                id="culinaryNotes"
                value={form.culinaryNotes}
                onChange={(e) => updateField("culinaryNotes", e.target.value)}
                placeholder="Rekomendasi kuliner di sepanjang rute..."
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={form.isPublished}
                onChange={(e) => updateField("isPublished", e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isPublished" className="text-sm">Publikasikan segera</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Roadtrip
              </>
            )}
          </Button>
          <Link href="/admin/roadtrips">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}

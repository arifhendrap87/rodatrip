"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { api } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

interface StopForm {
  key: string
  stopNumber: number
  name: string
  category: string
  visitDuration: string
  bestVisitHour: string
  ticketPrice: string
  parkingFee: string
  additionalCost: string
  physicalEffort: string
  spotFacilities: string
  spotImportantNote: string
  description: string
  spotSlug: string
}

let stopKeyCounter = 0

function createEmptyStop(stopNumber: number): StopForm {
  return {
    key: `stop-${++stopKeyCounter}`,
    stopNumber,
    name: "",
    category: "",
    visitDuration: "",
    bestVisitHour: "",
    ticketPrice: "",
    parkingFee: "",
    additionalCost: "",
    physicalEffort: "",
    spotFacilities: "",
    spotImportantNote: "",
    description: "",
    spotSlug: "",
  }
}

function stopToForm(stop: any, index: number): StopForm {
  return {
    key: `stop-${++stopKeyCounter}`,
    stopNumber: index + 1,
    name: stop.name || "",
    category: stop.category || "",
    visitDuration: stop.visitDuration || stop.visit_duration || "",
    bestVisitHour: stop.bestVisitHour || stop.best_visit_hour || "",
    ticketPrice: stop.ticketPrice || stop.ticket_price || "",
    parkingFee: stop.parkingFee || stop.parking_fee || "",
    additionalCost: stop.additionalCost || stop.additional_cost || "",
    physicalEffort: stop.physicalEffort || stop.physical_effort || "",
    spotFacilities: Array.isArray(stop.spotFacilities || stop.spot_facilities)
      ? (stop.spotFacilities || stop.spot_facilities).join(", ")
      : "",
    spotImportantNote: stop.spotImportantNote || stop.spot_important_note || "",
    description: stop.description || "",
    spotSlug: stop.spotSlug || stop.spot_slug || "",
  }
}

export default function EditRoadtripPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const [loading, setLoading] = useState(true)
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
    isPublished: false,
  })
  const [stops, setStops] = useState<StopForm[]>([])

  useEffect(() => {
    async function load() {
      try {
        const res = await api.admin.itineraries.get(slug)
        const data = res.data as any
        setForm({
          title: data.title || "",
          itineraryDuration: data.itineraryDuration || data.itinerary_duration || "",
          totalDistance: data.totalDistance || data.total_distance || "",
          roadCondition: data.roadCondition || data.road_condition || "",
          estimatedCost: data.estimatedCost || data.estimated_cost || "",
          bestDrivingTime: data.bestDrivingTime || data.best_driving_time || "",
          routeFacilities: Array.isArray(data.routeFacilities || data.route_facilities)
            ? (data.routeFacilities || data.route_facilities).join(", ")
            : "",
          mapsEmbedUrl: data.mapsEmbedUrl || data.maps_embed_url || "",
          drivingSafetyTips: data.drivingSafetyTips || data.driving_safety_tips || "",
          culinaryNotes: data.culinaryNotes || data.culinary_notes || "",
          isPublished: data.isPublished || data.is_published || false,
        })
        setStops(
          (data.stops || []).map((s: any, i: number) => stopToForm(s, i))
        )
      } catch {
        alert("Failed to load itinerary")
        router.push("/admin/roadtrips")
      }
      setLoading(false)
    }
    load()
  }, [slug, router])

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
      isPublished: form.isPublished,
      stops: stops
        .filter((s) => s.name.trim())
        .map((s) => ({
          stopNumber: s.stopNumber,
          name: s.name,
          category: s.category || undefined,
          visitDuration: s.visitDuration || undefined,
          bestVisitHour: s.bestVisitHour || undefined,
          ticketPrice: s.ticketPrice || undefined,
          parkingFee: s.parkingFee || undefined,
          additionalCost: s.additionalCost || undefined,
          physicalEffort: s.physicalEffort || undefined,
          spotFacilities: s.spotFacilities
            ? s.spotFacilities.split(",").map((f) => f.trim()).filter(Boolean)
            : undefined,
          spotImportantNote: s.spotImportantNote || undefined,
          description: s.description || undefined,
          spotSlug: s.spotSlug || undefined,
        })),
    }

    try {
      await api.admin.itineraries.update(slug, data as unknown as Record<string, unknown>)
      router.push("/admin/roadtrips")
    } catch (err) {
      alert("Error: " + (err as Error).message)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Loading...
      </div>
    )
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
          <h1 className="text-2xl font-bold font-heading">Edit Roadtrip</h1>
          <p className="text-muted-foreground">
            Update curated road trip itinerary
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalDistance">Total Jarak</Label>
                <Input
                  id="totalDistance"
                  value={form.totalDistance}
                  onChange={(e) => updateField("totalDistance", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Estimasi Biaya</Label>
                <Input
                  id="estimatedCost"
                  value={form.estimatedCost}
                  onChange={(e) => updateField("estimatedCost", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="roadCondition">Kondisi Jalan</Label>
              <Input
                id="roadCondition"
                value={form.roadCondition}
                onChange={(e) => updateField("roadCondition", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bestDrivingTime">Waktu Terbaik Berkendara</Label>
              <Input
                id="bestDrivingTime"
                value={form.bestDrivingTime}
                onChange={(e) => updateField("bestDrivingTime", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="routeFacilities">Fasilitas Jalur (comma-separated)</Label>
              <Input
                id="routeFacilities"
                value={form.routeFacilities}
                onChange={(e) => updateField("routeFacilities", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mapsEmbedUrl">Google Maps Embed URL</Label>
              <Input
                id="mapsEmbedUrl"
                value={form.mapsEmbedUrl}
                onChange={(e) => updateField("mapsEmbedUrl", e.target.value)}
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
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nama Destinasi *</Label>
                      <Input
                        value={stop.name}
                        onChange={(e) => updateStop(stop.key, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Kategori</Label>
                      <Input
                        value={stop.category}
                        onChange={(e) => updateStop(stop.key, "category", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Estimasi Waktu Kunjungan</Label>
                      <Input
                        value={stop.visitDuration}
                        onChange={(e) => updateStop(stop.key, "visitDuration", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Waktu Terbaik Kunjungan</Label>
                      <Input
                        value={stop.bestVisitHour}
                        onChange={(e) => updateStop(stop.key, "bestVisitHour", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Harga Tiket</Label>
                      <Input
                        value={stop.ticketPrice}
                        onChange={(e) => updateStop(stop.key, "ticketPrice", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Biaya Parkir</Label>
                      <Input
                        value={stop.parkingFee}
                        onChange={(e) => updateStop(stop.key, "parkingFee", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Biaya Tambahan</Label>
                      <Input
                        value={stop.additionalCost}
                        onChange={(e) => updateStop(stop.key, "additionalCost", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Tingkat Effort Fisik</Label>
                      <Input
                        value={stop.physicalEffort}
                        onChange={(e) => updateStop(stop.key, "physicalEffort", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Fasilitas (comma-separated)</Label>
                      <Input
                        value={stop.spotFacilities}
                        onChange={(e) => updateStop(stop.key, "spotFacilities", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Spot Slug</Label>
                      <Input
                        value={stop.spotSlug}
                        onChange={(e) => updateStop(stop.key, "spotSlug", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Catatan Penting Pengendara</Label>
                    <Input
                      value={stop.spotImportantNote}
                      onChange={(e) => updateStop(stop.key, "spotImportantNote", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Deskripsi</Label>
                    <Textarea
                      value={stop.description}
                      onChange={(e) => updateStop(stop.key, "description", e.target.value)}
                      rows={3}
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
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="culinaryNotes">Catatan Kuliner</Label>
              <Textarea
                id="culinaryNotes"
                value={form.culinaryNotes}
                onChange={(e) => updateField("culinaryNotes", e.target.value)}
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
              <Label htmlFor="isPublished" className="text-sm">Publikasikan</Label>
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
                Update Roadtrip
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

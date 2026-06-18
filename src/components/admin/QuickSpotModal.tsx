"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"

interface QuickSpotModalProps {
  open: boolean
  defaultName: string
  onClose: () => void
  onCreated: (slug: string, name: string) => void
}

const CATEGORIES = [
  { value: "alam", label: "⛰️ Alam & Petualangan" },
  { value: "kuliner", label: "🍜 Kuliner" },
  { value: "budaya", label: "🏛️ Sejarah & Budaya" },
  { value: "foto", label: "📸 Spot Fotografi" },
  { value: "petualangan", label: "🏞️ Petualangan" },
  { value: "sejarah", label: "🏛️ Sejarah & Budaya" },
]

export function QuickSpotModal({ open, defaultName, onClose, onCreated }: QuickSpotModalProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: defaultName,
    category: "alam",
    province: "",
    lat: "",
    lng: "",
    ticket_price: "",
    parking_fee: "",
    opening_hours: "",
    best_visit_hour: "",
    visit_duration: "",
    additional_cost: "",
    spot_important_note: "",
    physical_effort: "",
    road_access: "",
    rating: "",
    image_url: "",
    facilities: "",
    description: "",
    tips: "",
  })

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError("Nama wajib diisi"); return }
    if (!form.province.trim()) { setError("Provinsi wajib diisi"); return }

    setSaving(true)
    setError("")

    try {
      const body = {
        name: form.name.trim(),
        category: form.category,
        province: form.province.trim(),
        region: "Jawa",
        description: form.description.trim() || `${form.name.trim()} — destinasi wisata di ${form.province.trim()}.`,
        whySpecial: "",
        location: {
          lat: form.lat ? parseFloat(form.lat) : 0,
          lng: form.lng ? parseFloat(form.lng) : 0,
        },
        ticketPrice: form.ticket_price || undefined,
        parkingFee: form.parking_fee || undefined,
        openingHours: form.opening_hours || undefined,
        bestVisitHour: form.best_visit_hour || undefined,
        visitDuration: form.visit_duration || undefined,
        additionalCost: form.additional_cost || undefined,
        spotImportantNote: form.spot_important_note || undefined,
        physicalEffort: form.physical_effort || undefined,
        roadAccess: form.road_access || undefined,
        rating: form.rating ? parseFloat(form.rating) : undefined,
        imageUrl: form.image_url || undefined,
        facilities: form.facilities ? form.facilities.split(",").map((f) => f.trim()).filter(Boolean) : [],
        tags: [],
        imageCredit: "Unsplash",
        tips: form.tips || undefined,
        distanceFromCity: "",
        isFeatured: false,
      }

      const res = await fetch("/api/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.message || "Gagal membuat spot")

      const slug = json.data?.slug || json.data?.id
      onCreated(slug, form.name.trim())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal membuat spot")
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Buat Spot Baru</DialogTitle>
          <DialogDescription>Spot akan langsung ter-link ke stop ini setelah dibuat.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nama Destinasi *</Label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Nama destinasi" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Kategori *</Label>
              <select value={form.category} onChange={(e) => update("category", e.target.value)} className="h-10 w-full rounded-xl border border-border/50 bg-background px-3 text-sm">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Provinsi *</Label>
              <Input value={form.province} onChange={(e) => update("province", e.target.value)} placeholder="Jawa Barat" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Latitude</Label>
              <Input value={form.lat || ""} onChange={(e) => update("lat", e.target.value)} placeholder="-7.2500" type="number" step="any" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Longitude</Label>
              <Input value={form.lng || ""} onChange={(e) => update("lng", e.target.value)} placeholder="108.0667" type="number" step="any" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">💰 Harga Tiket</Label>
              <Input value={form.ticket_price} onChange={(e) => update("ticket_price", e.target.value)} placeholder="Rp 15.000" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">🅿️ Biaya Parkir</Label>
              <Input value={form.parking_fee} onChange={(e) => update("parking_fee", e.target.value)} placeholder="Motor: Rp 5.000" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">🚪 Jam Buka</Label>
              <Input value={form.opening_hours} onChange={(e) => update("opening_hours", e.target.value)} placeholder="06.00 - 17.00 WIB" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">⏱️ Durasi Kunjungan</Label>
              <Input value={form.visit_duration} onChange={(e) => update("visit_duration", e.target.value)} placeholder="2 - 3 Jam" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">🕐 Waktu Terbaik</Label>
              <Input value={form.best_visit_hour} onChange={(e) => update("best_visit_hour", e.target.value)} placeholder="08.00 - 11.00 WIB" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">🏃 Effort Fisik</Label>
              <Input value={form.physical_effort} onChange={(e) => update("physical_effort", e.target.value)} placeholder="Ringan / Sedang / Berat" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">💸 Biaya Tambahan</Label>
              <Input value={form.additional_cost} onChange={(e) => update("additional_cost", e.target.value)} placeholder="Ojek kawah Rp 25.000" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">⚠️ Catatan Penting</Label>
              <Input value={form.spot_important_note} onChange={(e) => update("spot_important_note", e.target.value)} placeholder="Catatan untuk pengendara" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">⭐ Rating</Label>
              <Input value={form.rating || ""} onChange={(e) => update("rating", e.target.value)} placeholder="4.5" type="number" step="0.1" min="0" max="5" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">🚗 Akses Jalan</Label>
              <Input value={form.road_access} onChange={(e) => update("road_access", e.target.value)} placeholder="Aspal mulus, parkir luas" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Fasilitas (comma-separated)</Label>
            <Input value={form.facilities} onChange={(e) => update("facilities", e.target.value)} placeholder="Parkir, Toilet, Mushola, Warung" />
          </div>

            <ImageUpload value={form.image_url} onChange={(v) => update("image_url", v)} label="🖼️ Gambar" folder="spots" placeholder="https://pub-xxx.r2.dev/prod/spots/..." />

          <div className="space-y-1.5">
            <Label className="text-xs">Deskripsi</Label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={2} placeholder="Deskripsi destinasi..." />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">💡 Tips Pengunjung</Label>
            <Textarea value={form.tips} onChange={(e) => update("tips", e.target.value)} rows={2} placeholder="Tips untuk pengunjung..." />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : "Simpan Spot & Link"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

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
    ticket_price: "",
    facilities: "",
    description: "",
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
        location: { lat: 0, lng: 0 },
        ticketPrice: form.ticket_price || undefined,
        facilities: form.facilities ? form.facilities.split(",").map((f) => f.trim()).filter(Boolean) : [],
        tags: [],
        imageUrl: "",
        imageCredit: "Unsplash",
        tips: "",
        bestTime: "",
        openingHours: "",
        estimatedTime: "",
        roadAccess: "",
        distanceFromCity: "",
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
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">Buat Spot Baru</DialogTitle>
          <DialogDescription>Spot akan langsung ter-link ke stop ini setelah dibuat.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nama Destinasi *</Label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Nama destinasi" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Kategori *</Label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="h-10 w-full rounded-xl border border-border/50 bg-background px-3 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Provinsi *</Label>
            <Input value={form.province} onChange={(e) => update("province", e.target.value)} placeholder="e.g. Banten" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Harga Tiket</Label>
              <Input value={form.ticket_price} onChange={(e) => update("ticket_price", e.target.value)} placeholder="e.g. Rp 15.000" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Fasilitas (comma-separated)</Label>
              <Input value={form.facilities} onChange={(e) => update("facilities", e.target.value)} placeholder="Parkir, Toilet, Warung" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Deskripsi</Label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={2} placeholder="Deskripsi singkat..." />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
              ) : (
                "Simpan Spot & Link"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Save,
  Loader2,
  Sparkles,
  Copy,
  Check,
  ImageIcon,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import TiptapEditor from "@/components/ui/tiptap/tiptap-editor"
import { ImageUpload } from "@/components/ui/image-upload"
import { ImageGallery, type GalleryImage } from "@/components/admin/ImageGallery"
import { toast } from "sonner"

const CATEGORIES = [
  { value: "alam", label: "Alam" },
  { value: "kuliner", label: "Kuliner" },
  { value: "budaya", label: "Budaya" },
  { value: "foto", label: "Spot Foto" },
  { value: "petualangan", label: "Petualangan" },
  { value: "sejarah", label: "Sejarah" },
  { value: "hotel", label: "Hotel" },
  { value: "restaurant", label: "Restoran" },
]

export default function NewSpotPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [imagePrompt, setImagePrompt] = useState("")
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [provinceList, setProvinceList] = useState<{ code: string; name: string }[]>([])
  const [cityList, setCityList] = useState<{ code: string; name: string }[]>([])
  const [provCode, setProvCode] = useState("32")
  const [loadingProv, setLoadingProv] = useState(true)
  const [loadingCity, setLoadingCity] = useState(false)

  useEffect(() => {
    fetch("/api/regions/provinces")
      .then((r) => r.json())
      .then((json) => {
        const list = (json.data || []) as { code: string; name: string }[]
        setProvinceList(list)
        const jabar = list.find((p) => p.code === "32")
        if (jabar) {
          setProvCode(jabar.code)
          setForm((f) => ({ ...f, province: jabar.name }))
        }
        setLoadingProv(false)
      })
      .catch(() => setLoadingProv(false))
  }, [])

  useEffect(() => {
    if (!provCode) return
    setLoadingCity(true)
    fetch(`/api/regions/regencies/${provCode}`)
      .then((r) => r.json())
      .then((json) => {
        const list = (json.data || []) as { code: string; name: string }[]
        setCityList(list)
        setLoadingCity(false)
      })
      .catch(() => { setCityList([]); setLoadingCity(false) })
  }, [provCode])

  const [form, setForm] = useState({
    name: "", slug: "", category: "alam", province: "Jawa Barat",
    city: "",
    region: "Jawa", lat: "", lng: "",
    description: "", why_special: "", tips: "",
    rating: "4.5", best_time: "", opening_hours: "",
    estimated_time: "", ticket_price: "", parking_fee: "",
    road_access: "", physical_effort: "",
    visit_duration: "", best_visit_hour: "",
    additional_cost: "", spot_important_note: "",
    facilities: "", distance_from_city: "",
    tags: "", image_url: "", is_featured: false,
    prompt_gambar: "",
    image_prompt: "",
    images: [] as GalleryImage[],
    nearbyHotels: [] as any[],
    nearbyRestaurants: [] as any[],
  })

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  function handleNameChange(value: string) {
    setForm((f) => ({
      ...f,
      name: value,
      slug: generateSlug(value),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const spotData = {
      slug: form.slug || generateSlug(form.name),
      name: form.name,
      category: form.category,
      province: form.province,
      city: form.city || undefined,
      region: form.region,
      location: { lat: parseFloat(form.lat) || 0, lng: parseFloat(form.lng) || 0 },
      description: form.description,
      whySpecial: form.why_special,
      tips: form.tips,
      rating: parseFloat(form.rating) || undefined,
      bestTime: form.best_time,
      openingHours: form.opening_hours,
      estimatedTime: form.estimated_time,
      ticketPrice: form.ticket_price,
      parkingFee: form.parking_fee,
      visitDuration: form.visit_duration,
      bestVisitHour: form.best_visit_hour,
      additionalCost: form.additional_cost,
      spotImportantNote: form.spot_important_note,
      physicalEffort: form.physical_effort,
      roadAccess: form.road_access,
      facilities: form.facilities.split(",").map((f) => f.trim()).filter(Boolean),
      distanceFromCity: form.distance_from_city,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      isFeatured: form.is_featured,
      imageUrl: form.image_url || "",
      imageCredit: "Unsplash",
      promptGambar: form.prompt_gambar || undefined,
      imagePrompt: form.image_prompt || undefined,
      nearbyHotels: form.nearbyHotels?.length > 0 ? form.nearbyHotels : undefined,
      nearbyRestaurants: form.nearbyRestaurants?.length > 0 ? form.nearbyRestaurants : undefined,
      images: form.images.length > 0 ? form.images.map((img, i) => ({ ...img, sort_order: i })) : undefined,
    }

    try {
      await api.spots.create(spotData as unknown as Record<string, unknown>)
      router.push("/admin/spots")
    } catch (err) {
      toast.error("Error: " + (err as Error).message)
    }
    setSaving(false)
  }

  const [generatingField, setGeneratingField] = useState<string | null>(null)

  async function handleGenerate(field: "description" | "why_special" | "tips") {
    if (!form.name) {
      toast.error("Isi nama spot dulu")
      return
    }
    setGeneratingField(field)
    try {
      const promptMap: Record<string, string> = {
        description: `Buatkan deskripsi menarik tentang spot "${form.name}" (kategori: ${form.category}) untuk website roadtrip. Format HTML, 2-3 paragraf, ton informatif dan engaging. Jangan pakai H1.`,
        why_special: `Buatkan alasan kenapa "${form.name}" spesial dan wajib dikunjungi. Format HTML, 1-2 paragraf, singkat dan persuasif.`,
        tips: `Buatkan tips praktis untuk pengunjung "${form.name}". Format HTML menggunakan <ul>/<li>, 3-5 tips.`,
      }
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: promptMap[field] }] }),
      })
      if (!res.ok) throw new Error("Gagal")
      const json = await res.json()
      setForm((f) => ({ ...f, [field]: json.data.reply }))
      toast.success("Konten berhasil digenerate!")
    } catch {
      toast.error("Gagal generate konten")
    }
    setGeneratingField(null)
  }

  async function handleGenerateImage() {
    setGeneratingImage(true)
    setImagePrompt("")
    try {
      const res = await fetch("/api/ai/generate-image-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "spot",
          title: form.name,
          category: form.category,
          description: form.description,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error?.message || "Gagal generate prompt")
      setForm((f: any) => ({ ...f, image_prompt: json.data?.text || "", prompt_gambar: json.data?.text || "" }))
      toast.success("Prompt gambar siap!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal generate prompt gambar")
    }
    setGeneratingImage(false)
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/spots">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-heading">New Spot</h1>
          <p className="text-muted-foreground">
            Create a new destination guide
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Kawah Putih Ciwidey"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: generateSlug(e.target.value) }))
                  }
                  placeholder="auto-generated"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => v && setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Province *</Label>
              <Select
                value={form.province}
                onValueChange={(v) => {
                  if (!v) return
                  setForm((f) => ({ ...f, province: v, city: "" }))
                  const prov = provinceList.find((p) => p.name === v)
                  if (prov) setProvCode(prov.code)
                }}
                disabled={loadingProv}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingProv ? "Memuat..." : "Select province"} />
                </SelectTrigger>
                <SelectContent>
                  {loadingProv ? (
                    <SelectItem value="loading" disabled>Memuat...</SelectItem>
                  ) : (
                    provinceList.map((p) => (
                      <SelectItem key={p.code} value={p.name}>{p.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City / Regency</Label>
              <Select
                value={form.city}
                onValueChange={(v) => v && setForm((f) => ({ ...f, city: v }))}
                disabled={loadingCity || cityList.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingCity ? "Memuat..." : cityList.length === 0 ? "Pilih provinsi dulu" : "Pilih kota"} />
                </SelectTrigger>
                <SelectContent>
                  {loadingCity ? (
                    <SelectItem value="loading" disabled>Memuat...</SelectItem>
                  ) : cityList.length === 0 ? (
                    <SelectItem value="" disabled>Pilih provinsi dulu</SelectItem>
                  ) : (
                    cityList.map((c) => (
                      <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={form.rating}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, rating: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="featured">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, is_featured: e.target.checked }))
                    }
                    className="mr-2"
                  />
                  Featured Spot
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="0.0001"
                  value={form.lat}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lat: e.target.value }))
                  }
                  placeholder="-7.1660"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  type="number"
                  step="0.0001"
                  value={form.lng}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lng: e.target.value }))
                  }
                  placeholder="107.4042"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select
                  value={form.region}
                  onValueChange={(v) => v && setForm((f) => ({ ...f, region: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Jawa">Jawa</SelectItem>
                    <SelectItem value="Sumatera">Sumatera</SelectItem>
                    <SelectItem value="Bali & Nusa Tenggara">Bali & Nusa Tenggara</SelectItem>
                    <SelectItem value="Sulawesi">Sulawesi</SelectItem>
                    <SelectItem value="Kalimantan">Kalimantan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="distance">Distance from City</Label>
                <Input
                  id="distance"
                  value={form.distance_from_city}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, distance_from_city: e.target.value }))
                  }
                  placeholder="e.g. 50 km dari Bandung (1,5 jam)"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Description *</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleGenerate("description")} disabled={generatingField !== null} className="gap-1 text-xs h-7">
                  {generatingField === "description" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  AI Generate
                </Button>
              </div>
              <TiptapEditor
                content={form.description}
                onChange={(html) => setForm((f) => ({ ...f, description: html }))}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Why Special</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleGenerate("why_special")} disabled={generatingField !== null} className="gap-1 text-xs h-7">
                  {generatingField === "why_special" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  AI Generate
                </Button>
              </div>
              <TiptapEditor
                content={form.why_special}
                onChange={(html) => setForm((f) => ({ ...f, why_special: html }))}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Tips</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleGenerate("tips")} disabled={generatingField !== null} className="gap-1 text-xs h-7">
                  {generatingField === "tips" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  AI Generate
                </Button>
              </div>
              <TiptapEditor
                content={form.tips}
                onChange={(html) => setForm((f) => ({ ...f, tips: html }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="best_time">Best Time to Visit</Label>
                <Input
                  id="best_time"
                  value={form.best_time}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, best_time: e.target.value }))
                  }
                  placeholder="e.g. Pagi (07:00-11:00)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opening_hours">Opening Hours</Label>
                <Input
                  id="opening_hours"
                  value={form.opening_hours}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, opening_hours: e.target.value }))
                  }
                  placeholder="e.g. 07:00 - 17:00 WIB"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated_time">Estimated Time</Label>
                <Input
                  id="estimated_time"
                  value={form.estimated_time}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, estimated_time: e.target.value }))
                  }
                  placeholder="e.g. 2-3 jam"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket_price">Ticket Price</Label>
                <Input
                  id="ticket_price"
                  value={form.ticket_price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ticket_price: e.target.value }))
                  }
                  placeholder="e.g. Rp 25.000 - 50.000"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="road_access">Road Access</Label>
                <Input
                  id="road_access"
                  value={form.road_access}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, road_access: e.target.value }))
                  }
                  placeholder="e.g. Mobil & Motor — aspal mulus"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parking_fee">🅿️ Parking Fee</Label>
                <Input id="parking_fee" value={form.parking_fee} onChange={(e) => setForm((f) => ({ ...f, parking_fee: e.target.value }))} placeholder="Motor: Rp 5.000 | Mobil: Rp 15.000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="physical_effort">🏃 Physical Effort</Label>
                <Input id="physical_effort" value={form.physical_effort} onChange={(e) => setForm((f) => ({ ...f, physical_effort: e.target.value }))} placeholder="Ringan / Sedang / Berat" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visit_duration">⏱️ Visit Duration</Label>
                <Input id="visit_duration" value={form.visit_duration} onChange={(e) => setForm((f) => ({ ...f, visit_duration: e.target.value }))} placeholder="2 - 3 Jam" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="best_visit_hour">🕐 Best Visit Hour</Label>
                <Input id="best_visit_hour" value={form.best_visit_hour} onChange={(e) => setForm((f) => ({ ...f, best_visit_hour: e.target.value }))} placeholder="08.00 - 11.00 WIB" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="additional_cost">💸 Additional Cost</Label>
                <Input id="additional_cost" value={form.additional_cost} onChange={(e) => setForm((f) => ({ ...f, additional_cost: e.target.value }))} placeholder="Ojek kawah Rp 25.000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spot_important_note">⚠️ Important Note</Label>
                <Input id="spot_important_note" value={form.spot_important_note} onChange={(e) => setForm((f) => ({ ...f, spot_important_note: e.target.value }))} placeholder="Catatan penting untuk pengendara" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facilities">Facilities (comma-separated)</Label>
                <Input
                  id="facilities"
                  value={form.facilities}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, facilities: e.target.value }))
                  }
                  placeholder="Parkir, Toilet, Mushola, Warung"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tags: e.target.value }))
                  }
                  placeholder="alam, foto, bandung"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gallery */}
        <Card>
          <CardHeader>
            <CardTitle>Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload value={form.image_url} onChange={(v) => setForm((f: any) => ({ ...f, image_url: v }))} label="🖼️ Cover Image" folder="spots" placeholder="https://pub-xxx.r2.dev/prod/spots/..." />
            <div className="mt-4">
              <ImageGallery
                images={form.images as GalleryImage[]}
                onChange={(v) => setForm((f: any) => ({ ...f, images: v }))}
                folder="spots"
              />
            </div>
            <div className="mt-6 pt-6 border-t border-border/50 space-y-4">
              <Button type="button" variant="outline" size="sm"
                onClick={handleGenerateImage} disabled={generatingImage || !form.name}
                className="gap-1.5 bg-white">
                {generatingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                {generatingImage ? "Generating..." : "🎨 Prompt Gambar"}
              </Button>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>AI Image Prompt (manual)</Label>
                  <button type="button"
                    onClick={() => { navigator.clipboard.writeText(form.image_prompt || form.prompt_gambar); toast.success("Prompt tersalin!") }}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                </div>
                <Textarea value={form.image_prompt || form.prompt_gambar} onChange={(e) => setForm((f) => ({ ...f, image_prompt: e.target.value, prompt_gambar: e.target.value }))} placeholder="Prompt untuk generate gambar" rows={3} className="text-xs font-mono" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🏨 Hotel & 🍜 Kuliner Terdekat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Hotel & Penginapan</p>
                <Button type="button" variant="outline" size="sm" onClick={() => setForm((f: any) => ({ ...f, nearbyHotels: [...(f.nearbyHotels || []), { name: "", distance: "", price: "", maps_url: "", nearby_restaurants: [] }] }))}>
                  + Tambah Hotel
                </Button>
              </div>
              {(form.nearbyHotels || []).map((h: any, i: number) => (
                <div key={i} className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 grid gap-2 sm:grid-cols-2">
                      <Input value={h.name} onChange={(e) => { const n = [...form.nearbyHotels]; n[i] = { ...n[i], name: e.target.value }; setForm((f: any) => ({ ...f, nearbyHotels: n })) }} placeholder="Nama hotel" className="h-8 text-sm" />
                      <Input value={h.distance || ""} onChange={(e) => { const n = [...form.nearbyHotels]; n[i] = { ...n[i], distance: e.target.value }; setForm((f: any) => ({ ...f, nearbyHotels: n })) }} placeholder="Jarak (contoh: 500 m)" className="h-8 text-sm" />
                      <Input value={h.price || ""} onChange={(e) => { const n = [...form.nearbyHotels]; n[i] = { ...n[i], price: e.target.value }; setForm((f: any) => ({ ...f, nearbyHotels: n })) }} placeholder="Harga (contoh: Rp 350rb/malam)" className="h-8 text-sm" />
                      <Input value={h.maps_url || ""} onChange={(e) => { const n = [...form.nearbyHotels]; n[i] = { ...n[i], maps_url: e.target.value }; setForm((f: any) => ({ ...f, nearbyHotels: n })) }} placeholder="Maps URL (opsional)" className="h-8 text-sm" />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0 h-8 w-8" onClick={() => setForm((f: any) => ({ ...f, nearbyHotels: f.nearbyHotels.filter((_: any, j: number) => j !== i) }))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="ml-4 border-l-2 border-blue-200 pl-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-blue-600">Restoran di hotel ini</p>
                      <Button type="button" variant="ghost" size="sm" className="h-6 text-xs"
                        onClick={() => {
                          const n = [...form.nearbyHotels]
                          n[i] = { ...n[i], nearby_restaurants: [...(n[i].nearby_restaurants || []), { name: "", distance: "", price: "", maps_url: "" }] }
                          setForm((f: any) => ({ ...f, nearbyHotels: n }))
                        }}>
                        + Tambah Resto
                      </Button>
                    </div>
                    {(h.nearby_restaurants || []).map((r: any, j: number) => (
                      <div key={j} className="flex items-start gap-2">
                        <div className="flex-1 grid gap-1 sm:grid-cols-4">
                          <Input value={r.name} onChange={(e) => { const n = [...form.nearbyHotels]; n[i].nearby_restaurants[j] = { ...n[i].nearby_restaurants[j], name: e.target.value }; setForm((f: any) => ({ ...f, nearbyHotels: n })) }} placeholder="Nama resto" className="h-7 text-xs" />
                          <Input value={r.distance || ""} onChange={(e) => { const n = [...form.nearbyHotels]; n[i].nearby_restaurants[j] = { ...n[i].nearby_restaurants[j], distance: e.target.value }; setForm((f: any) => ({ ...f, nearbyHotels: n })) }} placeholder="Jarak" className="h-7 text-xs" />
                          <Input value={r.price || ""} onChange={(e) => { const n = [...form.nearbyHotels]; n[i].nearby_restaurants[j] = { ...n[i].nearby_restaurants[j], price: e.target.value }; setForm((f: any) => ({ ...f, nearbyHotels: n })) }} placeholder="Harga" className="h-7 text-xs" />
                          <Input value={r.maps_url || ""} onChange={(e) => { const n = [...form.nearbyHotels]; n[i].nearby_restaurants[j] = { ...n[i].nearby_restaurants[j], maps_url: e.target.value }; setForm((f: any) => ({ ...f, nearbyHotels: n })) }} placeholder="Maps URL" className="h-7 text-xs" />
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0 h-7 w-7" onClick={() => {
                          const n = [...form.nearbyHotels]
                          n[i].nearby_restaurants = n[i].nearby_restaurants.filter((_: any, k: number) => k !== j)
                          setForm((f: any) => ({ ...f, nearbyHotels: n }))
                        }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border/30 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Kuliner Terdekat (non-hotel)</p>
                <Button type="button" variant="outline" size="sm" onClick={() => setForm((f: any) => ({ ...f, nearbyRestaurants: [...(f.nearbyRestaurants || []), { name: "", distance: "", price: "", maps_url: "" }] }))}>
                  + Tambah Resto
                </Button>
              </div>
              {(form.nearbyRestaurants || []).map((r: any, i: number) => (
                <div key={i} className="flex items-start gap-2 rounded-xl border border-orange-100 bg-orange-50/50 p-3">
                  <div className="flex-1 grid gap-2 sm:grid-cols-4">
                    <Input value={r.name} onChange={(e) => { const n = [...form.nearbyRestaurants]; n[i] = { ...n[i], name: e.target.value }; setForm((f: any) => ({ ...f, nearbyRestaurants: n })) }} placeholder="Nama resto" className="h-8 text-sm" />
                    <Input value={r.distance || ""} onChange={(e) => { const n = [...form.nearbyRestaurants]; n[i] = { ...n[i], distance: e.target.value }; setForm((f: any) => ({ ...f, nearbyRestaurants: n })) }} placeholder="Jarak" className="h-8 text-sm" />
                    <Input value={r.price || ""} onChange={(e) => { const n = [...form.nearbyRestaurants]; n[i] = { ...n[i], price: e.target.value }; setForm((f: any) => ({ ...f, nearbyRestaurants: n })) }} placeholder="Harga" className="h-8 text-sm" />
                    <Input value={r.maps_url || ""} onChange={(e) => { const n = [...form.nearbyRestaurants]; n[i] = { ...n[i], maps_url: e.target.value }; setForm((f: any) => ({ ...f, nearbyRestaurants: n })) }} placeholder="Maps URL" className="h-8 text-sm" />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0 h-8 w-8" onClick={() => setForm((f: any) => ({ ...f, nearbyRestaurants: f.nearbyRestaurants.filter((_: any, j: number) => j !== i) }))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
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
                Save Spot
              </>
            )}
          </Button>
          <Link href="/admin/spots">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}

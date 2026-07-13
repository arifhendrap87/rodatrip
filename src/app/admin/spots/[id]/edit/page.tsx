"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api/client"
import { parseLocation } from "@/lib/utils/location"
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
import { ArrowLeft, Save, Loader2, Trash2, Copy, Check, ImageIcon } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import TiptapEditor from "@/components/ui/tiptap/tiptap-editor"
import { ImageUpload } from "@/components/ui/image-upload"
import { ImageGallery, type GalleryImage } from "@/components/admin/ImageGallery"
import { toast } from "sonner"
import { ReadinessScore } from "@/components/ui/ReadinessScore"

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

export default function EditSpotPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [imagePrompt, setImagePrompt] = useState("")
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [provinceList, setProvinceList] = useState<{ code: string; name: string }[]>([])
  const [cityList, setCityList] = useState<{ code: string; name: string }[]>([])
  const [provCode, setProvCode] = useState("")
  const [loadingProv, setLoadingProv] = useState(true)
  const [loadingCity, setLoadingCity] = useState(false)

  useEffect(() => {
    fetch("/api/regions/provinces")
      .then((r) => r.json())
      .then((json) => {
        setProvinceList(json.data || [])
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
        setCityList(json.data || [])
        setLoadingCity(false)
      })
      .catch(() => { setCityList([]); setLoadingCity(false) })
  }, [provCode])

  const [form, setForm] = useState<any>({
    name: "", category: "", province: "", city: "", region: "",
    description: "", why_special: "", tips: "",
    rating: "", best_time: "", opening_hours: "",
    estimated_time: "", ticket_price: "", road_access: "",
    distance_from_city: "", facilities: "", tags: "",
    lat: "", lng: "", image_url: "", image_credit: "",
    prompt_gambar: "",
    image_prompt: "",
    is_featured: false,
    images: [],
  })

  useEffect(() => {
    const slug = params.id as string
    api.spots.get(slug)
      .then((res) => {
        const data = res.data
        if (data) {
          const prov = data.province || ""
          const provItem = provinceList.find((p) => p.name === prov)
          if (provItem) setProvCode(provItem.code)

          setForm({
            name: data.name || "",
            category: data.category || "",
            province: prov,
            city: data.city || "",
            region: data.region || "",
            description: data.description || "",
            why_special: data.why_special || "",
            tips: data.tips || "",
            rating: data.rating ?? "",
            best_time: data.best_time || "",
            opening_hours: data.opening_hours || "",
            estimated_time: data.estimated_time || "",
            ticket_price: data.ticket_price || "",
            parking_fee: data.parking_fee || "",
            road_access: data.road_access || "",
            physical_effort: data.physical_effort || "",
            visit_duration: data.visit_duration || "",
            best_visit_hour: data.best_visit_hour || "",
            additional_cost: data.additional_cost || "",
            spot_important_note: data.spot_important_note || "",
            distance_from_city: data.distance_from_city || "",
            facilities: ((data.facilities as string[]) || []).join(", "),
            tags: ((data.tags as string[]) || []).join(", "),
            lat: parseLocation(data.location)?.lat ?? "",
            lng: parseLocation(data.location)?.lng ?? "",
    image_url: data.image_url || "",
    image_credit: data.image_credit || "",
    prompt_gambar: data.prompt_gambar || "",
    image_prompt: (data as any).image_prompt || "",
            is_featured: data.is_featured || false,
            images: data.images || [],
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const updates = {
      name: form.name,
      category: form.category,
      province: form.province,
      city: form.city || undefined,
      region: form.region,
      description: form.description,
      whySpecial: form.why_special,
      tips: form.tips,
      rating: parseFloat(form.rating) || null,
      bestTime: form.best_time,
      openingHours: form.opening_hours,
      estimatedTime: form.estimated_time,
      ticketPrice: form.ticket_price,
      parkingFee: form.parking_fee,
      roadAccess: form.road_access,
      physicalEffort: form.physical_effort,
      visitDuration: form.visit_duration,
      bestVisitHour: form.best_visit_hour,
      additionalCost: form.additional_cost,
      spotImportantNote: form.spot_important_note,
      distanceFromCity: form.distance_from_city,
      location: { lat: parseFloat(form.lat) || 0, lng: parseFloat(form.lng) || 0 },
      facilities: form.facilities.split(",").map((f: string) => f.trim()).filter(Boolean),
      tags: form.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
      imageUrl: form.image_url,
      imageCredit: form.image_credit,
      promptGambar: form.prompt_gambar || undefined,
      imagePrompt: form.image_prompt || undefined,
      isFeatured: form.is_featured,
      images: form.images?.length > 0 ? form.images : undefined,
    }

    try {
      await api.spots.update(params.id as string, updates)
      router.push("/admin/spots")
    } catch (err) {
      toast.error("Error: " + (err as Error).message)
    }
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
          type: "spot",
          title: form.name,
          category: form.category,
          description: form.description,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
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
          <h1 className="text-2xl font-bold font-heading">Edit Spot</h1>
          <p className="text-muted-foreground">{form.name}</p>
        </div>
      </div>

      <ReadinessScore
        checks={[
          { label: "Nama", ok: !!form.name },
          { label: "Deskripsi", ok: !!form.description },
          { label: "Gambar", ok: !!form.image_url },
          { label: "Kategori", ok: !!form.category },
          { label: "Provinsi", ok: !!form.province },
          { label: "Koordinat", ok: !!form.lat && !!form.lng && parseFloat(form.lat) !== 0 },
          { label: "Rating", ok: parseFloat(form.rating) > 0 },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => v && setForm((f: any) => ({ ...f, category: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Province</Label>
                <Select
                  value={form.province}
                  onValueChange={(v) => {
                    if (!v) return
                    setForm((f: any) => ({ ...f, province: v, city: "" }))
                    const prov = provinceList.find((p) => p.name === v)
                    if (prov) setProvCode(prov.code)
                  }}
                  disabled={loadingProv}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingProv ? "Memuat..." : "Pilih provinsi"} />
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
                <Label>City / Regency</Label>
                <Select
                  value={form.city}
                  onValueChange={(v) => v && setForm((f: any) => ({ ...f, city: v }))}
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
                <Label>Rating</Label>
                <Input type="number" step="0.1" min="0" max="5" value={form.rating}
                  onChange={(e) => setForm((f: any) => ({ ...f, rating: e.target.value }))} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <TiptapEditor content={form.description || ""}
                onChange={(html) => setForm((f: any) => ({ ...f, description: html }))} />
            </div>
            <div className="space-y-2">
              <Label>Why Special</Label>
              <TiptapEditor content={form.why_special || ""}
                onChange={(html) => setForm((f: any) => ({ ...f, why_special: html }))} />
            </div>
            <div className="space-y-2">
              <Label>Tips</Label>
              <TiptapEditor content={form.tips || ""}
                onChange={(html) => setForm((f: any) => ({ ...f, tips: html }))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Best Time</Label>
                <Input value={form.best_time || ""}
                  onChange={(e) => setForm((f: any) => ({ ...f, best_time: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Opening Hours</Label>
                <Input value={form.opening_hours || ""}
                  onChange={(e) => setForm((f: any) => ({ ...f, opening_hours: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Ticket Price</Label>
                <Input value={form.ticket_price || ""}
                  onChange={(e) => setForm((f: any) => ({ ...f, ticket_price: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Parking Fee</Label>
                <Input value={form.parking_fee || ""}
                  onChange={(e) => setForm((f: any) => ({ ...f, parking_fee: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Distance</Label>
                <Input value={form.distance_from_city || ""}
                  onChange={(e) => setForm((f: any) => ({ ...f, distance_from_city: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Road Access</Label>
                <Input value={form.road_access || ""}
                  onChange={(e) => setForm((f: any) => ({ ...f, road_access: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Physical Effort</Label>
                <Input value={form.physical_effort || ""}
                  onChange={(e) => setForm((f: any) => ({ ...f, physical_effort: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Visit Duration</Label>
                <Input value={form.visit_duration || ""}
                  onChange={(e) => setForm((f: any) => ({ ...f, visit_duration: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Best Visit Hour</Label>
                <Input value={form.best_visit_hour || ""}
                  onChange={(e) => setForm((f: any) => ({ ...f, best_visit_hour: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Additional Cost</Label>
                <Input value={form.additional_cost || ""}
                  onChange={(e) => setForm((f: any) => ({ ...f, additional_cost: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Duration Estimate</Label>
                <Input value={form.estimated_time || ""}
                  onChange={(e) => setForm((f: any) => ({ ...f, estimated_time: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Spot Important Note</Label>
              <Input value={form.spot_important_note || ""}
                onChange={(e) => setForm((f: any) => ({ ...f, spot_important_note: e.target.value }))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input type="number" step="any" value={form.lat}
                  onChange={(e) => setForm((f: any) => ({ ...f, lat: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input type="number" step="any" value={form.lng}
                  onChange={(e) => setForm((f: any) => ({ ...f, lng: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Facilities (comma separated)</Label>
                <Input value={form.facilities || ""}
                  onChange={(e) => setForm((f: any) => ({ ...f, facilities: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input value={form.tags || ""}
                  onChange={(e) => setForm((f: any) => ({ ...f, tags: e.target.value }))} />
              </div>
            </div>
            <ImageUpload value={form.image_url} onChange={(v) => setForm((f: any) => ({ ...f, image_url: v }))} label="🖼️ Image" folder="spots" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageGallery
              images={form.images as GalleryImage[]}
              onChange={(v) => setForm((f: any) => ({ ...f, images: v }))}
              folder="spots"
            />
            <div className="mt-6 pt-6 border-t border-border/50 space-y-4">
              <Button type="button" variant="outline" size="sm"
                onClick={handleGenerateImage} disabled={generatingImage || !form.name}
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
                <Input value={form.image_prompt || form.prompt_gambar} onChange={(e) => setForm((f: any) => ({ ...f, image_prompt: e.target.value, prompt_gambar: e.target.value }))} placeholder="Prompt untuk generate gambar" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
            </Button>
            <Link href="/admin/spots">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
          </div>
          <Button variant="destructive" type="button"
            onClick={async () => {
              if (confirm("Delete this spot?")) {
                await api.spots.delete(params.id as string)
                router.push("/admin/spots")
              }
            }}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </form>
    </div>
  )
}

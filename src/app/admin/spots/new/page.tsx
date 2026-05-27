"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
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
} from "lucide-react"
import Link from "next/link"
import TiptapEditor from "@/components/ui/tiptap/tiptap-editor"

const CATEGORIES = [
  { value: "alam", label: "Alam" },
  { value: "kuliner", label: "Kuliner" },
  { value: "budaya", label: "Budaya" },
  { value: "foto", label: "Spot Foto" },
  { value: "petualangan", label: "Petualangan" },
  { value: "sejarah", label: "Sejarah" },
]

const PROVINCES = [
  "Jawa Barat", "Jawa Tengah", "DIY", "Jawa Timur",
  "Bali", "Sumatera Utara", "Sumatera Barat",
  "Sulawesi Utara", "Sulawesi Selatan",
  "Kalimantan Timur", "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
]

export default function NewSpotPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: "",
    province: "Jawa Barat",
    region: "Jawa",
    lat: "",
    lng: "",
    description: "",
    why_special: "",
    tips: "",
    rating: "4.5",
    best_time: "",
    opening_hours: "",
    estimated_time: "",
    ticket_price: "",
    road_access: "",
    facilities: "",
    distance_from_city: "",
    tags: "",
    is_featured: false,
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
      region: form.region,
      location: `POINT(${form.lng} ${form.lat})`,
      description: form.description,
      why_special: form.why_special,
      tips: form.tips,
      rating: parseFloat(form.rating),
      best_time: form.best_time,
      opening_hours: form.opening_hours,
      estimated_time: form.estimated_time,
      ticket_price: form.ticket_price,
      road_access: form.road_access,
      facilities: form.facilities.split(",").map((f) => f.trim()).filter(Boolean),
      distance_from_city: form.distance_from_city,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      is_featured: form.is_featured,
      image_url: "",
      image_credit: "Unsplash",
    }

    const { error } = await supabase.from("spots").insert([spotData])

    if (error) {
      alert("Error: " + error.message)
    } else {
      router.push("/admin/spots")
    }
    setSaving(false)
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
                  onValueChange={(v) => v && setForm((f) => ({ ...f, province: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVINCES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
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
              <Label>Description *</Label>
              <TiptapEditor
                content={form.description}
                onChange={(html) => setForm((f) => ({ ...f, description: html }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Why Special</Label>
              <TiptapEditor
                content={form.why_special}
                onChange={(html) => setForm((f) => ({ ...f, why_special: html }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Tips</Label>
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

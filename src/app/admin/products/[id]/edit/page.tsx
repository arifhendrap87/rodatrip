"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { api } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const CATEGORIES = [
  "Safety & Darurat", "Comfort", "Gadget & Mount",
  "Organizer", "Lifestyle & Merch", "Maintenance", "Bundle Hemat",
]

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "", slug: "", category: "", price: "", description: "", rating: "4.5",
    imageUrl: "", stockQuantity: "0",
    source: "", external_id: "", weight: "", dimensions: "", tokopedia_url: "",
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await api.products.get(params.id as string)
        const d = res.data as any
        setForm({
          name: d.name || "", slug: d.slug || "",
          category: d.category || "", price: d.price?.toString() || "", description: d.description || "",
          rating: d.rating?.toString() || "4.5", imageUrl: d.image_url || "",
          stockQuantity: d.stock_quantity?.toString() || "0",
          source: d.source || "", external_id: d.external_id || "",
          weight: d.weight?.toString() || "", dimensions: d.dimensions || "",
          tokopedia_url: d.tokopedia_url || "",
        })
      } catch { router.push("/admin/products") }
      setLoading(false)
    }
    load()
  }, [params.id, router])

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").trim()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.products.update(params.id as string, {
        name: form.name, slug: form.slug || generateSlug(form.name), category: form.category,
        price: parseInt(form.price), description: form.description, rating: parseFloat(form.rating),
        imageUrl: form.imageUrl || undefined,
        stockQuantity: form.stockQuantity ? parseInt(form.stockQuantity) : undefined,
        source: form.source || undefined,
        external_id: form.external_id || undefined,
        weight: form.weight ? parseInt(form.weight) : undefined,
        dimensions: form.dimensions || undefined,
        tokopedia_url: form.tokopedia_url || undefined,
      })
      router.push("/admin/products")
    } catch (err) {
      toast.error("Error: " + (err as Error).message)
    }
    setSaving(false)
  }

  if (loading) return <div className="py-12 text-center text-muted-foreground">Loading...</div>

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/products"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div><h1 className="text-2xl font-bold font-heading">Edit Product</h1></div>
      </div>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: generateSlug(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => v && setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price (Rp) *</Label>
                <Input type="number" required value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <Input type="number" step="0.1" value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm((f: any) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Sumber</Label>
                <Input value={form.source} onChange={(e) => setForm((f: any) => ({ ...f, source: e.target.value }))} placeholder="Jakmall" />
              </div>
              <div className="space-y-2">
                <Label>External ID (SKU)</Label>
                <Input value={form.external_id} onChange={(e) => setForm((f: any) => ({ ...f, external_id: e.target.value }))} placeholder="7RRSKBBK" />
              </div>
              <div className="space-y-2">
                <Label>Weight (gram)</Label>
                <Input type="number" value={form.weight} onChange={(e) => setForm((f: any) => ({ ...f, weight: e.target.value }))} placeholder="1500" />
              </div>
              <div className="space-y-2">
                <Label>Dimensions</Label>
                <Input value={form.dimensions} onChange={(e) => setForm((f: any) => ({ ...f, dimensions: e.target.value }))} placeholder="30 x 30 x 30 cm" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Tokopedia URL</Label>
                <Input value={form.tokopedia_url} onChange={(e) => setForm((f: any) => ({ ...f, tokopedia_url: e.target.value }))} placeholder="https://tokopedia.com/..." />
              </div>
            </div>
          </CardContent>
        </Card>
        <Button type="submit" disabled={saving}>
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
        </Button>
      </form>
    </div>
  )
}

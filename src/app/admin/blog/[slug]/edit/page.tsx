"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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
import { ArrowLeft, Save, Loader2, Sparkles, FileText, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function EditBlogPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generatingContent, setGeneratingContent] = useState(false)
  const [generatingSeo, setGeneratingSeo] = useState(false)

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image_url: "",
    category: "Tips",
    author: "RodaTrip",
    read_time: "5 min",
    tags: "",
    is_published: false,
  })

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then((r) => r.json())
      .then((json) => {
        const post = json.data
        if (post) {
          setForm({
            title: post.title || "",
            slug: post.slug || "",
            excerpt: post.excerpt || "",
            content: post.content || "",
            image_url: post.image_url || "",
            category: post.category || "Tips",
            author: post.author || "RodaTrip",
            read_time: post.read_time || "5 min",
            tags: (post.tags || []).join(", "),
            is_published: post.is_published || false,
          })
        }
        setLoading(false)
      })
      .catch(() => {
        toast.error("Gagal memuat blog")
        setLoading(false)
      })
  }, [slug])

  async function handleWriteContent() {
    setGeneratingContent(true)
    try {
      const res = await fetch("/api/ai/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "tulis",
          topic: form.title,
          existingData: {
            title: form.title,
            excerpt: form.excerpt,
            category: form.category,
          },
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error?.message || "Gagal generate konten")
      setForm((f) => ({ ...f, content: json.data?.text || "" }))
      toast.success("Konten berhasil digenerate!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal generate konten")
    }
    setGeneratingContent(false)
  }

  async function handleGenerateSeo() {
    setGeneratingSeo(true)
    try {
      const res = await fetch("/api/ai/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "seo",
          existingData: { title: form.title, excerpt: form.excerpt, content: form.content },
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error?.message || "Gagal generate SEO")
      const text = json.data?.text || ""
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        const seo = JSON.parse(match[0])
        setForm((f) => ({
          ...f,
          slug: seo.slug || f.slug,
          excerpt: seo.description || f.excerpt,
          tags: (seo.tags || []).join(", "),
        }))
        toast.success("SEO data berhasil digenerate!")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal generate SEO")
    }
    setGeneratingSeo(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/blog/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json?.error?.message || "Gagal simpan")
      }
      toast.success("Blog berhasil diupdate!")
      router.push("/admin/blog")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal simpan")
    }
    setSaving(false)
  }

  if (loading) return <div className="py-12 text-center text-muted-foreground">Memuat...</div>

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/blog">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-heading">Edit Blog</h1>
          <p className="text-muted-foreground">{form.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AI Assist */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Bantuan AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleWriteContent} disabled={generatingContent || !form.title} className="gap-1.5 bg-white">
                {generatingContent ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {generatingContent ? "Generating..." : "🤖 Bantu Tulis Ulang"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleGenerateSeo} disabled={generatingSeo || !form.title} className="gap-1.5 bg-white">
                {generatingSeo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generatingSeo ? "Generating..." : "✨ Generate SEO"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Fields */}
        <Card>
          <CardHeader><CardTitle>Detail Artikel</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Judul *</Label>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Textarea value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} rows={2} />
            </div>

            <div className="space-y-2">
              <Label>Konten (Markdown)</Label>
              <Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={20} className="font-mono text-sm" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={form.category} onValueChange={(v) => v && setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tips">Tips</SelectItem>
                    <SelectItem value="Inspirasi">Inspirasi</SelectItem>
                    <SelectItem value="Destinasi">Destinasi</SelectItem>
                    <SelectItem value="Tutorial">Tutorial</SelectItem>
                    <SelectItem value="Review">Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Author</Label>
                <Input value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Read Time</Label>
                <Input value={form.read_time} onChange={(e) => setForm((f) => ({ ...f, read_time: e.target.value }))} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Cover Image URL</Label>
                <Input value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))} className="rounded" />
              <Label className="text-sm">Publikasikan</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Update</>}
          </Button>
          <Link href="/admin/blog"><Button variant="outline">Cancel</Button></Link>
        </div>
      </form>
    </div>
  )
}

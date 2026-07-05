"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import TiptapEditor from "@/components/ui/tiptap/tiptap-editor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Loader2, Sparkles, FileText, Trash2, Image as ImageIcon, Copy, Check, Eye, ExternalLink, Tags as TagsIcon } from "lucide-react"
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
  const [generatingImage, setGeneratingImage] = useState(false)
  const [imagePrompt, setImagePrompt] = useState("")
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [fbCopied, setFbCopied] = useState(false)
  const [generatingTags, setGeneratingTags] = useState(false)

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
    fetch(`/api/admin/blog/${slug}`)
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

  async function handleGenerateImage() {
    setGeneratingImage(true)
    setImagePrompt("")
    try {
      const res = await fetch("/api/ai/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "gambar",
          topic: form.title,
          existingData: { title: form.title, category: form.category },
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

  function generateFbText(): string {
    const lines: string[] = []
    lines.push(`📖 BLOG: ${form.title}`)
    lines.push("")

    if (form.excerpt) {
      const clean = form.excerpt.replace(/<[^>]+>/g, "").slice(0, 300)
      lines.push(clean)
      lines.push("")
    } else if (form.content) {
      const clean = form.content.replace(/<[^>]+>/g, "").trim().slice(0, 300)
      lines.push(clean + "...")
      lines.push("")
    }

    lines.push(`📂 ${form.category}  •  ✍️ ${form.author}  •  ⏱️ ${form.read_time}`)
    lines.push("")
    lines.push(`🔗 Baca selengkapnya: ${window.location.origin}/blog/${slug}`)
    lines.push("")
    lines.push("#RodaTrip #Blog #Roadtrip")

    return lines.join("\n")
  }

  function handleFbCopy() {
    navigator.clipboard.writeText(generateFbText())
    setFbCopied(true)
    setTimeout(() => setFbCopied(false), 2000)
    toast.success("Teks Facebook tersalin!")
  }

  async function handleGenerateTags() {
    setGeneratingTags(true)
    try {
      const res = await fetch("/api/ai/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "tags",
          existingData: { title: form.title, category: form.category, excerpt: form.excerpt },
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error?.message || "Gagal generate tags")
      const text = json.data?.text || ""
      const match = text.match(/\[[\s\S]*\]/)
      if (match) {
        const tags = JSON.parse(match[0]) as string[]
        setForm((f) => ({ ...f, tags: tags.join(", ") }))
        toast.success(`${tags.length} tags berhasil digenerate!`)
      } else {
        toast.error("Gagal parse tags")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal generate tags")
    }
    setGeneratingTags(false)
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
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-heading">Edit Blog</h1>
          <p className="text-muted-foreground">{form.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/blog/preview/${slug}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleFbCopy}>
            {fbCopied ? <Check className="h-4 w-4 text-green-500" /> : <ExternalLink className="h-4 w-4" />}
            {fbCopied ? "Tersalin!" : "Copy FB"}
          </Button>
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
                {generatingSeo ? "Generating..." : "✨ SEO"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleGenerateImage} disabled={generatingImage || !form.title} className="gap-1.5 bg-white">
                {generatingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                {generatingImage ? "Generating..." : "🎨 Prompt Gambar"}
              </Button>
            </div>
            {imagePrompt && (
              <div className="mt-3 p-3 rounded-xl border border-border/50 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">🎨 Prompt untuk AI Image Generator</p>
                  <Button type="button" variant="ghost" size="sm" className="h-6 gap-1 text-xs"
                    onClick={() => { navigator.clipboard.writeText(imagePrompt); setCopiedPrompt(true); setTimeout(() => setCopiedPrompt(false), 2000); toast.success("Prompt tersalin!") }}
                  >
                    {copiedPrompt ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    {copiedPrompt ? "Tersalin!" : "Copy"}
                  </Button>
                </div>
                <Textarea value={imagePrompt} readOnly rows={4} className="text-xs font-mono resize-none" />
              </div>
            )}
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
              <Label>Konten</Label>
              <TiptapEditor content={form.content} onChange={(html) => setForm((f) => ({ ...f, content: html }))} />
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
                    <SelectItem value="Perawatan Mobil">Perawatan Mobil</SelectItem>
                    <SelectItem value="Kendaraan">Kendaraan</SelectItem>
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
                <div className="flex gap-2">
                  <Input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} className="flex-1" />
                  <Button type="button" variant="outline" size="sm" onClick={handleGenerateTags} disabled={generatingTags || !form.title} className="shrink-0 gap-1.5">
                    {generatingTags ? <Loader2 className="h-4 w-4 animate-spin" /> : <TagsIcon className="h-4 w-4" />}
                    {generatingTags ? "..." : "Generate"}
                  </Button>
                </div>
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

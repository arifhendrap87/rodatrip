"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import TiptapEditor from "@/components/ui/tiptap/tiptap-editor"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Loader2, Sparkles, Lightbulb, FileText, Check, Image as ImageIcon, Copy, Tags as TagsIcon } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export default function NewBlogPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [generatingIde, setGeneratingIde] = useState(false)
  const [generatingContent, setGeneratingContent] = useState(false)
  const [generatingSeo, setGeneratingSeo] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ideResults, setIdeResults] = useState<any[]>([])
  const [generatingImage, setGeneratingImage] = useState(false)
  const [imagePrompt, setImagePrompt] = useState("")
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [generatingTags, setGeneratingTags] = useState(false)

  const [aiTopic, setAiTopic] = useState("Tips Roadtrip")

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
    seo_title: "",
    meta_description: "",
    prompt_gambar: "",
    is_published: false,
  })

  function handleTitleChange(value: string) {
    setForm((f) => ({
      ...f,
      title: value,
      slug: f.slug || generateSlug(value),
    }))
  }

  async function handleGenerateIde() {
    setGeneratingIde(true)
    try {
      const res = await fetch("/api/ai/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ide", topic: aiTopic }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error?.message || "Gagal generate ide")

      const text = json.data?.text || ""
      const match = text.match(/\[[\s\S]*\]/)
      if (match) {
        const ideas = JSON.parse(match[0])
        setIdeResults(ideas)
        toast.success(`${ideas.length} ide berhasil digenerate!`)
      } else {
        toast.error("Gagal parse ide")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal generate ide")
    }
    setGeneratingIde(false)
  }

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

      const content = json.data?.text || ""
      setForm((f) => ({ ...f, content }))
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
          existingData: {
            title: form.title,
            excerpt: form.excerpt,
            content: form.content,
          },
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
      } else {
        toast.error("Gagal parse SEO data")
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
          topic: aiTopic,
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

  async function handleGenerateTags() {
    setGeneratingTags(true)
    try {
      const res = await fetch("/api/ai/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "tags",
          topic: aiTopic,
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

  function selectIdea(idea: any) {
    setForm((f) => ({
      ...f,
      title: idea.title || f.title,
      slug: generateSlug(idea.title || f.title),
      excerpt: idea.excerpt || f.excerpt,
      category: idea.category || f.category,
    }))
    setIdeResults([])
    toast.success("Ide dipilih — edit manual jika perlu")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          is_published: form.is_published,
        }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json?.error?.message || "Gagal simpan")
      }
      toast.success("Blog berhasil disimpan!")
      router.push("/admin/blog")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal simpan")
    }
    setSaving(false)
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/blog">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-heading">Tulis Blog Baru</h1>
          <p className="text-muted-foreground">Buat artikel blog baru dengan bantuan AI</p>
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
            <CardDescription>Gunakan DeepSeek untuk membantu menulis konten</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Topik Ide Konten</Label>
              <Select value={aiTopic} onValueChange={(v) => v && setAiTopic(v)}>
                <SelectTrigger className="w-full sm:w-64 h-8 text-xs bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tips Roadtrip">Tips Roadtrip</SelectItem>
                  <SelectItem value="Destinasi Wisata">Destinasi Wisata</SelectItem>
                  <SelectItem value="Inspirasi Perjalanan">Inspirasi Perjalanan</SelectItem>
                  <SelectItem value="Perawatan Mobil">Perawatan Mobil</SelectItem>
                  <SelectItem value="Kendaraan">Kendaraan</SelectItem>
                  <SelectItem value="Tutorial">Tutorial</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm"
                onClick={handleGenerateIde} disabled={generatingIde}
                className="gap-1.5 bg-white">
                {generatingIde ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
                {generatingIde ? "Generating..." : "💡 Ide Konten"}
              </Button>
              <Button type="button" variant="outline" size="sm"
                onClick={handleWriteContent} disabled={generatingContent || !form.title}
                className="gap-1.5 bg-white">
                {generatingContent ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {generatingContent ? "Generating..." : "🤖 Bantu Tulis"}
              </Button>
              <Button type="button" variant="outline" size="sm"
                onClick={handleGenerateSeo} disabled={generatingSeo || !form.title}
                className="gap-1.5 bg-white">
                {generatingSeo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generatingSeo ? "Generating..." : "✨ SEO"}
              </Button>
              <Button type="button" variant="outline" size="sm"
                onClick={handleGenerateImage} disabled={generatingImage || !form.title}
                className="gap-1.5 bg-white">
                {generatingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                {generatingImage ? "Generating..." : "🎨 Prompt Gambar"}
              </Button>
            </div>

            {/* Image Prompt Result */}
            {imagePrompt && (
              <div className="mt-3 p-3 rounded-xl border border-border/50 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">🎨 Prompt untuk AI Image Generator</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 text-xs"
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

            {/* Ide Results */}
            {ideResults.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground">Pilih ide untuk auto-fill form:</p>
                {ideResults.map((idea, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectIdea(idea)}
                    className="w-full text-left p-3 rounded-xl border border-border/50 bg-white hover:border-primary/30 hover:bg-primary/5 transition-all text-sm"
                  >
                    <div className="font-medium">{idea.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{idea.excerpt}</div>
                    <div className="text-xs text-primary mt-1">📂 {idea.category}</div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Artikel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Judul *</Label>
                <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} required placeholder="Judul artikel" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Textarea value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} rows={2} placeholder="Ringkasan singkat artikel" />
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
                <Input value={form.read_time} onChange={(e) => setForm((f) => ({ ...f, read_time: e.target.value }))} placeholder="5 min" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <div className="flex gap-2">
                  <Input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="roadtrip, tips, jawa-barat" className="flex-1" />
                  <Button type="button" variant="outline" size="sm" onClick={handleGenerateTags} disabled={generatingTags || !form.title} className="shrink-0 gap-1.5">
                    {generatingTags ? <Loader2 className="h-4 w-4 animate-spin" /> : <TagsIcon className="h-4 w-4" />}
                    {generatingTags ? "..." : "Generate"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cover Image URL</Label>
                <Input value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="border-t pt-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SEO Settings</p>
                <div className="space-y-2">
                  <Label>SEO Title (biarkan kosong jika sama dengan judul)</Label>
                  <Input value={form.seo_title} onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))} placeholder="Auto dari judul" />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Input value={form.meta_description} onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))} placeholder="Auto dari excerpt" />
                </div>
                <div className="space-y-2">
                  <Label>AI Image Prompt</Label>
                  <Input value={form.prompt_gambar} onChange={(e) => setForm((f) => ({ ...f, prompt_gambar: e.target.value }))} placeholder="Prompt untuk generate gambar" />
                </div>
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
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Simpan</>}
          </Button>
          <Link href="/admin/blog"><Button variant="outline">Cancel</Button></Link>
        </div>
      </form>
    </div>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Search, Loader2, Trash2, Copy, Check, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MediaItem {
  id: string
  url: string
  filename: string
  folder: string
  size: number
  mime_type: string
  created_at: string
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState("")
  const [folder, setFolder] = useState("all")
  const [total, setTotal] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchMedia() }, [search, folder])

  async function fetchMedia() {
    setLoading(true)
    const params = new URLSearchParams({ limit: "100" })
    if (search) params.set("search", search)
    if (folder !== "all") params.set("folder", folder)

    const res = await fetch(`/api/media?${params}`)
    const json = await res.json()
    setItems(json.data || [])
    setTotal(json.pagination?.total || 0)
    setLoading(false)
  }

  async function handleUpload(file: File) {
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) { toast.error("File maksimal 10MB"); return }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"]
    if (!allowed.includes(file.type)) { toast.error("Tipe file harus jpg, png, webp, atau avif"); return }

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", folder === "all" ? "spots" : folder)

    try {
      await fetch("/api/media", { method: "POST", body: formData })
      fetchMedia()
    } catch (err) {
      toast.error("Gagal upload: " + (err as Error).message)
    }
    setUploading(false)
  }

  async function handleDelete(id: string, filename: string) {
    if (!confirm(`Hapus "${filename}"?`)) return
    await fetch(`/api/media/${id}`, { method: "DELETE" })
    fetchMedia()
  }

  function handleCopy(url: string, id: string) {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Media Library</h1>
          <p className="text-muted-foreground">{total} file</p>
        </div>
        <div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            ref={fileRef}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = "" }}
          />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Upload
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 flex flex-wrap gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari file..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={folder} onValueChange={(v) => v && setFolder(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Folder</SelectItem>
              <SelectItem value="spots">Spots</SelectItem>
              <SelectItem value="cover">Cover</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-lg font-medium">Belum ada file</p>
            <p className="text-sm text-muted-foreground">Upload gambar untuk digunakan sebagai banner atau gambar spot</p>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Upload File
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group relative rounded-xl border border-border/50 bg-white overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] bg-muted relative">
                <img
                  src={item.url}
                  alt={item.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button onClick={() => handleCopy(item.url, item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 hover:bg-white text-muted-foreground hover:text-foreground transition-colors">
                    {copiedId === item.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 hover:bg-white text-muted-foreground hover:text-foreground transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button onClick={() => handleDelete(item.id, item.filename)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/90 hover:bg-red-500 text-white transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{item.filename}</p>
                <p className="text-[10px] text-muted-foreground">{formatSize(item.size)} · {item.folder}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

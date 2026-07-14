"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search, Check, Upload, Trash2 } from "lucide-react"

interface MediaItem {
  id: string
  url: string
  filename: string
  folder: string
}

interface ImagePickerProps {
  open: boolean
  onClose: () => void
  onSelect: (urls: string[]) => void
  multi?: boolean
}

export function ImagePicker({ open, onClose, onSelect, multi = false }: ImagePickerProps) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  useEffect(() => {
    if (!open) return
    setSelected(new Set())
    fetchMedia()
  }, [open])

  async function fetchMedia() {
    setLoading(true)
    const params = new URLSearchParams({ limit: "50" })
    if (search) params.set("search", search)

    const res = await fetch(`/api/media?${params}`)
    const json = await res.json()
    setItems(json.data || [])
    setLoading(false)
  }

  async function handleUpload(file: File) {
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) { alert("File maksimal 10MB"); return }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"]
    if (!allowed.includes(file.type)) { alert("Tipe file harus jpg, png, webp, atau avif"); return }

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", "spots")

    try {
      await fetch("/api/media", { method: "POST", body: formData })
      await fetchMedia()
    } catch (err) {
      alert("Gagal upload: " + (err as Error).message)
    }
    setUploading(false)
  }

  async function handleDelete(id: string, filename: string) {
    if (!confirm(`Hapus "${filename}"?`)) return
    await fetch(`/api/media/${id}`, { method: "DELETE" })
    setSelected((prev) => { const next = new Set(prev); const item = items.find(i => i.id === id); if (item) next.delete(item.url); return next })
    await fetchMedia()
  }

  function toggleSelect(url: string) {
    if (multi) {
      setSelected((prev) => {
        const next = new Set(prev)
        if (next.has(url)) next.delete(url)
        else next.add(url)
        return next
      })
    } else {
      setSelected(new Set([url]))
    }
  }

  function handleSelect() {
    if (selected.size === 0) return
    onSelect([...selected])
    onClose()
  }

  const count = selected.size

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {multi ? "Pilih Gambar (multi)" : "Pilih dari Media Library"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari file..."
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={fetchMedia} disabled={loading}>
            {loading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            Cari
          </Button>
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 mb-4 transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border/30 bg-muted/10 hover:bg-muted/20"
          }`}
        >
          {dragOver ? (
            <>
              <Upload className="h-5 w-5 text-primary" />
              <span className="text-sm text-primary font-medium">Lepaskan untuk upload</span>
            </>
          ) : uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">Upload gambar baru</span>
              <span className="text-xs text-muted-foreground">JPG, PNG, WebP, AVIF — maks 10MB</span>
            </>
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" ref={fileRef}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = "" }} />
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>Belum ada file. Upload gambar di atas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[40vh] overflow-y-auto p-1">
            {items.map((item) => {
              const isSelected = selected.has(item.url)
              return (
              <button
                key={item.id}
                onClick={() => toggleSelect(item.url)}
                className={`group relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all bg-muted ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-border/50"
                }`}
              >
                <img src={item.url} alt={item.filename} className="w-full h-full object-cover" loading="lazy" />
                <span onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.filename) }}
                  className="absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/80 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Trash2 className="h-3 w-3" />
                </span>
                {isSelected && (
                  <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                  <p className="text-[10px] text-white truncate">{item.filename}</p>
                </div>
              </button>
              )
            })}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSelect} disabled={count === 0}>
            Pilih{count > 0 ? ` (${count})` : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

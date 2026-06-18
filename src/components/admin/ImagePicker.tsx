"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search, Check } from "lucide-react"

interface MediaItem {
  id: string
  url: string
  filename: string
  folder: string
}

interface ImagePickerProps {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
}

export function ImagePicker({ open, onClose, onSelect }: ImagePickerProps) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
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

  function handleSelect() {
    if (!selected) return
    onSelect(selected)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">Pilih dari Media Library</DialogTitle>
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

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>Belum ada file. Upload dulu di halaman Media.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[50vh] overflow-y-auto p-1">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(selected === item.url ? null : item.url)}
                className={`group relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all bg-muted ${
                  selected === item.url
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-border/50"
                }`}
              >
                <img src={item.url} alt={item.filename} className="w-full h-full object-cover" loading="lazy" />
                {selected === item.url && (
                  <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                  <p className="text-[10px] text-white truncate">{item.filename}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSelect} disabled={!selected}>Pilih</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

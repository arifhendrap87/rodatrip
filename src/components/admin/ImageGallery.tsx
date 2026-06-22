"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ImagePicker } from "@/components/admin/ImagePicker"
import { ImageUpload } from "@/components/ui/image-upload"
import { Plus, Trash2, GripVertical, X } from "lucide-react"

export interface GalleryImage {
  url: string
  alt?: string
  sort_order?: number
}

interface ImageGalleryProps {
  images: GalleryImage[]
  onChange: (images: GalleryImage[]) => void
  folder?: string
}

export function ImageGallery({ images, onChange, folder = "spots" }: ImageGalleryProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

  function addImage(url: string) {
    onChange([...images, { url, sort_order: images.length }])
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index).map((img, i) => ({ ...img, sort_order: i })))
  }

  function moveUp(index: number) {
    if (index === 0) return
    const arr = [...images]
    ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
    onChange(arr.map((img, i) => ({ ...img, sort_order: i })))
  }

  function moveDown(index: number) {
    if (index === images.length - 1) return
    const arr = [...images]
    ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
    onChange(arr.map((img, i) => ({ ...img, sort_order: i })))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold font-heading text-muted-foreground uppercase tracking-wider">
          Galeri Gambar ({images.length})
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
            <Plus className="h-3 w-3 mr-1" /> Pilih dari Media
          </Button>
        </div>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {images.map((img, i) => (
            <div key={i} className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-border/50 bg-muted">
              <img src={img.url} alt={img.alt || ""} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                <button type="button" onClick={() => moveUp(i)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs font-bold disabled:opacity-30"
                  disabled={i === 0}>▲</button>
                <button type="button" onClick={() => moveDown(i)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs font-bold disabled:opacity-30"
                  disabled={i === images.length - 1}>▼</button>
                <button type="button" onClick={() => removeImage(i)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
                  <X className="h-3 w-3" />
                </button>
              </div>
              <span className="absolute top-1 left-1 rounded bg-black/50 text-white text-[10px] px-1.5 py-0.5">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-border/30 bg-muted/10 p-8 text-center text-sm text-muted-foreground">
          <p>Belum ada gambar. Klik "Pilih dari Media" untuk menambahkan.</p>
        </div>
      )}

      <ImagePicker
        open={pickerOpen}
        multi
        onClose={() => setPickerOpen(false)}
        onSelect={(urls) => {
          const newImages = urls.map((url, i) => ({ url, sort_order: images.length + i }))
          onChange([...images, ...newImages])
          setPickerOpen(false)
        }}
      />
    </div>
  )
}

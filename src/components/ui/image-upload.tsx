"use client"

import { useState, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, X, ImageIcon } from "lucide-react"
import { ImagePicker } from "@/components/admin/ImagePicker"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  folder?: string
  placeholder?: string
}

export function ImageUpload({ value, onChange, label, folder = "spots", placeholder }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value)
  const [pickerOpen, setPickerOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    uploadFile(file)
  }

  async function uploadFile(file: File) {
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) { alert("File maksimal 5MB"); return }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"]
    if (!allowed.includes(file.type)) { alert("Tipe file harus jpg, png, webp, atau avif"); return }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const json = await res.json()

      if (!res.ok) { alert(json.error?.message || "Gagal upload"); return }
      setPreview(json.data.url)
      onChange(json.data.url)
    } catch (err) {
      alert("Gagal upload: " + (err as Error).message)
    }
    setUploading(false)
  }

  function handleClear() {
    setPreview("")
    onChange("")
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      {(preview || value) ? (
        <div className="relative rounded-xl overflow-hidden border border-border/50 bg-muted/20">
          <div className="aspect-[16/9] max-h-64 relative">
            <img
              src={preview || value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 p-2">
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              <Upload className="h-3 w-3 mr-1" /> Ganti
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
              <ImageIcon className="h-3 w-3 mr-1" /> Media
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="text-destructive">
              <X className="h-3 w-3 mr-1" /> Hapus
            </Button>
            <a href={preview || value} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary ml-auto truncate">
              Buka gambar
            </a>
          </div>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" ref={inputRef} onChange={handleFileSelect} />
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/50 bg-muted/20 p-8 hover:bg-muted/40 transition-colors"
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Klik untuk upload gambar</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, WebP, AVIF — maks 5MB</p>
              <Button type="button" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setPickerOpen(true) }} className="mt-2">
                <ImageIcon className="h-3 w-3 mr-1" /> Pilih dari Media
              </Button>
            </>
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" ref={inputRef} onChange={handleFileSelect} />
        </div>
      )}

      <Input
        value={value}
        onChange={(e) => { onChange(e.target.value); setPreview(e.target.value) }}
        placeholder={placeholder || `https://pub-xxx.r2.dev/${folder}/...`}
        className="text-xs font-mono"
      />

      <ImagePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => { setPreview(url); onChange(url) }}
      />
    </div>
  )
}

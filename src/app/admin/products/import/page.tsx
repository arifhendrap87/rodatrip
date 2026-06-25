"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Upload, Loader2, CheckCircle, XCircle, AlertTriangle, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"

interface ImportResult {
  created: number
  updated: number
  errors?: string[]
  total: number
}

export default function ImportProductsPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.name.endsWith(".xlsx") && !f.name.endsWith(".xls")) {
      toast.error("File harus .xlsx")
      return
    }
    setFile(f)
    setResult(null)
    previewFile(f)
  }

  async function previewFile(f: File) {
    const formData = new FormData()
    formData.append("file", f)

    try {
      const res = await fetch("/api/products/import?preview=1", { method: "POST", body: formData })
      const json = await res.json()
      if (json.data?.preview) {
        setPreview(json.data.preview)
      }
    } catch {
      // preview optional - proceed without it
    }
  }

  async function handleImport() {
    if (!file) return
    setImporting(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/products/import", { method: "POST", body: formData })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error?.message || "Gagal import"); return }
      setResult(json.data as ImportResult)
      toast.success(`Import selesai: ${json.data.created} baru, ${json.data.updated} update`)
    } catch (err) {
      toast.error("Gagal import: " + (err as Error).message)
    }
    setImporting(false)
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/products"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold font-heading">Import Master Produk</h1>
          <p className="text-muted-foreground">Upload file XLSX hasil export dari Jakmall</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>Pilih file XLSX master produk dari Jakmall</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/50 bg-muted/20 p-10 hover:bg-muted/40 transition-colors"
            >
              <FileSpreadsheet className="h-10 w-10 text-emerald-500" />
              <div className="text-center">
                <p className="font-medium">Klik untuk upload file</p>
                <p className="text-sm text-muted-foreground">File .xlsx dari Jakmall</p>
              </div>
              {file && (
                <p className="text-sm text-emerald-600 font-medium">✓ {file.name}</p>
              )}
              <input type="file" accept=".xlsx,.xls" className="hidden" ref={fileRef} onChange={handleFileSelect} />
            </div>

            {file && !result && (
              <Button onClick={handleImport} disabled={importing} className="w-full" size="lg">
                {importing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengimport...</> : <><Upload className="mr-2 h-4 w-4" /> Import ke Database</>}
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {result ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle className="h-5 w-5" />
                  Import Selesai
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{result.created}</p>
                    <p className="text-sm text-green-600">Produk Baru</p>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{result.updated}</p>
                    <p className="text-sm text-blue-600">Produk Diupdate</p>
                  </div>
                </div>

                {result.total && (
                  <p className="text-sm text-muted-foreground text-center">Total {result.total} produk diproses</p>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 space-y-1">
                    <p className="text-xs font-semibold text-red-600">Error ({result.errors.length}):</p>
                    {result.errors.slice(0, 3).map((e, i) => (
                      <p key={i} className="text-xs text-red-500">{e}</p>
                    ))}
                  </div>
                )}

                <Link href="/admin/products">
                  <Button className="w-full">Lihat Daftar Produk</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Format File</CardTitle>
                <CardDescription>Kolom yang dibaca dari XLSX</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="rounded-lg border border-border/50 p-3 space-y-1">
                  <p className="font-medium text-emerald-600">✓ Nama Produk</p>
                  <p className="font-medium text-emerald-600">✓ Kode SKU</p>
                  <p className="font-medium text-emerald-600">✓ Harga</p>
                  <p className="text-muted-foreground">Berat (gr)</p>
                  <p className="text-muted-foreground">Volume Kemasan (cm)</p>
                  <p className="text-muted-foreground">Status</p>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs text-blue-600 space-y-1">
                  <p className="font-medium">🔑 Pencocokan berdasarkan Kode SKU</p>
                  <p>• SKU sudah ada → Update harga, stok, berat</p>
                  <p>• SKU baru → Buat produk baru</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

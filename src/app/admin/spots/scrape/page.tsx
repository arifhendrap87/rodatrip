"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Loader2,
  Save,
  Sparkles,
  Check,
  X,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import type { ScrapedSpot } from "@/services/scraper/transform"

const PROVINCES = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau",
  "Jambi", "Sumatera Selatan", "Bengkulu", "Lampung", "Kepulauan Bangka Belitung",
  "Banten", "Jawa Barat", "DKI Jakarta", "Jawa Tengah", "DI Yogyakarta",
  "Jawa Timur", "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
  "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan",
  "Kalimantan Timur", "Kalimantan Utara",
  "Sulawesi Utara", "Sulawesi Tengah", "Sulawesi Barat",
  "Sulawesi Selatan", "Sulawesi Tenggara", "Gorontalo",
  "Maluku", "Maluku Utara", "Papua", "Papua Barat",
]

const CATEGORY_COLORS: Record<string, string> = {
  alam: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  kuliner: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  budaya: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  foto: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  petualangan: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  sejarah: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
}

export default function ScrapePage() {
  const [province, setProvince] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{
    totalFound: number
    new: ScrapedSpot[]
    skipped: string[]
    errors: string[]
  } | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  async function handleScrape() {
    if (!province) {
      toast.error("Pilih provinsi dulu")
      return
    }

    setLoading(true)
    setResult(null)
    setSelected(new Set())

    try {
      const res = await fetch("/api/admin/scrape-spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ province }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err?.error?.message || "Gagal scrape")
      }

      const json = await res.json()
      const data = json.data

      setResult(data)
      setSelected(new Set(data.new.map((s: ScrapedSpot) => s.slug)))

      toast.success(`Ditemukan ${data.new.length} spot baru dari ${data.totalFound} total`)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    const toSave = result?.new.filter((s) => selected.has(s.slug))
    if (!toSave || toSave.length === 0) {
      toast.error("Pilih spot yang mau disimpan")
      return
    }

    setSaving(true)

    try {
      const res = await fetch("/api/admin/scrape-spots/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spots: toSave }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err?.error?.message || "Gagal menyimpan")
      }

      const json = await res.json()
      const data = json.data

      toast.success(`Berhasil menyimpan ${data.saved} spot`)
      if (data.errors.length > 0) {
        toast.error(`${data.errors.length} error: ${data.errors[0]}`)
      }

      setResult(null)
      setSelected(new Set())
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  function toggleAll(checked: boolean) {
    if (!result) return
    if (checked) {
      setSelected(new Set(result.new.map((s) => s.slug)))
    } else {
      setSelected(new Set())
    }
  }

  function toggleOne(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/spots">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-heading">Scrape from Wikipedia</h1>
          <p className="text-muted-foreground">
            Ambil data spot wisata dari Wikipedia Indonesia
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2 min-w-60">
              <label className="text-sm font-medium">Provinsi</label>
              <Select value={province} onValueChange={(v) => v && setProvince(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih provinsi" />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleScrape} disabled={loading || !province}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Scrape Now
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">
                    {result.totalFound}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Ditemukan</p>
                    <p className="text-xs text-muted-foreground">dari Wikipedia</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-semibold text-lg">
                    {result.new.length}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Spot Baru</p>
                    <p className="text-xs text-muted-foreground">belum ada di DB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold text-lg">
                    {result.skipped.length}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Sudah Ada</p>
                    <p className="text-xs text-muted-foreground">di-skip</p>
                  </div>
                </div>
                {result.errors.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 font-semibold text-lg">
                      {result.errors.length}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Error</p>
                      <p className="text-xs text-muted-foreground">{result.errors[0]}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {result.new.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle>Spot Baru</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {selected.size} / {result.new.length} dipilih
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAll(selected.size !== result.new.length)}
                  >
                    {selected.size === result.new.length ? (
                      <>Uncheck All</>
                    ) : (
                      <>Select All</>
                    )}
                  </Button>
                  <Button onClick={handleSave} disabled={saving || selected.size === 0}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Selected ({selected.size})
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <input
                          type="checkbox"
                          checked={result.new.length > 0 && selected.size === result.new.length}
                          onChange={(e) => toggleAll(e.target.checked)}
                          className="h-4 w-4"
                        />
                      </TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Koordinat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.new.map((spot) => (
                      <TableRow
                        key={spot.slug}
                        className={selected.has(spot.slug) ? "bg-muted/30" : undefined}
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selected.has(spot.slug)}
                            onChange={() => toggleOne(spot.slug)}
                            className="h-4 w-4"
                          />
                        </TableCell>
                        <TableCell className="font-medium max-w-60">
                          <div className="truncate" title={spot.name}>
                            {spot.name}
                          </div>
                          <code className="text-[10px] text-muted-foreground mt-0.5 block truncate">
                            {spot.slug}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${CATEGORY_COLORS[spot.category] || ""}`}
                          >
                            {spot.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {spot.description || "-"}
                          </p>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {result.new.length === 0 && result.totalFound > 0 && (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <Check className="h-12 w-12 text-emerald-500 mb-4" />
                <p className="text-lg font-medium">Semua spot sudah ada di database</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.totalFound} spot ditemukan, semuanya sudah tersimpan
                </p>
                {result.skipped.length > 0 && (
                  <div className="mt-4 text-xs text-muted-foreground max-w-md text-center">
                    Skipped: {result.skipped.join(", ")}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {result.totalFound === 0 && result.errors.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Tidak ada spot ditemukan</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Mungkin kategori &quot;Tempat wisata di {province}&quot; tidak ada di Wikipedia
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

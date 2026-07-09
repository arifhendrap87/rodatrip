"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface ImportResult {
  itinerary: { id: string; slug: string; status: string }
  spots: { stopNumber: number; name: string; slug: string; status: string }[]
}

export default function ImportRoadtripPage() {
  const router = useRouter()
  const [jsonInput, setJsonInput] = useState("")
  const [parsed, setParsed] = useState<Record<string, unknown> | null>(null)
  const [parseError, setParseError] = useState("")
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState("")

  function handleParse() {
    setParseError("")
    setParsed(null)
    try {
      const obj = JSON.parse(jsonInput)
      if (!obj.title) { setParseError("JSON harus memiliki field 'title'"); return }
      if (!obj.stops || !Array.isArray(obj.stops) || obj.stops.length === 0) {
        setParseError("JSON harus memiliki field 'stops' (array minimal 1)")
        return
      }
      setParsed(obj)
    } catch {
      setParseError("JSON tidak valid. Periksa format.")
    }
  }

  async function handleSubmit() {
    if (!parsed) return
    setSaving(true)
    setError("")
    setResult(null)

    try {
      const res = await fetch("/api/admin/roadtrips/from-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error?.message || json.error || "Gagal menyimpan")
        return
      }
      setResult(json.data as ImportResult)
    } catch (err) {
      setError((err as Error).message)
    }
    setSaving(false)
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/roadtrips">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-heading">Import Roadtrip dari JSON</h1>
          <p className="text-muted-foreground">Paste hasil JSON dari Gemini, lalu preview sebelum simpan</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Input JSON</CardTitle>
            <CardDescription>Paste JSON dari Gemini prompt generator</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={jsonInput}
              onChange={(e) => { setJsonInput(e.target.value); setParsed(null); setResult(null) }}
              placeholder='Paste JSON Gemini di sini...'
              className="min-h-[300px] w-full rounded-xl border border-border/50 bg-muted/30 p-4 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20"
              spellCheck={false}
            />

            {parseError && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {parseError}
              </div>
            )}

            <Button onClick={handleParse} disabled={!jsonInput.trim()} className="w-full">
              Parse & Preview
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {result ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Berhasil Disimpan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <p className="font-medium text-green-800">{result.itinerary.status === "created" ? "Roadtrip baru dibuat" : "Roadtrip sudah ada"}</p>
                  <p className="text-sm text-green-600 mt-1">
                    <Link href={`/admin/roadtrips/${result.itinerary.slug}/edit`} className="underline">
                      {result.itinerary.slug}
                    </Link>
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Spot ({result.spots.length}):</p>
                  {result.spots.map((s) => (
                    <div key={s.slug} className="flex items-center gap-3 rounded-xl border border-border/50 p-3 text-sm">
                      {s.status === "created" ? (
                        <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                      )}
                      <span className="flex-1">
                        <span className="font-medium">{s.name}</span>
                        <span className="text-muted-foreground ml-2">({s.slug})</span>
                      </span>
                      <span className={`text-xs ${s.status === "created" ? "text-green-500" : "text-amber-500"}`}>
                        {s.status === "created" ? "Dibuat" : "Sudah ada"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Link href={`/roadtrip/${result.itinerary.slug}`} target="_blank">
                    <Button variant="outline">Lihat Roadtrip</Button>
                  </Link>
                  <Link href={`/admin/roadtrips/${result.itinerary.slug}/edit`}>
                    <Button variant="outline">Edit Roadtrip</Button>
                  </Link>
                  <Button onClick={() => { setJsonInput(""); setParsed(null); setResult(null) }}>
                    Import Lagi
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : parsed ? (
            <>
              <PreviewCard parsed={parsed} />

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <Button onClick={handleSubmit} disabled={saving} className="w-full" size="lg">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : "Buat Roadtrip"}
              </Button>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>Paste JSON di kolom kiri, lalu klik "Parse & Preview"</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function PreviewCard({ parsed }: { parsed: Record<string, unknown> }) {
  const p = parsed as Record<string, string>
  const stops = (parsed.stops as Array<Record<string, string>>) || []

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🏎️</span> Preview Roadtrip
          </CardTitle>
          <CardDescription>Data yang akan diimport</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <p className="text-lg font-bold font-heading">{p.title || "(tanpa judul)"}</p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {p.itinerary_duration && <span>⏱️ {p.itinerary_duration}</span>}
              {p.total_distance && <span>📏 {p.total_distance}</span>}
              {p.estimated_cost && <span>💰 {p.estimated_cost}</span>}
            </div>
          </div>

          {p.maps_embed_url && (
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-2 text-xs text-blue-600 truncate">
              📍 {p.maps_embed_url}
            </div>
          )}

          <div className="border-t border-border/30 pt-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Destinasi ({stops.length})
            </p>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {stops.map((stop, i) => (
                <div key={i} className="flex gap-3 rounded-xl border border-border/40 p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1 break-words">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-medium">{stop.name || "(tanpa nama)"}</p>
                      {stop.category && <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{stop.category}</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-1">
                      {stop.visit_duration && <span>⏱️ {stop.visit_duration}</span>}
                      {stop.ticket_price && <span>🎟️ {stop.ticket_price}</span>}
                      {stop.physical_effort && <span>🏃 {stop.physical_effort}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Catatan Sebelum Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>📍 Koordinat spot akan diisi otomatis berdasarkan provinsi (Google Maps approximate center)</p>
          <p>🏷️ Spot dengan slug yang sudah ada akan dilewati (tidak di-overwrite)</p>
          <p>📝 Roadtrip akan disimpan sebagai <strong>Draft (tidak dipublikasikan)</strong></p>
          <p>✏️ Setelah import, edit roadtrip untuk meninjau dan publikasikan</p>
        </CardContent>
      </Card>
    </div>
  )
}

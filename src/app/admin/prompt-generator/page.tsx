"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Copy, Sparkles, Check, FileDown, Loader2 } from "lucide-react"
import { generatePrompt } from "./data"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function getStopRange(days: number): string {
  if (days <= 1) return "3"
  if (days === 2) return "6"
  if (days === 3) return "9"
  return "9"
}

interface WilayahItem {
  code: string
  name: string
}

export default function PromptGeneratorPage() {
  const [provinsiList, setProvinsiList] = useState<WilayahItem[]>([])
  const [kotaList, setKotaList] = useState<WilayahItem[]>([])
  const [loadingProv, setLoadingProv] = useState(true)
  const [loadingKota, setLoadingKota] = useState(false)

  const [provCode, setProvCode] = useState("")
  const [provinsi, setProvinsi] = useState("")
  const [kota, setKota] = useState("Bandung")
  const [days, setDays] = useState(2)
  const [copied, setCopied] = useState(false)

  // Fetch provinces on mount
  useEffect(() => {
    setLoadingProv(true)
    fetch("/api/regions/provinces")
      .then((r) => r.json())
      .then((json) => {
        const list = (json.data || []) as WilayahItem[]
        setProvinsiList(list)
        // Set default if available
        const jabar = list.find((p: WilayahItem) => p.code === "32")
        if (jabar) {
          setProvCode(jabar.code)
          setProvinsi(jabar.name)
        }
        setLoadingProv(false)
      })
      .catch(() => setLoadingProv(false))
  }, [])

  // Fetch cities when province changes
  useEffect(() => {
    if (!provCode) return
    setLoadingKota(true)
    setKota("")
    fetch(`/api/regions/regencies/${provCode}`)
      .then((r) => r.json())
      .then((json) => {
        const list = (json.data || []) as WilayahItem[]
        setKotaList(list)
        if (list.length > 0) setKota(list[0].name)
        setLoadingKota(false)
      })
      .catch(() => {
        setKotaList([])
        setLoadingKota(false)
      })
  }, [provCode])

  function handleProvinsiChange(name: string) {
    const prov = provinsiList.find((p) => p.name === name)
    if (prov) {
      setProvCode(prov.code)
      setProvinsi(name)
      setKota("")
    }
  }

  const prompt = generatePrompt(provinsi, kota, days)

  function handleCopy() {
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const durasiLabel = days <= 1 ? "1 Hari" : `${days} Hari ${days - 1} Malam`
  const stopsRange = getStopRange(days)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Prompt Generator Gemini
        </h1>
        <p className="text-muted-foreground">Generate prompt untuk Gemini — generate data roadtrip itinerary</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parameter</CardTitle>
              <CardDescription>Sesuaikan lokasi dan durasi roadtrip</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Provinsi</Label>
                <Select value={provinsi} onValueChange={(v) => v && handleProvinsiChange(v)} disabled={loadingProv}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={loadingProv ? "Memuat..." : "Pilih provinsi"} />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingProv ? (
                      <SelectItem value="loading" disabled>Memuat...</SelectItem>
                    ) : (
                      provinsiList.map((p) => (
                        <SelectItem key={p.code} value={p.name}>{p.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Kota / Daerah</Label>
                <Select value={kota} onValueChange={(v) => v && setKota(v)} disabled={loadingKota || !provCode}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={loadingKota ? "Memuat..." : kota || "Pilih dulu"} />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingKota ? (
                      <SelectItem value="loading" disabled>Memuat...</SelectItem>
                    ) : kotaList.length === 0 ? (
                      <SelectItem value="" disabled>Pilih provinsi dulu</SelectItem>
                    ) : (
                      kotaList.map((k) => (
                        <SelectItem key={k.code} value={k.name}>{k.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Durasi (hari)</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={3}
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-28 text-right">{durasiLabel}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview Parameter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provinsi</span>
                  <span className="font-medium">{provinsi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kota</span>
                  <span className="font-medium">{kota}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durasi</span>
                  <span className="font-medium">{durasiLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destinasi</span>
                  <span className="font-medium">{stopsRange} spot</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prompt Output */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Prompt</CardTitle>
                  <CardDescription>Copy paste ke Gemini</CardDescription>
                </div>
                <Button onClick={handleCopy} variant="outline" size="sm" className="gap-1.5">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Tersalin!" : "Copy"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                readOnly
                value={prompt}
                className="w-full h-[500px] rounded-xl border border-border/50 bg-muted/30 p-4 text-sm font-mono leading-relaxed resize-none focus:outline-none"
              />
              <div className="mt-4 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3">
                <div>
                  <p className="text-sm font-medium text-primary">Sudah dapat hasil JSON dari Gemini?</p>
                  <p className="text-xs text-muted-foreground">Lanjutkan ke halaman import untuk langsung menyimpan roadtrip</p>
                </div>
                <Link href="/admin/roadtrips/import">
                  <Button size="sm">
                    <FileDown className="mr-1.5 h-4 w-4" />
                    Import JSON
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

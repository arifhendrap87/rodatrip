"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Sparkles, Check, FileDown } from "lucide-react"
import { PROVINSI_DATA, PROVINSI_KEYS, generatePrompt, type KotaItem } from "./data"

function getStopRange(days: number): string {
  if (days <= 1) return "2-3"
  if (days === 2) return "3-4"
  if (days === 3) return "4-5"
  if (days === 4) return "5-6"
  return "5-7"
}

export default function PromptGeneratorPage() {
  const [provinsi, setProvinsi] = useState("Jawa Barat")
  const [kota, setKota] = useState("Bandung")
  const [subTema, setSubTema] = useState("kuliner, pantai, pegunungan")
  const [days, setDays] = useState(2)
  const [copied, setCopied] = useState(false)

  const prov = PROVINSI_DATA[provinsi]
  const kotaList: KotaItem[] = prov?.kota || []

  function handleProvinsiChange(value: string) {
    setProvinsi(value)
    const newProv = PROVINSI_DATA[value]
    if (newProv?.kota?.length > 0) {
      setKota(newProv.kota[0].value)
    }
  }

  const prompt = generatePrompt(provinsi, kota, subTema, days)

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
                <select
                  value={provinsi}
                  onChange={(e) => handleProvinsiChange(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border/50 bg-background px-3 text-sm"
                >
                  {PROVINSI_KEYS.map((key) => (
                    <option key={key} value={key}>{PROVINSI_DATA[key].label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Kota / Daerah</Label>
                <select
                  value={kota}
                  onChange={(e) => setKota(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border/50 bg-background px-3 text-sm"
                >
                  {kotaList.map((k) => (
                    <option key={k.value} value={k.value}>{k.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Sub Tema</Label>
                <Input
                  value={subTema}
                  onChange={(e) => setSubTema(e.target.value)}
                  placeholder="kuliner, pantai, pegunungan, budaya"
                />
              </div>

              <div className="space-y-2">
                <Label>Durasi (hari)</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={7}
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
                  <span className="text-muted-foreground">Sub Tema</span>
                  <span className="font-medium">{subTema}</span>
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

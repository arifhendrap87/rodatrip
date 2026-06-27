"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, ChevronRight, ArrowLeft, Loader2, ImageIcon } from "lucide-react"
import { ImagePicker } from "@/components/admin/ImagePicker"
import { toast } from "sonner"

interface Region {
  code: string
  name: string
  image_url?: string
}

export default function RegionsPage() {
  const [provinces, setProvinces] = useState<Region[]>([])
  const [regencies, setRegencies] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedProv, setSelectedProv] = useState<Region | null>(null)
  const [pickerTarget, setPickerTarget] = useState<{ code: string; type: string } | null>(null)

  useEffect(() => {
    fetchProvinces()
  }, [])

  async function fetchProvinces() {
    setLoading(true)
    const res = await fetch("/api/regions/provinces")
    const json = await res.json()
    setProvinces(json.data || [])
    setLoading(false)
  }

  async function fetchRegencies(code: string) {
    setLoading(true)
    const res = await fetch(`/api/regions/regencies/${code}`)
    const json = await res.json()
    setRegencies(json.data || [])
    setLoading(false)
  }

  function selectProvince(prov: Region) {
    setSelectedProv(prov)
    fetchRegencies(prov.code)
  }

  function backToProvinces() {
    setSelectedProv(null)
    setRegencies([])
  }

  async function handleUpdateImage(code: string, url: string) {
    const res = await fetch(`/api/regions/${code}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: url }),
    })
    const json = await res.json()
    if (!res.ok) { toast.error(json.error?.message || "Gagal"); return }
    toast.success("Gambar tersimpan!")
    // Refresh list
    if (selectedProv) fetchRegencies(selectedProv.code)
    else fetchProvinces()
  }

  const filteredProvinces = provinces.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )
  const filteredRegencies = regencies.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        {selectedProv ? (
          <Button variant="ghost" size="icon" onClick={backToProvinces}><ArrowLeft className="h-4 w-4" /></Button>
        ) : null}
        <div>
          <h1 className="text-2xl font-bold font-heading">
            {selectedProv ? selectedProv.name : "Regions"}
          </h1>
          <p className="text-muted-foreground">
            {selectedProv
              ? `${regencies.length} kota/kabupaten`
              : `${provinces.length} provinsi`
            }
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={selectedProv ? "Cari kota/kabupaten..." : "Cari provinsi..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Memuat...</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {(selectedProv ? filteredRegencies : filteredProvinces).map((region) => (
                <div key={region.code} className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
                  {selectedProv ? null : (
                    <button onClick={() => selectProvince(region)}
                      className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
                    {region.image_url ? (
                      <img src={region.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{region.name}</p>
                    <p className="text-xs text-muted-foreground">{region.code}</p>
                  </div>
                  <button
                    onClick={() => setPickerTarget({ code: region.code, type: selectedProv ? "regency" : "province" })}
                    className="text-xs text-primary hover:text-primary/80 transition-colors shrink-0"
                  >
                    {region.image_url ? "Ganti" : "Pilih"} Gambar
                  </button>
                </div>
              ))}
              {((selectedProv ? filteredRegencies : filteredProvinces)).length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  Tidak ditemukan
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {pickerTarget && (
        <ImagePicker
          open={!!pickerTarget}
          onClose={() => setPickerTarget(null)}
          onSelect={(urls) => {
            if (urls[0]) handleUpdateImage(pickerTarget.code, urls[0])
            setPickerTarget(null)
          }}
        />
      )}
    </div>
  )
}

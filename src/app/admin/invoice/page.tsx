/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Printer, Smartphone, Wifi } from "lucide-react"
import { toast } from "sonner"

const PROVIDERS = [
  { value: "telkomsel", label: "Telkomsel", color: "#CB0A2C" },
  { value: "tri", label: "Tri", color: "#002B7F" },
  { value: "xl", label: "XL", color: "#0033A0" },
  { value: "indosat", label: "Indosat", color: "#003E7E" },
  { value: "axis", label: "Axis", color: "#ED1B24" },
  { value: "smartfren", label: "Smartfren", color: "#E11B22" },
]

const NOMINAL_PULSA = [
  { value: "5000", label: "Rp5.000" },
  { value: "10000", label: "Rp10.000" },
  { value: "25000", label: "Rp25.000" },
  { value: "50000", label: "Rp50.000" },
  { value: "100000", label: "Rp100.000" },
]

const PAYMENT_METHODS = [
  { value: "gopay", label: "GoPay" },
  { value: "ovo", label: "OVO" },
  { value: "dana", label: "Dana" },
  { value: "cash", label: "Cash" },
  { value: "transfer", label: "Transfer Bank" },
]

function generateInvoiceData(prefix: string) {
  const now = new Date()
  const d = String(now.getDate()).padStart(2, "0")
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const y = now.getFullYear()
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ]
  const h = String(now.getHours()).padStart(2, "0")
  const min = String(now.getMinutes()).padStart(2, "0")
  const rand = String(Math.floor(Math.random() * 900000) + 100000)
  const serial = `R${d}${m}${String(y).slice(-2)}.${h}${min}.${rand}`
  const chars = "abcdef0123456789"
  const gpl = `GPL-${Array.from({ length: 14 }, () => chars[Math.floor(Math.random() * 16)]).join("")}`
  const invoiceNo = `${prefix}-${serial}`
  return {
    invoiceNo,
    date: `${d} ${months[now.getMonth()]} ${y}`,
    time: `${h}:${min}`,
    serial,
    gpl,
  }
}

function ProviderLogo({
  provider,
  size = "sm",
}: {
  provider: (typeof PROVIDERS)[0]
  size?: "sm" | "lg"
}) {
  const sizes = size === "lg" ? "w-14 h-14 text-lg" : "w-8 h-8 text-xs"
  const label =
    provider.label === "Telkomsel"
      ? "TS"
      : provider.label === "Tri"
        ? "TR"
        : provider.label === "Smartfren"
          ? "SF"
          : provider.label.slice(0, 2).toUpperCase()
  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-bold ${sizes}`}
      style={{ backgroundColor: provider.color }}
    >
      {label}
    </div>
  )
}

interface PulsaState {
  provider: string
  nomorHp: string
  nominal: string
  harga: number
  paymentMethod: string
  generated: ReturnType<typeof generateInvoiceData> | null
}

interface PaketState {
  provider: string
  nomorHp: string
  namaPaket: string
  harga: number
  paymentMethod: string
  generated: ReturnType<typeof generateInvoiceData> | null
}

const defaultPulsa: PulsaState = {
  provider: "telkomsel",
  nomorHp: "",
  nominal: "10000",
  harga: 10000,
  paymentMethod: "gopay",
  generated: null,
}

const defaultPaket: PaketState = {
  provider: "telkomsel",
  nomorHp: "",
  namaPaket: "",
  harga: 0,
  paymentMethod: "gopay",
  generated: null,
}

export default function InvoicePage() {
  const [pulsa, setPulsa] = useState<PulsaState>(defaultPulsa)
  const [paket, setPaket] = useState<PaketState>(defaultPaket)
  const [activeTab, setActiveTab] = useState("pulsa")

  const getProvider = (value: string) =>
    PROVIDERS.find((p) => p.value === value) || PROVIDERS[0]

  const formatRupiah = (num: number) =>
    `Rp${num.toLocaleString("id-ID")}`

  const handleGeneratePulsa = () => {
    if (!pulsa.nomorHp.trim()) {
      toast.error("Nomor HP harus diisi")
      return
    }
    if (pulsa.nominal === "custom" && pulsa.harga <= 0) {
      toast.error("Harga harus diisi")
      return
    }
    const gen = generateInvoiceData("INV-PL")
    setPulsa((prev) => ({ ...prev, generated: gen }))
    toast.success("Invoice pulsa berhasil dibuat")
  }

  const handleGeneratePaket = () => {
    if (!paket.nomorHp.trim()) {
      toast.error("Nomor HP harus diisi")
      return
    }
    if (!paket.namaPaket.trim()) {
      toast.error("Nama paket harus diisi")
      return
    }
    if (paket.harga <= 0) {
      toast.error("Harga harus diisi")
      return
    }
    const gen = generateInvoiceData("INV-PD")
    setPaket((prev) => ({ ...prev, generated: gen }))
    toast.success("Invoice paket data berhasil dibuat")
  }

  const handleResetPulsa = () => {
    setPulsa(defaultPulsa)
  }

  const handleResetPaket = () => {
    setPaket(defaultPaket)
  }

  const handleNominalChange = (value: string | null) => {
    if (!value) return
    if (value === "custom") {
      setPulsa((prev) => ({ ...prev, nominal: "custom", harga: 0 }))
    } else {
      const num = parseInt(value)
      setPulsa((prev) => ({ ...prev, nominal: value, harga: num }))
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const ReceiptPreview = ({
    type,
    provider,
    nomorHp,
    harga,
    paymentMethod,
    generated,
    namaPaket,
    nominal,
  }: {
    type: "pulsa" | "paket"
    provider: string
    nomorHp: string
    harga: number
    paymentMethod: string
    generated: ReturnType<typeof generateInvoiceData> | null
    namaPaket?: string
    nominal?: string
  }) => {
    if (!generated) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <div className="mb-4 rounded-full bg-muted p-4">
            {type === "pulsa" ? (
              <Smartphone className="h-8 w-8" />
            ) : (
              <Wifi className="h-8 w-8" />
            )}
          </div>
          <p className="text-sm">Klik "Buat Invoice" untuk membuat receipt</p>
        </div>
      )
    }

    const prov = getProvider(provider)
    const payLabel =
      PAYMENT_METHODS.find((p) => p.value === paymentMethod)?.label ||
      paymentMethod

    const Row = ({
      label,
      value,
      mono,
      bold,
      large,
    }: {
      label: string
      value: string
      mono?: boolean
      bold?: boolean
      large?: boolean
    }) => (
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs">{label}</span>
        <span
          className={`text-right ${
            large ? "font-heading text-xl font-bold" : bold ? "font-semibold" : "font-medium"
          } ${mono ? "font-mono text-xs" : "text-sm"}`}
        >
          {value}
        </span>
      </div>
    )

    return (
      <div className="print-area">
        <div className="mx-auto max-w-sm bg-white p-6">
          {/* Header: Logo + Provider */}
          <div className="mb-3 flex items-center gap-3">
            <ProviderLogo provider={prov} size="lg" />
            <div>
              <p className="text-sm font-bold">{prov.label}</p>
              <p className="text-xs text-muted-foreground">
                {type === "pulsa" ? "Pulsa" : "Paket Data"}
              </p>
            </div>
          </div>

          {/* Big Price */}
          <div className="mb-2">
            <span className="font-heading text-3xl font-bold">
              {formatRupiah(harga)}
            </span>
          </div>

          {/* Dibayar ke */}
          <p className="mb-3 text-xs text-muted-foreground">
            Dibayar ke <span className="font-medium text-foreground">{prov.label}</span>
          </p>

          {/* GPL + Status */}
          <div className="mb-4 flex items-center justify-between border-b border-dashed pb-4">
            <span className="font-mono text-xs text-muted-foreground">
              {generated.gpl}
            </span>
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
              Berhasil
            </span>
          </div>

          {/* Detail */}
          <div className="space-y-2.5 text-sm">
            <Row label="Nomor Tujuan" value={nomorHp} />
            {type === "paket" && namaPaket && (
              <Row label="Nama Paket" value={namaPaket} />
            )}
            <Row
              label="Tanggal"
              value={`${generated.date}, ${generated.time}`}
            />
            <Row label="Nomor Serial" value={generated.serial} mono />
            <Row label="Metode Pembayaran" value={payLabel} />
          </div>

          {/* Dashed Divider */}
          <div className="my-4 border-t border-dashed" />

          {/* Jumlah */}
          <Row label="Jumlah" value={formatRupiah(harga)} bold />

          {/* Divider */}
          <div className="my-3 border-t border-dashed" />

          {/* Total */}
          <Row label="Total" value={formatRupiah(harga)} bold large />

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-[10px] text-muted-foreground">
              {generated.invoiceNo}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area,
          .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-area > div {
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
            padding: 0 !important;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>

      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-heading">Invoice</h1>
          <p className="text-muted-foreground">
            Cetak invoice Pulsa &amp; Paket Data
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pulsa" className="gap-2">
              <Smartphone className="h-4 w-4" />
              Pulsa
            </TabsTrigger>
            <TabsTrigger value="paket" className="gap-2">
              <Wifi className="h-4 w-4" />
              Paket Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pulsa">
            <div className="grid gap-6 lg:grid-cols-5">
              {/* Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Form Pulsa</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Provider</Label>
                      <Select
                        value={pulsa.provider}
                        onValueChange={(v) =>
                          v &&
                          setPulsa((prev) => ({ ...prev, provider: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVIDERS.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              <div className="flex items-center gap-2">
                                <ProviderLogo provider={p} />
                                {p.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Nomor HP</Label>
                      <Input
                        placeholder="+628xxx"
                        value={pulsa.nomorHp}
                        onChange={(e) =>
                          setPulsa((prev) => ({
                            ...prev,
                            nomorHp: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Nominal</Label>
                      <Select
                        value={pulsa.nominal}
                        onValueChange={handleNominalChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {NOMINAL_PULSA.map((n) => (
                            <SelectItem key={n.value} value={n.value}>
                              {n.label}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Harga</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={pulsa.harga || ""}
                        onChange={(e) =>
                          setPulsa((prev) => ({
                            ...prev,
                            harga: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Metode Pembayaran</Label>
                      <Select
                        value={pulsa.paymentMethod}
                        onValueChange={(v) =>
                          v &&
                          setPulsa((prev) => ({
                            ...prev,
                            paymentMethod: v,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleGeneratePulsa}
                        className="flex-1"
                      >
                        Buat Invoice
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleResetPulsa}
                      >
                        Reset
                      </Button>
                    </div>

                    {pulsa.generated && (
                      <Button
                        variant="secondary"
                        onClick={handlePrint}
                        className="w-full gap-2"
                      >
                        <Printer className="h-4 w-4" />
                        Cetak Invoice
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Preview */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Preview Receipt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReceiptPreview
                      type="pulsa"
                      provider={pulsa.provider}
                      nomorHp={pulsa.nomorHp}
                      harga={pulsa.harga}
                      paymentMethod={pulsa.paymentMethod}
                      generated={pulsa.generated}
                      nominal={pulsa.nominal}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="paket">
            <div className="grid gap-6 lg:grid-cols-5">
              {/* Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Form Paket Data</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Provider</Label>
                      <Select
                        value={paket.provider}
                        onValueChange={(v) =>
                          v &&
                          setPaket((prev) => ({ ...prev, provider: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVIDERS.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              <div className="flex items-center gap-2">
                                <ProviderLogo provider={p} />
                                {p.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Nomor HP</Label>
                      <Input
                        placeholder="+628xxx"
                        value={paket.nomorHp}
                        onChange={(e) =>
                          setPaket((prev) => ({
                            ...prev,
                            nomorHp: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Nama Paket</Label>
                      <Input
                        placeholder="Contoh: OMG! 75GB 30 Hari"
                        value={paket.namaPaket}
                        onChange={(e) =>
                          setPaket((prev) => ({
                            ...prev,
                            namaPaket: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Harga</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={paket.harga || ""}
                        onChange={(e) =>
                          setPaket((prev) => ({
                            ...prev,
                            harga: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Metode Pembayaran</Label>
                      <Select
                        value={paket.paymentMethod}
                        onValueChange={(v) =>
                          v &&
                          setPaket((prev) => ({
                            ...prev,
                            paymentMethod: v,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleGeneratePaket}
                        className="flex-1"
                      >
                        Buat Invoice
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleResetPaket}
                      >
                        Reset
                      </Button>
                    </div>

                    {paket.generated && (
                      <Button
                        variant="secondary"
                        onClick={handlePrint}
                        className="w-full gap-2"
                      >
                        <Printer className="h-4 w-4" />
                        Cetak Invoice
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Preview */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Preview Receipt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReceiptPreview
                      type="paket"
                      provider={paket.provider}
                      nomorHp={paket.nomorHp}
                      harga={paket.harga}
                      paymentMethod={paket.paymentMethod}
                      generated={paket.generated}
                      namaPaket={paket.namaPaket}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

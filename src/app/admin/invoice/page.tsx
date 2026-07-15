/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { QRCodeSVG } from "qrcode.react"
import { Printer, Smartphone, Wifi, Copy, Check, ArrowRight } from "lucide-react"
import { toast } from "sonner"

const SERVICES = ["pulsa", "paket_data", "token_listrik", "bpjs", "e_wallet", "game_voucher"] as const

const PROVIDERS = [
  { value: "gopay", label: "GoPay", color: "#4C3494" },
  { value: "telkomsel", label: "Telkomsel", color: "#CB0A2C" },
  { value: "tri", label: "Tri", color: "#002B7F" },
  { value: "xl", label: "XL", color: "#0033A0" },
  { value: "indosat", label: "Indosat", color: "#003E7E" },
  { value: "axis", label: "Axis", color: "#ED1B24" },
  { value: "smartfren", label: "Smartfren", color: "#E11B22" },
  { value: "ovo", label: "OVO", color: "#4C2492" },
  { value: "dana", label: "Dana", color: "#108EE9" },
  { value: "shopeepay", label: "ShopeePay", color: "#EE4D2D" },
  { value: "linkaja", label: "LinkAja", color: "#E4002B" },
]

const STATUS_OPTIONS = ["Berhasil", "Gagal", "Pending", "Refund"]
const PAYMENT_METHODS = ["GoPay Saldo", "OVO Cash", "Dana", "ShopeePay", "LinkAja", "Transfer Bank", "Cash"]

const SERVICE_LABELS: Record<string, string> = {
  pulsa: "Pulsa",
  paket_data: "Paket Data",
  token_listrik: "Token Listrik",
  bpjs: "BPJS",
  e_wallet: "E-Wallet",
  game_voucher: "Game Voucher",
}

function generateRefId(): string {
  const date = new Date()
  const d = String(date.getDate()).padStart(2, "0")
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const y = String(date.getFullYear()).slice(-2)
  const h = String(date.getHours()).padStart(2, "0")
  const min = String(date.getMinutes()).padStart(2, "0")
  const s = String(date.getSeconds()).padStart(2, "0")
  const rand = String(Math.floor(Math.random() * 90000) + 10000)
  return `${d}${m}${y}${h}${min}${s}${rand}`
}

function generateSerial(): string {
  const date = new Date()
  const d = String(date.getDate()).padStart(2, "0")
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const y = String(date.getFullYear()).toString().slice(-2)
  const h = String(date.getHours()).padStart(2, "0")
  const min = String(date.getMinutes()).padStart(2, "0")
  const rand = String(Math.floor(Math.random() * 900000) + 100000)
  return `R${d}${m}${y}.${h}${min}.${rand}`
}

function getCurrentDate(): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
  const d = new Date()
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function getCurrentTime(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

function ProviderLogo({ color, label, size = "sm" }: { color: string; label: string; size?: "sm" | "lg" }) {
  const dims = size === "lg" ? "w-12 h-12 text-base" : "w-8 h-8 text-xs"
  const initials = label === "Telkomsel" ? "TS" : label === "Tri" ? "TR" : label === "Smartfren" ? "SF" : label.slice(0, 2).toUpperCase()
  return (
    <div className={`${dims} flex items-center justify-center rounded-full text-white font-bold shrink-0`} style={{ backgroundColor: color }}>
      {initials}
    </div>
  )
}

interface ReceiptData {
  service: string
  provider: string
  providerLabel: string
  providerColor: string
  status: string
  paymentMethod: string
  nomorHp: string
  productName: string
  price: number
  discount: number
  adminFee: number
  total: number
  refId: string
  eksternalId: string
  serialNumber: string
  date: string
  time: string
  qrValue: string
  chatUrl: string
}

const emptyForm: ReceiptData = {
  service: "pulsa",
  provider: "gopay",
  providerLabel: "GoPay",
  providerColor: "#4C3494",
  status: "Berhasil",
  paymentMethod: "GoPay Saldo",
  nomorHp: "",
  productName: "",
  price: 0,
  discount: 0,
  adminFee: 0,
  total: 0,
  refId: "",
  eksternalId: "",
  serialNumber: "",
  date: getCurrentDate(),
  time: getCurrentTime(),
  qrValue: "",
  chatUrl: "",
}

export default function InvoicePage() {
  const [form, setForm] = useState<ReceiptData>({ ...emptyForm })
  const [generated, setGenerated] = useState<ReceiptData | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const getProvider = (val: string) => PROVIDERS.find(p => p.value === val) || PROVIDERS[0]

  function updateField<K extends keyof ReceiptData>(key: K, value: ReceiptData[K]) {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === "provider") {
        const p = getProvider(value as string)
        next.providerLabel = p.label
        next.providerColor = p.color
      }
      if (key === "price" || key === "discount" || key === "adminFee") {
        next.total = Math.max(0, (key === "price" ? (value as number) : prev.price) - (key === "discount" ? (value as number) : prev.discount) + (key === "adminFee" ? (value as number) : prev.adminFee))
      }
      return next
    })
  }

  function handleGenerate() {
    if (!form.nomorHp.trim()) { toast.error("Nomor HP harus diisi"); return }
    if (!form.productName.trim()) { toast.error("Nama produk harus diisi"); return }
    if (form.price <= 0) { toast.error("Harga harus diisi"); return }

    const refId = form.refId || `042026${generateRefId()}`
    const eksternalId = form.eksternalId || `${generateRefId().slice(0, 6)}-${generateRefId().slice(6, 12)}-GOPULSA`
    const serialNumber = form.serialNumber || generateSerial()

    setGenerated({
      ...form,
      refId,
      eksternalId,
      serialNumber,
      date: getCurrentDate(),
      time: getCurrentTime(),
      total: Math.max(0, form.price - form.discount + form.adminFee),
    })
    toast.success("Receipt berhasil dibuat!")
  }

  function handleReset() {
    setForm({ ...emptyForm })
    setGenerated(null)
  }

  function handlePrint() {
    window.print()
  }

  function handleCopy(val: string, key: string) {
    navigator.clipboard.writeText(val)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  function formatRupiah(num: number) {
    return `Rp${num.toLocaleString("id-ID")}`
  }

  const fmt = generated || form

  const DetailRow = ({ label, value, mono, copyKey }: { label: string; value: string; mono?: boolean; copyKey?: string }) => (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={`text-xs text-right ${mono ? "font-mono" : "font-medium"} text-gray-900`}>{value}</span>
        {copyKey && (
          <button onClick={() => handleCopy(value, copyKey)} className="shrink-0">
            {copiedKey === copyKey ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600" />}
          </button>
        )}
      </div>
    </div>
  )

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = { Berhasil: "text-green-600", Gagal: "text-red-500", Pending: "text-yellow-500", Refund: "text-blue-500" }
    return <span className={`text-xs font-semibold ${colors[status] || "text-gray-500"}`}>{status} {status === "Berhasil" && "✅"}</span>
  }

  const Receipt = ({ data }: { data: ReceiptData }) => {
    const prov = getProvider(data.provider)
    return (
      <div className="mx-auto max-w-sm">
        <div className="print-area overflow-hidden rounded-2xl">
          {/* Header */}
          <div className="px-6 pt-8 pb-6 text-white text-center" style={{ backgroundColor: prov.color }}>
            <ProviderLogo color={prov.color} label={prov.label} size="lg" />
            <p className="text-sm font-semibold mt-2 opacity-80">{SERVICE_LABELS[data.service] || data.service}</p>
            <p className="text-lg font-bold mt-0.5">{prov.label}</p>
          </div>

          {/* Body card */}
          <div className="bg-white px-6 py-6 space-y-4">
            {/* Receipt icon */}
            <div className="flex justify-center -mt-10 mb-2">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md mt-2">
                  <Wifi className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="text-center">
              <p className="text-3xl font-extrabold text-gray-900">{formatRupiah(data.total)}</p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{data.productName}</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{data.nomorHp}</p>
              <p className="text-[10px] text-gray-400 font-mono mt-1">#{data.eksternalId}</p>
            </div>

            {/* Chat button */}
            {data.chatUrl && (
              <a href={data.chatUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors">
                Chat dengan CS <ArrowRight className="h-3 w-3" />
              </a>
            )}

            {/* Dashed divider */}
            <div className="border-t border-dashed border-gray-200" />

            {/* Rincian transaksi */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Rincian transaksi</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status</span>
                  <StatusBadge status={data.status} />
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-gray-500">Metode bayar</span>
                  <span className="text-xs font-medium text-gray-900">💳 {data.paymentMethod}</span>
                </div>
                <DetailRow label="Waktu" value={data.time} />
                <DetailRow label="Tanggal" value={data.date} />
                <DetailRow label="ID transaksi" value={data.refId} mono copyKey="refId" />
                <DetailRow label="ID Eksternal" value={data.eksternalId} mono copyKey="eksternal" />
                <DetailRow label="Nomor serial" value={data.serialNumber} mono />
              </div>
            </div>

            {/* Dashed divider */}
            <div className="border-t border-dashed border-gray-200" />

            {/* Pricing */}
            <div className="space-y-1.5">
              <DetailRow label="Jumlah" value={formatRupiah(data.price)} />
              {data.discount > 0 && <DetailRow label="Diskon" value={`-${formatRupiah(data.discount)}`} />}
              {data.adminFee > 0 && <DetailRow label="Biaya admin" value={formatRupiah(data.adminFee)} />}
            </div>

            <div className="border-t-2 border-double border-gray-300 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-lg font-extrabold text-gray-900">{formatRupiah(data.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer with QR */}
          <div className="px-6 pt-6 pb-8 text-center" style={{ backgroundColor: prov.color }}>
            {data.qrValue && (
              <div className="bg-white rounded-xl p-3 inline-block mb-3 shadow-md">
                <QRCodeSVG value={data.qrValue} size={100} level="M" />
              </div>
            )}
            <p className="text-xs text-white/70 mt-1">Scan untuk detail transaksi</p>
            <p className="text-[11px] text-white/50 mt-2">Dikirim dari app {prov.label}</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="bg-black/20 rounded-lg px-3 py-1.5 text-[10px] text-white/80 font-medium">App Store</div>
              <div className="bg-black/20 rounded-lg px-3 py-1.5 text-[10px] text-white/80 font-medium">Google Play</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .print-area > div { box-shadow: none !important; }
          @page { margin: 0; }
        }
      `}</style>

      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-heading">Invoice</h1>
          <p className="text-muted-foreground">Cetak receipt pembayaran — template GoPay</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <p className="text-sm font-semibold font-heading">Data Transaksi</p>

                <div className="space-y-2">
                  <Label className="text-xs">Layanan</Label>
                  <Select value={form.service} onValueChange={v => v && updateField("service", v)}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SERVICES.map(s => (
                        <SelectItem key={s} value={s} className="text-xs">{SERVICE_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Provider / Channel</Label>
                  <Select value={form.provider} onValueChange={v => v && updateField("provider", v)}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROVIDERS.map(p => (
                        <SelectItem key={p.value} value={p.value} className="text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }} />
                            {p.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Status</Label>
                    <Select value={form.status} onValueChange={v => v && updateField("status", v)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(s => (
                          <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Metode Bayar</Label>
                    <Select value={form.paymentMethod} onValueChange={v => v && updateField("paymentMethod", v)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map(m => (
                          <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Nomor HP</Label>
                  <Input placeholder="08981103804" value={form.nomorHp} onChange={e => updateField("nomorHp", e.target.value)} className="h-9 text-xs" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Nama Produk</Label>
                  <Input placeholder="GoPulsa - TRI Happy Play Movies 25GB" value={form.productName} onChange={e => updateField("productName", e.target.value)} className="h-9 text-xs" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Harga</Label>
                    <Input type="number" placeholder="78500" value={form.price || ""} onChange={e => updateField("price", parseInt(e.target.value) || 0)} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Diskon</Label>
                    <Input type="number" placeholder="8000" value={form.discount || ""} onChange={e => updateField("discount", parseInt(e.target.value) || 0)} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Admin</Label>
                    <Input type="number" placeholder="0" value={form.adminFee || ""} onChange={e => updateField("adminFee", parseInt(e.target.value) || 0)} className="h-9 text-xs" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-4">
                <p className="text-sm font-semibold font-heading">Referensi & QR</p>

                <div className="space-y-2">
                  <Label className="text-xs">ID Transaksi (kosongi untuk auto)</Label>
                  <Input placeholder="042026020910543..." value={form.refId} onChange={e => updateField("refId", e.target.value)} className="h-9 text-xs font-mono" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">ID Eksternal (kosongi untuk auto)</Label>
                  <Input placeholder="1359838484-839585..." value={form.eksternalId} onChange={e => updateField("eksternalId", e.target.value)} className="h-9 text-xs font-mono" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Nomor Serial (kosongi untuk auto)</Label>
                  <Input placeholder="R260209..." value={form.serialNumber} onChange={e => updateField("serialNumber", e.target.value)} className="h-9 text-xs font-mono" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">QR Code Value</Label>
                  <Input placeholder="Kode manual untuk QR" value={form.qrValue} onChange={e => updateField("qrValue", e.target.value)} className="h-9 text-xs" />
                  <p className="text-[10px] text-muted-foreground">Masukkan teks/apapun untuk digenerate sebagai QR code</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">URL Chat CS (opsional)</Label>
                  <Input placeholder="https://wa.me/628xxx" value={form.chatUrl} onChange={e => updateField("chatUrl", e.target.value)} className="h-9 text-xs" />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleGenerate} className="flex-1">Buat Receipt</Button>
              <Button variant="outline" onClick={handleReset}>Reset</Button>
              {generated && (
                <Button variant="secondary" onClick={handlePrint} className="gap-2">
                  <Printer className="h-4 w-4" /> Cetak
                </Button>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-5">
                {generated ? (
                  <Receipt data={generated} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Smartphone className="h-10 w-10 mb-3 text-gray-300" />
                    <p className="text-sm">Isi form dan klik "Buat Receipt"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

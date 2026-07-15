/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
import { QRCodeSVG } from "qrcode.react"
import { Printer, Smartphone, Copy, Check, ChevronRight, FileText, Bookmark } from "lucide-react"
import { toast } from "sonner"

const SERVICES = ["pulsa", "paket_data", "token_listrik", "bpjs", "e_wallet", "game_voucher"] as const

const PROVIDERS = [
  { value: "gopay", label: "GoPay", color: "#0081A0", gradientFrom: "#2B61FD", gradientTo: "#2B61FD" },
  { value: "telkomsel", label: "Telkomsel", color: "#CB0A2C", gradientFrom: "#E0112F", gradientTo: "#A00822" },
  { value: "tri", label: "Tri", color: "#002B7F", gradientFrom: "#003399", gradientTo: "#001A4D" },
]

const STATUS_OPTIONS = ["Berhasil", "Gagal", "Pending", "Refund"]
const PAYMENT_METHODS = ["GoPay Saldo", "OVO Cash", "Dana", "ShopeePay", "Transfer Bank"]

const SERVICE_LABELS: Record<string, string> = {
  pulsa: "GoPulsa",
  paket_data: "Paket Data",
  token_listrik: "Token Listrik",
  bpjs: "BPJS",
  e_wallet: "E-Wallet",
  game_voucher: "Game Voucher",
}

function generateRefId(): string {
  return "042026020910543" + Math.floor(Math.random() * 10)
}

function generateEksternalId(): string {
  return "1359838484-839585-GOPULSA"
}

function generateSerial(): string {
  return "R260209.1754.2200a0"
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
  providerColor: "#2B61FD",
  status: "Berhasil",
  paymentMethod: "GoPay Saldo",
  nomorHp: "08981103804",
  productName: "TRI Happy Play Movies 25GB 30 Hari",
  price: 78500,
  discount: 8000,
  adminFee: 0,
  total: 70500,
  refId: "042026020910543",
  eksternalId: "1359838484-839585-GOPULSA",
  serialNumber: "R260209.1754.2200a0",
  date: "09 Feb 2026",
  time: "17:54",
  qrValue: "https://gopay.co.id",
  chatUrl: "#",
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

    setGenerated({
      ...form,
      refId: form.refId || generateRefId(),
      eksternalId: form.eksternalId || generateEksternalId(),
      serialNumber: form.serialNumber || generateSerial(),
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
    return `Rp${num.toLocaleString("id-ID").replace(/,/g, ".")}`
  }

  const DetailRow = ({ label, value, copyKey, isTruncated }: { label: string; value: string; copyKey?: string; isTruncated?: boolean }) => (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="flex items-center gap-1 max-w-[65%]">
        <span className={`text-sm text-right font-medium text-gray-900 ${isTruncated ? "truncate block max-w-[150px]" : ""}`}>{value}</span>
        {copyKey && (
          <button onClick={() => handleCopy(value, copyKey)} className="shrink-0 p-0.5 text-gray-400 hover:text-gray-600">
            {copiedKey === copyKey ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  )

  const Receipt = ({ data }: { data: ReceiptData }) => {
    return (
      <div className="mx-auto max-w-[380px] font-sans antialiased print-area">
        {/* Main Custom Blue/Purple Container */}
        <div className="bg-[#4424ff] rounded-[32px] p-4 flex flex-col items-center shadow-md select-none">
          
          {/* GoPay Header Logo */}
          <div className="flex items-center justify-center gap-2 text-white my-2">
            {/* Circle icon with wallet SVG */}
            <div className="w-8 h-8 flex items-center justify-center">
              <svg viewBox="0 0 37.5 37.4" className="h-8 w-8">
                <circle cx="18.75" cy="18.7" r="18.7" fill="white"/>
                <path fill="#00AED6" d="M18.7,0C8.4,0,0,8.4,0,18.7C0,29,8.4,37.4,18.7,37.4c10.3,0,18.7-8.4,18.7-18.7C37.5,8.4,29.1,0,18.7,0z M29.2,24.5c-0.2,2-1.7,3.5-3.6,3.9c-4.3,0.5-8.7,0.5-13.1,0c-2.2-0.4-3.9-2-4.3-4.2c-0.6-3.7-0.6-7.4,0-11.1C8.5,11.2,10,9.5,12,9c3.5-0.6,7.1-0.6,10.6,0c1.6,0.4,2.7,1.8,2.7,3.4h-12c0,0-0.1,0-0.1,0c-0.4,0-0.8,0.4-0.7,0.8c0,0.4,0.4,0.8,0.8,0.7h12.2c2.2,0.1,4,1.9,4.2,4.1C29.7,20.3,29.6,22.4,29.2,24.5z"/>
                <path fill="#00AED6" d="M25,18.7c-0.6,0-1.2,0.5-1.2,1.2c0,0.3,0.1,0.6,0.4,0.9v0.7c0,0.4,0.3,0.8,0.8,0.8s0.8-0.3,0.8-0.8v-0.7c0.2-0.2,0.4-0.5,0.4-0.9C26.2,19.2,25.6,18.7,25,18.7z"/>
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight">gopay</span>
          </div>

          {/* White Paper Ticket */}
          <div className="w-full relative shadow-sm flex flex-col">
            
            {/* Top Scallop Gerigi Kertas (Menggunakan #4424ff) */}
            <div 
              className="w-full h-3 bg-white rounded-t-2xl"
              style={{
                backgroundImage: 'radial-gradient(circle at 50% 0%, #4424ff 6px, white 7px)',
                backgroundSize: '16px 12px',
                backgroundPosition: 'center top',
                backgroundRepeat: 'repeat-x'
              }}
            />

            {/* White Card Body */}
            <div className="w-full bg-white px-5 py-3">
              {/* Overlapping Rounded Icons Header */}
              <div className="flex justify-center mb-3">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#EBF7FA] border border-white flex items-center justify-center shadow-sm absolute left-0 z-0">
                    <FileText className="h-5 w-5 text-[#00AED6]" />
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#EBF7FA] border-2 border-white flex items-center justify-center shadow-sm absolute right-1 bottom-1 z-10">
                    <Bookmark className="h-3 w-3 text-[#00AED6]" fill="#00AED6" />
                  </div>
                </div>
              </div>

              {/* Title / Amount */}
              <div className="text-center mb-6 px-2">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{formatRupiah(data.total)}</h2>
                <p className="text-sm text-gray-500 mt-2 font-normal leading-tight">
                  {SERVICE_LABELS[data.service]} - {data.productName} - {data.nomorHp}
                </p>
                <p className="text-xs text-gray-400 mt-1 font-normal break-all">#{data.eksternalId}</p>
              </div>

              {/* Chat dengan CS pill */}
              <div className="px-1 mb-6">
                <div className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-100 rounded-full shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#E6EDFF] flex items-center justify-center">
                      <span className="text-xs">🎧</span>
                    </div>
                    <span className="text-xs font-medium text-gray-700">Chat dengan CS</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-green-600 stroke-[2.5]" />
                </div>
              </div>

              {/* Dashed Separator */}
              <div className="border-t border-dashed border-gray-200 my-4" />

              {/* Section: Rincian Transaksi */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Rincian transaksi</h3>
                
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-500">Status</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-green-600">Selesai</span>
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white text-[9px] font-bold">✓</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-500">Metode pembayaran</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-gray-900">{data.paymentMethod}</span>
                    <div className="w-4 h-4 rounded bg-[#00AED6] flex items-center justify-center">
                      <svg viewBox="0 0 37.5 37.4" className="h-3 w-3">
                        <path fill="white" d="M18.7,0C8.4,0,0,8.4,0,18.7C0,29,8.4,37.4,18.7,37.4c10.3,0,18.7-8.4,18.7-18.7C37.5,8.4,29.1,0,18.7,0z M29.2,24.5c-0.2,2-1.7,3.5-3.6,3.9c-4.3,0.5-8.7,0.5-13.1,0c-2.2-0.4-3.9-2-4.3-4.2c-0.6-3.7-0.6-7.4,0-11.1C8.5,11.2,10,9.5,12,9c3.5-0.6,7.1-0.6,10.6,0c1.6,0.4,2.7,1.8,2.7,3.4h-12c0,0-0.1,0-0.1,0c-0.4,0-0.8,0.4-0.7,0.8c0,0.4,0.4,0.8,0.8,0.7h12.2c2.2,0.1,4,1.9,4.2,4.1C29.7,20.3,29.6,22.4,29.2,24.5z"/>
                        <path fill="white" d="M25,18.7c-0.6,0-1.2,0.5-1.2,1.2c0,0.3,0.1,0.6,0.4,0.9v0.7c0,0.4,0.3,0.8,0.8,0.8s0.8-0.3,0.8-0.8v-0.7c0.2-0.2,0.4-0.5,0.4-0.9C26.2,19.2,25.6,18.7,25,18.7z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <DetailRow label="Waktu" value={data.time} />
                <DetailRow label="Tanggal" value={data.date} />
                <DetailRow label="ID transaksi" value={data.refId} copyKey="refId" isTruncated={true} />
                <DetailRow label="ID Transaksi Gojek" value={data.eksternalId} copyKey="eksternal" isTruncated={true} />
                <DetailRow label="Nomor serial" value={data.serialNumber} />
              </div>

              {/* Dashed Separator */}
              <div className="border-t border-dashed border-gray-200 my-4" />

              {/* Section: Calculations */}
              <div className="space-y-2 mb-4">
                <DetailRow label="Jumlah" value={formatRupiah(data.price)} />
                {data.discount > 0 && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-500">Diskon</span>
                    <span className="text-sm font-medium text-gray-900">-{formatRupiah(data.discount)}</span>
                  </div>
                )}
                {data.adminFee > 0 && <DetailRow label="Biaya admin" value={formatRupiah(data.adminFee)} />}
              </div>

              {/* Solid Separator */}
              <div className="border-t border-gray-200 pt-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">Total</span>
                  <span className="text-base font-bold text-gray-900">{formatRupiah(data.total)}</span>
                </div>
              </div>
            </div>

            {/* Bottom Scallop Gerigi Kertas (Menggunakan #4424ff) */}
            <div 
              className="w-full h-3 bg-white rounded-b-2xl"
              style={{
                backgroundImage: 'radial-gradient(circle at 50% 100%, #4424ff 6px, white 7px)',
                backgroundSize: '16px 12px',
                backgroundPosition: 'center bottom',
                backgroundRepeat: 'repeat-x'
              }}
            />
          </div>

          {/* Blue Bottom Area (QR Code & Promo Text) */}
          <div className="w-full pt-6 pb-4 px-2 flex items-start gap-4 text-white">
            {/* QR Code Left Side */}
            {data.qrValue && (
              <div className="bg-white rounded-xl p-1.5 inline-block shrink-0 shadow-sm relative">
                <QRCodeSVG value={data.qrValue} size={84} level="M" includeMargin={false} />
                <div className="absolute inset-0 m-auto w-5 h-5 bg-[#00AED6] rounded-full border border-white flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">●</span>
                </div>
              </div>
            )}
            
            {/* Promo Text & Download Badges Right Side */}
            <div className="flex-1 text-left flex flex-col justify-between h-full pt-0.5">
              <div>
                <p className="text-[13px] font-bold leading-snug tracking-wide">
                  Dikirim dari app GoPay. Dapetin gratis transfer 100x/bulan!
                </p>
                <p className="text-[11px] text-white/80 mt-0.5 font-normal leading-normal">
                  Aplikasi ringan buat kebutuhan finansialmu.
                </p>
              </div>
              
              {/* App Store / Google Play Icons Horizontal */}
              <div className="flex items-center gap-2 mt-3">
                {/* App Store */}
                <div className="bg-black text-white rounded px-2 py-0.5 flex items-center gap-1 border border-white/10 h-[26px]">
                  <svg className="h-3 w-3 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.62-.71 1.64-1.23 2.6-1.13.1 1.04-.3 2.08-.93 2.84-.63.74-1.64 1.18-2.67 1.02-.1-1.02.33-2.07.98-2.73z"/>
                  </svg>
                  <div className="text-left leading-none">
                    <p className="text-[5px] opacity-60 uppercase font-sans tracking-tight">Download on the</p>
                    <p className="text-[8px] font-bold font-sans tracking-tight">App Store</p>
                  </div>
                </div>

                {/* Google Play */}
                <div className="bg-black text-white rounded px-2 py-0.5 flex items-center gap-1 border border-white/10 h-[26px]">
                  <svg className="h-3 w-3 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 0 1 0 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                  </svg>
                  <div className="text-left leading-none">
                    <p className="text-[5px] opacity-60 uppercase font-sans tracking-tight">GET IT ON</p>
                    <p className="text-[8px] font-bold font-sans tracking-tight">Google Play</p>
                  </div>
                </div>
              </div>
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
          <h1 className="text-2xl font-bold font-heading">Invoice Builder</h1>
          <p className="text-muted-foreground">Kustomisasi struk transaksi agar persis dengan template GoPay asli.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5 items-start">
          {/* Form input data */}
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
                  <Input placeholder="TRI Happy Play Movies 25GB 30 Hari" value={form.productName} onChange={e => updateField("productName", e.target.value)} className="h-9 text-xs" />
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

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px]">Waktu</Label>
                    <Input value={form.time} onChange={e => updateField("time", e.target.value)} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Tanggal</Label>
                    <Input value={form.date} onChange={e => updateField("date", e.target.value)} className="h-8 text-xs" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleGenerate} className="flex-1 bg-blue-600 hover:bg-blue-700">Buat Preview</Button>
              <Button variant="outline" onClick={handleReset}>Reset</Button>
              {generated && (
                <Button variant="secondary" onClick={handlePrint} className="gap-2">
                  <Printer className="h-4 w-4" /> Cetak
                </Button>
              )}
            </div>
          </div>

          {/* Area Preview */}
          <div className="lg:col-span-3 sticky top-4">
            <Card className="bg-slate-50 border-dashed">
              <CardContent className="p-6">
                {generated ? (
                  <Receipt data={generated} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-muted-foreground bg-white rounded-xl border shadow-inner">
                    <Smartphone className="h-10 w-10 mb-3 text-gray-300 animate-pulse" />
                    <p className="text-sm">Klik <strong className="text-blue-600">"Buat Preview"</strong> untuk memuat tampilan struk GoPay.</p>
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
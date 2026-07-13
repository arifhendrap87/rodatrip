/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, FileText } from "lucide-react"
import { Layout } from "lucide-react"

interface CalendarDraft {
  id: string
  title: string
  platform: string
  concept_type: string
  status: string
  scheduled_at: string
  content_type: string
  caption: string
  text_overlays: string[]
  image_prompts: string[]
}

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [drafts, setDrafts] = useState<CalendarDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    fetchScheduled()
  }, [])

  async function fetchScheduled() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/content-generator/drafts?scheduled=true&limit=200")
      const json = await res.json()
      if (res.ok) setDrafts(json.data.drafts || [])
    } catch {}
    setLoading(false)
  }

  const scheduledMap: Record<string, CalendarDraft[]> = {}
  for (const d of drafts) {
    if (!d.scheduled_at) continue
    const dateKey = d.scheduled_at.substring(0, 10)
    if (!scheduledMap[dateKey]) scheduledMap[dateKey] = []
    scheduledMap[dateKey].push(d)
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const todayStr = new Date().toISOString().substring(0, 10)

  function goBack() { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  function goForward() { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }

  const selectedDrafts = selectedDate ? scheduledMap[selectedDate] || [] : []
  const dateObj = selectedDate ? new Date(selectedDate + "T12:00:00") : null

  async function handleUnschedule(id: string) {
    try {
      const res = await fetch("/api/admin/content-generator/drafts", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, scheduled_at: null })
      })
      if (res.ok) { setDrafts((prev) => prev.map((d) => d.id === id ? { ...d, scheduled_at: "" } : d)); toast.success("Jadwal dibatalkan") }
    } catch { toast.error("Gagal") }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Kalender Konten
        </h1>
        <p className="text-muted-foreground">Atur jadwal publikasi konten sosial media</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={goBack}><ChevronLeft className="h-5 w-5" /></Button>
                <CardTitle className="text-lg">{MONTHS[month]} {year}</CardTitle>
                <Button variant="ghost" size="icon" onClick={goForward}><ChevronRight className="h-5 w-5" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                {DAYS.map((d) => (
                  <div key={d} className="bg-muted/50 p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-card p-2 min-h-[80px]" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                  const dayDrafts = scheduledMap[dateStr] || []
                  const isToday = dateStr === todayStr
                  const isSelected = dateStr === selectedDate
                  return (
                    <button key={day}
                      onClick={() => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
                      className={`bg-card p-1.5 min-h-[80px] text-left transition-colors hover:bg-muted/50 border-0 cursor-pointer ${
                        isSelected ? "ring-2 ring-primary ring-inset" : ""
                      }`}
                    >
                      <span className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full mb-1 ${
                        isToday ? "bg-primary text-primary-foreground font-bold" : "text-foreground"
                      }`}>
                        {day}
                      </span>
                      {dayDrafts.length > 0 && (
                        <div className="space-y-0.5">
                          {dayDrafts.slice(0, 3).map((d) => (
                            <div key={d.id}
                              className={`text-[9px] px-1 py-0.5 rounded truncate font-medium ${
                                d.status === "published" ? "bg-green-100 text-green-700" :
                                d.concept_type === "carousel" ? "bg-purple-100 text-purple-700" :
                                "bg-blue-100 text-blue-700"
                              }`}>
                              {d.concept_type === "carousel" ? "🎠" : "📝"} {d.title.slice(0, 15)}
                            </div>
                          ))}
                          {dayDrafts.length > 3 && (
                            <div className="text-[9px] text-muted-foreground pl-1">+{dayDrafts.length - 3} lagi</div>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">📅 Agenda</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedDate ? (
                <p className="text-sm text-muted-foreground text-center py-8">Klik tanggal di kalender untuk melihat jadwal</p>
              ) : selectedDrafts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Tidak ada konten di</p>
                  <p className="text-sm font-medium mt-1">{dateObj?.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {selectedDrafts.length} konten — {dateObj?.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  {selectedDrafts.map((d) => (
                    <div key={d.id} className="rounded-xl border border-border/50 p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        {d.concept_type === "carousel" ? <Layout className="h-3.5 w-3.5 text-purple-500" /> : <FileText className="h-3.5 w-3.5 text-blue-500" />}
                        <p className="text-sm font-medium truncate flex-1">{d.title}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          d.status === "published" ? "bg-green-100 text-green-700" :
                          d.status === "archived" ? "bg-gray-100 text-gray-500" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>{d.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">{d.content_type} · {d.concept_type}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Link href={d.concept_type === "carousel" ? "/admin/content-generator/drafts" : "/admin/content-generator/drafts"}>
                          <Button variant="outline" size="sm" className="h-7 text-xs">Lihat</Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => handleUnschedule(d.id)}>Batal</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

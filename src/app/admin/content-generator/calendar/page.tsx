/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, FileText, Layout, CheckCircle, Clock, XCircle, AtSign } from "lucide-react"

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

const STATUS_ICONS: Record<string, { icon: any; color: string }> = {
  pending: { icon: Clock, color: "bg-yellow-100 text-yellow-700" },
  publishing: { icon: Clock, color: "bg-blue-100 text-blue-700" },
  published: { icon: CheckCircle, color: "bg-green-100 text-green-700" },
  failed: { icon: XCircle, color: "bg-red-100 text-red-700" },
}

const PLATFORM_COLORS: Record<string, string> = {
  twitter: "bg-sky-100 text-sky-700",
  instagram: "bg-pink-100 text-pink-700",
  facebook: "bg-blue-100 text-blue-700",
  threads: "bg-purple-100 text-purple-700",
}

interface ScheduledPost {
  id: string
  draft_id: string
  platform: string
  scheduled_at: string
  status: string
  published_at: string | null
  post_url: string | null
  error_message: string | null
}

interface CalendarDraft {
  id: string
  title: string
  platform: string
  concept_type: string
  status: string
  scheduled_at: string
  content_type: string
}

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [drafts, setDrafts] = useState<CalendarDraft[]>([])
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [draftRes, schedRes] = await Promise.all([
        fetch("/api/admin/content-generator/drafts?scheduled=true&limit=200"),
        fetch("/api/admin/social/schedule?limit=200"),
      ])
      if (draftRes.ok) {
        const json = await draftRes.json()
        setDrafts(json.data?.drafts || [])
      }
      if (schedRes.ok) {
        const json = await schedRes.json()
        setScheduledPosts(json.data?.posts || [])
      }
    } catch {}
    setLoading(false)
  }

  const scheduledMap: Record<string, { drafts: CalendarDraft[]; posts: ScheduledPost[] }> = {}

  for (const d of drafts) {
    if (!d.scheduled_at) continue
    const dateKey = d.scheduled_at.substring(0, 10)
    if (!scheduledMap[dateKey]) scheduledMap[dateKey] = { drafts: [], posts: [] }
    scheduledMap[dateKey].drafts.push(d)
  }

  for (const p of scheduledPosts) {
    if (!p.scheduled_at) continue
    const dateKey = p.scheduled_at.substring(0, 10)
    if (!scheduledMap[dateKey]) scheduledMap[dateKey] = { drafts: [], posts: [] }
    scheduledMap[dateKey].posts.push(p)
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const todayStr = new Date().toISOString().substring(0, 10)

  function goBack() { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  function goForward() { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }

  const selectedData = selectedDate ? scheduledMap[selectedDate] : null
  const selectedPosts = selectedData?.posts || []
  const selectedDrafts = selectedData?.drafts || []
  const totalSelected = selectedPosts.length + selectedDrafts.length
  const dateObj = selectedDate ? new Date(selectedDate + "T12:00:00") : null

  async function handleUnschedule(draftId: string) {
    try {
      const res = await fetch("/api/admin/content-generator/drafts", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: draftId, scheduled_at: null })
      })
      if (res.ok) {
        setDrafts((prev) => prev.map((d) => d.id === draftId ? { ...d, scheduled_at: "" } : d))
        toast.success("Jadwal dibatalkan")
      }
    } catch { toast.error("Gagal") }
  }

  async function handleCancelSchedule(postId: string) {
    try {
      const res = await fetch(`/api/admin/social/schedule/${postId}`, { method: "DELETE" })
      if (res.ok) {
        setScheduledPosts((prev) => prev.filter((p) => p.id !== postId))
        toast.success("Jadwal auto-publish dibatalkan")
      }
    } catch { toast.error("Gagal") }
  }

  async function handlePublishNow(postId: string) {
    try {
      const res = await fetch("/api/cron/publish")
      if (res.ok) {
        toast.success("Proses publish dijalankan. Refresh untuk lihat hasil.")
        fetchAll()
      } else {
        toast.error("Gagal memproses publish")
      }
    } catch { toast.error("Gagal") }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Kalender Konten
          </h1>
          <p className="text-muted-foreground">Atur jadwal publikasi konten sosial media</p>
        </div>
        <Link href="/admin/social">
          <Button variant="outline" size="sm" className="gap-1.5">
            <AtSign className="h-4 w-4" /> Kelola Akun Sosmed
          </Button>
        </Link>
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
                  <div key={`empty-${i}`} className="bg-card p-2 min-h-[90px]" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                  const dayData = scheduledMap[dateStr]
                  const hasItems = dayData && (dayData.drafts.length > 0 || dayData.posts.length > 0)
                  const isToday = dateStr === todayStr
                  const isSelected = dateStr === selectedDate
                  const totalItems = dayData ? dayData.drafts.length + dayData.posts.length : 0

                  return (
                    <button key={day}
                      onClick={() => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
                      className={`bg-card p-1.5 min-h-[90px] text-left transition-colors hover:bg-muted/50 border-0 cursor-pointer ${
                        isSelected ? "ring-2 ring-primary ring-inset" : ""
                      }`}
                    >
                      <span className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full mb-1 ${
                        isToday ? "bg-primary text-primary-foreground font-bold" : "text-foreground"
                      }`}>
                        {day}
                      </span>
                      {hasItems && (
                        <div className="space-y-0.5">
                          {dayData!.posts.slice(0, 2).map((p) => (
                            <div key={p.id}
                              className={`text-[9px] px-1 py-0.5 rounded truncate font-medium ${PLATFORM_COLORS[p.platform] || "bg-gray-100 text-gray-700"}`}
                            >
                              {p.platform === "twitter" ? "𝕏" : p.platform === "instagram" ? "📸" : p.platform === "facebook" ? "📘" : "🧵"} {p.status}
                            </div>
                          ))}
                          {dayData!.drafts.slice(0, 1).map((d) => (
                            <div key={d.id}
                              className="text-[9px] px-1 py-0.5 rounded truncate font-medium bg-blue-100 text-blue-700"
                            >
                              📝 draft
                            </div>
                          ))}
                          {totalItems > 3 && (
                            <div className="text-[9px] text-muted-foreground pl-1">+{totalItems - 3} lagi</div>
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
              ) : totalSelected === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Tidak ada konten di</p>
                  <p className="text-sm font-medium mt-1">{dateObj?.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {totalSelected} konten — {dateObj?.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                  </p>

                  {selectedPosts.map((p) => {
                    const stat = STATUS_ICONS[p.status] || STATUS_ICONS.pending
                    const StatIcon = stat.icon
                    return (
                      <div key={p.id} className="rounded-xl border border-border/50 p-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <AtSign className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${PLATFORM_COLORS[p.platform] || ""}`}>{p.platform}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 ${stat.color}`}>
                            <StatIcon className="h-3 w-3" /> {p.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {p.scheduled_at ? new Date(p.scheduled_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </p>
                        {p.error_message && <p className="text-[10px] text-red-500 mt-1">{p.error_message}</p>}
                        {p.post_url && (
                          <a href={p.post_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline block mt-1">
                            Buka Postingan →
                          </a>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {p.status === "pending" && (
                            <>
                              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handlePublishNow(p.id)}>Publish Now</Button>
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => handleCancelSchedule(p.id)}>Batal</Button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {selectedDrafts.map((d) => (
                    <div key={d.id} className="rounded-xl border border-border/50 p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        {d.concept_type === "carousel" ? <Layout className="h-3.5 w-3.5 text-purple-500" /> : <FileText className="h-3.5 w-3.5 text-blue-500" />}
                        <p className="text-sm font-medium truncate flex-1">{d.title}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-yellow-100 text-yellow-700">draft</span>
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">{d.content_type} · {d.concept_type}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Link href="/admin/content-generator/drafts">
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

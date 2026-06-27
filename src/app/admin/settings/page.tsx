"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [siteName, setSiteName] = useState("")

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((json) => {
        setSiteName(json.data?.site_name || "RodaTrip")
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!siteName.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site_name: siteName.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.message || "Gagal simpan")
      toast.success("Site name berhasil diperbarui!")
    } catch (err) {
      toast.error("Gagal: " + (err as Error).message)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-heading">Settings</h1>
          <p className="text-muted-foreground">Manage your site settings</p>
        </div>
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola pengaturan situs</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Situs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Situs</Label>
              <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
              <p className="text-xs text-muted-foreground">
                Nama ini muncul di navbar, footer, title halaman, dan metadata SEO
              </p>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : <><Save className="mr-2 h-4 w-4" /> Simpan</>}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cloudflare R2 Storage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Account ID</Label>
              <Input placeholder="Set in .env.local" disabled />
            </div>
            <p className="text-sm text-muted-foreground">
              Storage settings are managed via environment variables.
              Update them in your Vercel dashboard or .env.local file.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

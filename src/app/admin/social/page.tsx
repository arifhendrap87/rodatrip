"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AtSign, Camera, MessageCircle, Loader2, ExternalLink, Trash2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"

interface SocialAccount {
  id: string
  platform: string
  account_name: string | null
  account_id: string | null
  connected: boolean
  created_at: string
}

const PLATFORMS = [
  { id: "facebook", label: "Facebook Page", icon: MessageCircle, color: "text-blue-600", desc: "Posting ke Facebook Page" },
  { id: "instagram", label: "Instagram", icon: Camera, color: "text-pink-500", desc: "Posting feed Instagram (butuh FB Page terhubung)" },
  { id: "threads", label: "Threads", icon: AtSign, color: "text-gray-900", desc: "Posting ke Threads" },
]

export default function SocialAccountsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const error = searchParams.get("error")
    const connected = searchParams.get("connected")

    if (connected === "facebook") {
      toast.success("Facebook Page berhasil dihubungkan!")
      if (searchParams.get("ig") === "connected") {
        toast.success("Instagram juga terhubung!")
      }
    }
    if (connected === "threads") {
      toast.success("Threads berhasil dihubungkan!")
    }

    if (error === "no_page") toast.error("Tidak ditemukan Facebook Page. Buat Page dulu.")
    if (error === "no_code" || error === "token_exchange_failed" || error === "callback_failed" || error === "no_account") {
      toast.error("Gagal menghubungkan akun. Coba lagi.")
    }

    fetchAccounts()
  }, [searchParams])

  async function fetchAccounts() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/social/accounts")
      const json = await res.json()
      if (res.ok) setAccounts(json.data || [])
    } catch {
      toast.error("Gagal memuat akun")
    }
    setLoading(false)
  }

  function getConnection(platform: string) {
    return accounts.find((a) => a.platform === platform)
  }

  async function handleConnect(platformId: string) {
    if (platformId === "facebook") {
      window.location.href = "/api/admin/social/auth/facebook"
    } else if (platformId === "threads") {
      window.location.href = "/api/admin/social/auth/threads"
    } else if (platformId === "instagram") {
      toast.info("Instagram akan otomatis terhubung setelah Facebook Page dikoneksikan")
    }
  }

  async function handleDisconnect(platformId: string) {
    try {
      const res = await fetch(`/api/admin/social/disconnect/${platformId}`, { method: "POST" })
      if (res.ok) {
        setAccounts((prev) => prev.filter((a) => a.platform !== platformId))
        toast.success(`${platformId} berhasil diputus`)
      } else {
        toast.error("Gagal memutus koneksi")
      }
    } catch {
      toast.error("Gagal memutus koneksi")
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading">Akun Sosial Media</h1>
        <p className="text-muted-foreground">Hubungkan akun sosial media untuk auto-publish konten</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {PLATFORMS.map((platform) => {
          const Icon = platform.icon
          const connection = getConnection(platform.id)
          const isConnected = connection?.connected

          return (
            <Card key={platform.id}>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                <div className={`rounded-lg border p-2.5 ${platform.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">{platform.label}</CardTitle>
                  {connection?.account_name && (
                    <p className="text-sm text-muted-foreground">@{connection.account_name}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">{platform.desc}</p>
                </div>
                <div className="ml-auto">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : isConnected ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      <CheckCircle className="h-3 w-3 mr-1" /> Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Not Connected</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {isConnected ? (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => handleDisconnect(platform.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Putus Koneksi
                    </Button>
                    {platform.id === "facebook" && (
                      <Button
                        className="flex-1"
                        variant="secondary"
                        onClick={() => handleConnect("instagram")}
                      >
                        Hubungkan Instagram
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    disabled={loading || platform.id === "instagram"}
                    onClick={() => handleConnect(platform.id)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {platform.id === "instagram" ? "Otomatis via Facebook" : `Connect ${platform.label}`}
                  </Button>
                )}
                {platform.id === "instagram" && !isConnected && (
                  <p className="text-xs text-muted-foreground text-center">
                    Connect Facebook Page dulu, Instagram akan otomatis terhubung
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

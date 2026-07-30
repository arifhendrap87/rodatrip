"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AtSign, Camera, MessageCircle, Loader2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface SocialAccount {
  id: string
  platform: string
  account_name: string | null
  account_id: string | null
  connected: boolean
  created_at: string
}

const PLATFORMS = [
  { id: "twitter", label: "Twitter / X", icon: AtSign, color: "text-sky-500" },
  { id: "instagram", label: "Instagram", icon: Camera, color: "text-pink-500" },
  { id: "facebook", label: "Facebook", icon: MessageCircle, color: "text-blue-600" },
  { id: "threads", label: "Threads", icon: MessageCircle, color: "text-gray-900" },
]

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAccounts()
  }, [])

  async function fetchAccounts() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/social/accounts")
      const json = await res.json()
      if (res.ok) {
        setAccounts(json.data || [])
      } else {
        throw new Error(json.error?.message || "Gagal memuat akun")
      }
    } catch (err) {
      toast.error("Gagal memuat akun sosial media")
    }
    setLoading(false)
  }

  function getConnection(platform: string) {
    return accounts.find((a) => a.platform === platform)
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
                </div>
                <div className="ml-auto">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : isConnected ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Connected</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Not Connected</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant={isConnected ? "outline" : "default"}
                  disabled={loading}
                  onClick={() => {
                    toast.info(`OAuth ${platform.label} akan diintegrasikan nanti`)
                  }}
                >
                  {isConnected ? (
                    <>Kelola Akun</>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Connect {platform.label}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

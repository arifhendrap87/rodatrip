"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading">Settings</h1>
        <p className="text-muted-foreground">Manage your site settings</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input defaultValue="Gaskuy" />
            </div>
            <div className="space-y-2">
              <Label>Site URL (metadataBase)</Label>
              <Input defaultValue={process.env.NEXT_PUBLIC_APP_URL || "https://gaskuy-roadtrip.vercel.app"} />
            </div>
            <Button disabled={saving}>Save Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cloudflare R2 Storage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Account ID</Label>
              <Input placeholder="Set in .env.local" />
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

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Download } from "lucide-react"

export default function WaitlistPage() {
  const [emails, setEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setEmails(data || [])
        setLoading(false)
      })
  }, [])

  function exportCSV() {
    const csv = "Email,Source,Date\n" +
      emails.map((e) => `${e.email},${e.source},${new Date(e.created_at).toLocaleDateString("id-ID")}`).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "waitlist-export.csv"
    a.click()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Waitlist</h1>
          <p className="text-muted-foreground">{emails.length} email subscribers</p>
        </div>
        <Button variant="outline" onClick={exportCSV} disabled={!emails.length}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      ) : emails.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Mail className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">No emails yet</p>
            <p className="text-sm text-muted-foreground">Connect the waitlist form to Supabase to start collecting emails</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {emails.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{entry.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Via {entry.source || "website"} — {new Date(entry.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

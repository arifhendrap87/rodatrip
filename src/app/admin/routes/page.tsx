"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Construction } from "lucide-react"

export default function RoutesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading">Routes</h1>
        <p className="text-muted-foreground">Route guide management (coming soon)</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <Construction className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">Coming Soon</p>
          <p className="text-sm text-muted-foreground">Route management interface is under development</p>
        </CardContent>
      </Card>
    </div>
  )
}

import { api } from "@/lib/api/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, ShoppingBag, Mail, Eye } from "lucide-react"

async function getStats() {
  try {
    const res = await api.admin.stats()
    return res.data
  } catch {
    return { spots: 0, products: 0, waitlist: 0, views: 0 }
  }
}

const statsCards = [
  { label: "Total Spots", key: "spots" as const, icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Total Products", key: "products" as const, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Waitlist", key: "waitlist" as const, icon: Mail, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Page Views", key: "views" as const, icon: Eye, color: "text-orange-600", bg: "bg-orange-50" },
]

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.key}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats[card.key].toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/admin/spots/new"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                +
              </div>
              <div>
                <p className="font-medium">Add New Spot</p>
                <p className="text-sm text-muted-foreground">
                  Create a new destination guide
                </p>
              </div>
            </a>

            <a
              href="/admin/products/new"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                +
              </div>
              <div>
                <p className="font-medium">Add New Product</p>
                <p className="text-sm text-muted-foreground">
                  Add a product to the e-commerce store
                </p>
              </div>
            </a>

            <a
              href="/spot-istimewa"
              target="_blank"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                →
              </div>
              <div>
                <p className="font-medium">View Public Site</p>
                <p className="text-sm text-muted-foreground">
                  Open the frontend in a new tab
                </p>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Spots</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Spot list will appear here after Supabase connection.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

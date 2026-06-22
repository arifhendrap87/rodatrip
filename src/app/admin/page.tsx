import { api } from "@/lib/api/client"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, ShoppingBag, Mail, Eye, ArrowRight } from "lucide-react"

async function getStats() {
  try {
    const res = await api.admin.stats()
    return res.data
  } catch {
    return { spots: 0, products: 0, waitlist: 0, views: 0 }
  }
}

async function getRecentSpots() {
  try {
    const res = await api.spots.list({ limit: "6", offset: "0" })
    return (res.data || []) as { id: string; slug: string; name: string; category: string; province: string; rating: number; created_at: string; image_url: string }[]
  } catch {
    return []
  }
}

const statsCards = [
  { label: "Total Spots", key: "spots" as const, icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Total Products", key: "products" as const, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Waitlist", key: "waitlist" as const, icon: Mail, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Page Views", key: "views" as const, icon: Eye, color: "text-orange-600", bg: "bg-orange-50" },
]

export default async function AdminDashboard() {
  const [stats, recentSpots] = await Promise.all([getStats(), getRecentSpots()])

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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">+</div>
              <div>
                <p className="font-medium">Add New Spot</p>
                <p className="text-sm text-muted-foreground">Create a new destination guide</p>
              </div>
            </a>

            <a
              href="/admin/products/new"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">+</div>
              <div>
                <p className="font-medium">Add New Product</p>
                <p className="text-sm text-muted-foreground">Add a product to the e-commerce store</p>
              </div>
            </a>

            <a
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">→</div>
              <div>
                <p className="font-medium">View Public Site</p>
                <p className="text-sm text-muted-foreground">Open the frontend in a new tab</p>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Spots</CardTitle>
            <Link href="/admin/spots" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentSpots.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Belum ada spot. Buat spot baru untuk memulai.</p>
            ) : (
              <div className="space-y-3">
                {recentSpots.map((spot) => (
                  <Link key={spot.id} href={`/admin/spots/${spot.slug}/edit`}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-lg overflow-hidden">
                      {spot.image_url ? (
                        <img src={spot.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{spot.name}</p>
                      <p className="text-xs text-muted-foreground">{spot.province} · {spot.category} {spot.rating ? `· ⭐ ${spot.rating}` : ''}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

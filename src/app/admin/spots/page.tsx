"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, ExternalLink } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CATEGORIES = [
  { value: "alam", label: "Alam", color: "emerald" },
  { value: "kuliner", label: "Kuliner", color: "orange" },
  { value: "budaya", label: "Budaya", color: "purple" },
  { value: "foto", label: "Spot Foto", color: "pink" },
  { value: "petualangan", label: "Petualangan", color: "blue" },
  { value: "sejarah", label: "Sejarah", color: "amber" },
]

export default function SpotsPage() {
  const [spots, setSpots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [provinceFilter, setProvinceFilter] = useState("all")

  useEffect(() => {
    fetchSpots()
  }, [])

  async function fetchSpots() {
    setLoading(true)
    let query = supabase
      .from("spots")
      .select("*")
      .order("created_at", { ascending: false })

    if (search) {
      query = query.ilike("name", `%${search}%`)
    }
    if (categoryFilter !== "all") {
      query = query.eq("category", categoryFilter)
    }
    if (provinceFilter !== "all") {
      query = query.eq("province", provinceFilter)
    }

    const { data } = await query
    setSpots(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchSpots()
  }, [search, categoryFilter, provinceFilter])

  async function handleDelete(slug: string, name: string) {
    if (!confirm(`Hapus "${name}"?`)) return
    await supabase.from("spots").delete().eq("slug", slug)
    fetchSpots()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Spots</h1>
          <p className="text-muted-foreground">
            Manage destination guides ({spots.length} total)
          </p>
        </div>
        <Link href="/admin/spots/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Spot
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search spots..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={provinceFilter} onValueChange={(v) => v && setProvinceFilter(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Provinces</SelectItem>
                <SelectItem value="Jawa Barat">Jawa Barat</SelectItem>
                <SelectItem value="Jawa Tengah">Jawa Tengah</SelectItem>
                <SelectItem value="Jawa Timur">Jawa Timur</SelectItem>
                <SelectItem value="Bali">Bali</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          Loading spots...
        </div>
      ) : spots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-lg font-medium">No spots found</p>
            <p className="text-sm text-muted-foreground">
              {search || categoryFilter !== "all"
                ? "Try adjusting your filters"
                : "Add your first spot to get started"}
            </p>
            <Link href="/admin/spots/new">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Spot
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {spots.map((spot) => {
                const cat = CATEGORIES.find((c) => c.value === spot.category)
                return (
                  <div
                    key={spot.id}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{spot.name}</h3>
                        {spot.is_featured && (
                          <Badge variant="secondary" className="shrink-0">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {cat && (
                          <Badge variant="outline" className="text-xs">
                            {cat.label}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {spot.province}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ⭐ {spot.rating}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          👁 {spot.view_count || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/spot-istimewa/${spot.slug}`}
                        target="_blank"
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/spots/${spot.slug}/edit`}
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(spot.slug, spot.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

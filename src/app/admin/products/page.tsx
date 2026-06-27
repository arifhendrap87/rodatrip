"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { api } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2, ExternalLink, Search, FileSpreadsheet, FileJson, Package, Globe, Sparkles } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDebounce } from "@/hooks/useDebounce"

const CATEGORIES = [
  "Safety & Darurat", "Comfort", "Gadget & Mount",
  "Organizer", "Lifestyle & Merch", "Maintenance", "Bundle Hemat",
]

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchProducts()
  }, [debouncedSearch, categoryFilter])

  async function fetchProducts() {
    setLoading(true)
    const params: Record<string, string> = {}
    if (debouncedSearch) params.search = debouncedSearch
    if (categoryFilter !== "all") params.category = categoryFilter

    const res = await api.products.list(params)
    setProducts(res.data as any[])
    setSelected(new Set())
    setLoading(false)
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === products.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(products.map((p) => p.id)))
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus "${name}"?`)) return
    await api.products.delete(id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next })
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return
    if (!confirm(`Hapus ${selected.size} produk terpilih?`)) return
    for (const id of selected) { await api.products.delete(id) }
    setSelected(new Set())
    fetchProducts()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Products</h1>
          <p className="text-muted-foreground">Manage e-commerce products ({products.length} total)</p>
        </div>
        <div className="flex items-center gap-2">
          {products.filter(p => p.source === "Jakmall" && (!p.description || p.description.length < 100)).length > 0 && (
            <Button variant="outline" size="sm" onClick={() => {
              const urls = products
                .filter(p => p.source === "Jakmall" && (!p.description || p.description.length < 100))
                .map(p => p.name + ': ' + p.jakmall_url)
                .join('\n')
              alert('Produk yang perlu di-enrich:\n\n' + urls + '\n\nBeritahu AI untuk enrich produk ini.')
            }}>
              <Sparkles className="mr-2 h-4 w-4" />
              Enrich All ({products.filter(p => p.source === "Jakmall" && (!p.description || p.description.length < 100)).length})
            </Button>
          )}
          <Link href="/admin/products/import">
            <Button variant="outline">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Import XLSX
            </Button>
          </Link>
          <Link href="/admin/products/import-json">
            <Button variant="outline">
              <FileJson className="mr-2 h-4 w-4" />
              Import JSON
            </Button>
          </Link>
          <Link href="/admin/products/new">
            <Button><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <input type="checkbox" checked={products.length > 0 && selected.size === products.length}
              onChange={toggleSelectAll} className="shrink-0 rounded border-border/60 accent-primary" />
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading products...</div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-lg font-medium">No products yet</p>
            <p className="text-sm text-muted-foreground">Add your first product to get started</p>
            <Link href="/admin/products/new">
              <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          {selected.size > 0 && (
            <div className="flex items-center justify-between border-b border-border/30 bg-muted/30 px-4 py-2.5">
              <p className="text-sm text-muted-foreground">{selected.size} produk terpilih</p>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus ({selected.size})
              </Button>
            </div>
          )}
          <CardContent className="p-0">
            <div className="divide-y">
              {products.map((product) => {
                const isSelected = selected.has(product.id)
                return (
                <div key={product.id} className={`flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                  <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(product.id)}
                    className="shrink-0 rounded border-border/60 accent-primary" />
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <Package className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{product.name}</h3>
                        {product.source === "Jakmall" && (
                          <span className="shrink-0 rounded bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 font-medium">Jakmall</span>
                        )}
                        {product.source === "Jakmall" && product.description && product.description.length > 100 && (
                          <span className="shrink-0 rounded bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 font-medium">Enriched</span>
                        )}
                      </div>
                    <p className="text-sm text-muted-foreground">
                      {product.category} — Rp {product.price.toLocaleString()}
                      {product.external_id && <span className="text-xs text-muted-foreground/60 ml-2">SKU: {product.external_id}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {product.jakmall_url && (
                      <a href={product.jakmall_url} target="_blank" rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-emerald-100 text-emerald-600" title="Lihat di Jakmall">
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                    {product.source === "Jakmall" && (!product.description || product.description.length < 100) && (
                      <button
                        onClick={() => window.open(product.jakmall_url || '', '_blank')}
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-amber-100 text-amber-600" title="Enrich from Jakmall (buka manual, nanti saya scrap)">
                        <Sparkles className="h-4 w-4" />
                      </button>
                    )}
                    <Link href={`/products`} target="_blank" className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <Link href={`/admin/products/${product.id}/edit`} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <Button variant="ghost" size="icon" className="text-destructive h-8 w-8"
                      onClick={() => handleDelete(product.id, product.name)}>
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

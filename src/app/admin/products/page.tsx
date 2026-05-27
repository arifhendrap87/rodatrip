"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react"

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts(data || [])
        setLoading(false)
      })
  }, [])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus "${name}"?`)) return
    await supabase.from("products").delete().eq("id", id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Products</h1>
          <p className="text-muted-foreground">Manage e-commerce products ({products.length} total)</p>
        </div>
        <Link href="/admin/products/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
        </Link>
      </div>

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
          <CardContent className="p-0">
            <div className="divide-y">
              {products.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                  <div className="flex-1">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.category} — Rp {product.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/products`} target="_blank" className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <Link href={`/admin/products/${product.id}/edit`} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <Button variant="ghost" size="icon" className="text-destructive"
                      onClick={() => handleDelete(product.id, product.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

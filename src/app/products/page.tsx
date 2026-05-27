"use client"

import { useState } from "react"
import { api } from "@/lib/api/client"
import { PRODUCT_CATEGORIES } from "@/lib/constants"
import { ProductCard } from "@/components/product/ProductCard"
import { CartSheet } from "@/components/product/CartSheet"
import type { Product } from "@/types"

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("Semua")
  const [cart, setCart] = useState<Product[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useState(() => {
    api.products.list()
      .then((res: any) => setProducts(res?.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  })

  const filteredProducts =
    activeCategory === "Semua"
      ? products
      : products.filter((p) => p.category === activeCategory)

  const addToCart = (product: Product) => {
    setCart((prev) => [...prev, product])
    setCartOpen(true)
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const index = prev.findIndex((p) => p.id === productId)
      if (index === -1) return prev
      return [...prev.slice(0, index), ...prev.slice(index + 1)]
    })
  }

  const cartTotal = cart.reduce((sum, p) => sum + p.price, 0)

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-heading">Produk Roadtrip</h1>
            <p className="mt-1 text-muted-foreground">Perlengkapan roadtrip yang pas buat perjalanan kamu.</p>
          </div>
          <button onClick={() => setCartOpen(true)}
            className="relative rounded-xl border border-border/50 bg-white px-4 py-2.5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span className="text-sm font-medium">Keranjang</span>
            </div>
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{cart.length}</span>
            )}
          </button>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <button onClick={() => setActiveCategory("Semua")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${activeCategory === "Semua" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>Semua</button>
          {PRODUCT_CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>{cat}</button>
          ))}
        </div>

        {loading ? (
          <div className="mt-12 text-center text-muted-foreground py-16">Memuat produk...</div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={() => addToCart(product)} />
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <span className="text-4xl opacity-30 mb-4">📦</span>
            <p className="text-sm font-medium text-muted-foreground">Tidak ada produk di kategori ini</p>
            <p className="text-xs text-muted-foreground mt-1">Coba pilih kategori lain.</p>
          </div>
        )}
      </div>

      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} items={cart} total={cartTotal} onRemove={removeFromCart} />
    </div>
  )
}

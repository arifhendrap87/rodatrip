"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { Product } from "@/types"

interface ProductCardProps {
  product: Product
  onAddToCart: () => void
}

const productImages = [
  "/images/feature-poi.jpg",
  "/images/feature-info.jpg",
  "/images/feature-biaya.jpg",
  "/images/feature-produk.jpg",
]

function getProductImage(id: string): string {
  const index = id.split("-").pop()?.length || 0
  return productImages[index % productImages.length]
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <div className="group rounded-2xl border border-border/40 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <button
          onClick={() => setDialogOpen(true)}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary/10 to-secondary/10"
        >
          <Image
            src={getProductImage(product.id)}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
          <Badge className="absolute top-3 left-3 bg-white/90 text-foreground border-border/50 text-xs font-medium shadow-sm">
            {product.category}
          </Badge>
        </button>

        <div className="p-4">
          <button
            onClick={() => setDialogOpen(true)}
            className="text-left"
          >
            <h3 className="font-semibold font-heading line-clamp-1 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </button>

          <div className="mt-1 flex items-center gap-1">
            <span className="text-yellow-500 text-xs">★</span>
            <span className="text-xs text-muted-foreground">{product.rating.toFixed(1)}</span>
          </div>

          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
            {product.description}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold font-heading">
              Rp {product.price.toLocaleString()}
            </span>
            <Button
              size="sm"
              onClick={onAddToCart}
              className="rounded-xl text-xs"
            >
              + Keranjang
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">{product.name}</DialogTitle>
            <DialogDescription className="sr-only">Detail produk {product.name}</DialogDescription>
          </DialogHeader>

          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10">
            <Image
              src={getProductImage(product.id)}
              alt={product.name}
              fill
              className="object-cover"
            />
            <div className="absolute top-3 left-3">
              <Badge variant="outline" className="bg-white/90 text-xs">{product.category}</Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500 text-sm">★</span>
              <span className="text-sm text-muted-foreground">{product.rating.toFixed(1)}</span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="flex items-center justify-between border-t border-border/50 pt-4">
              <div>
                <span className="text-sm text-muted-foreground">Harga</span>
                <p className="text-2xl font-bold font-heading">Rp {product.price.toLocaleString()}</p>
              </div>
              <Button
                onClick={() => {
                  onAddToCart()
                  setDialogOpen(false)
                }}
                className="rounded-xl"
              >
                + Tambah ke Keranjang
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

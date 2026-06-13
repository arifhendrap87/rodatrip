"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import type { Product } from "@/types"

interface CartSheetProps {
  open: boolean
  onClose: () => void
  items: Product[]
  total: number
  onRemove: (productId: string) => void
}

export function CartSheet({ open, onClose, items, total, onRemove }: CartSheetProps) {
  const [ordering, setOrdering] = useState(false)

  async function handleOrder() {
    setOrdering(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ id, name, price }) => ({ id, name, price })),
          total,
        }),
      })
      const json = await res.json()
      if (json.data?.waUrl) {
        window.open(json.data.waUrl, "_blank")
      }
    } catch {
      // Fallback: direct WA link
      const waMessage = items
        .map((item, i) => `${i + 1}. ${item.name} - Rp ${item.price.toLocaleString()}`)
        .join("\n")
      window.open(
        `https://wa.me/6281234567890?text=${encodeURIComponent(`Halo, saya ingin order:\n\n${waMessage}\n\nTotal: Rp ${total.toLocaleString()}\n\nNama:\nAlamat:`)}`,
        "_blank"
      )
    }
    setOrdering(false)
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col rounded-l-2xl">
        <SheetHeader>
          <SheetTitle className="font-heading">Keranjang</SheetTitle>
          <SheetDescription className="sr-only">Daftar produk di keranjang</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/50 mb-4"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <p className="text-sm text-muted-foreground">Keranjang masih kosong</p>
              <p className="text-xs text-muted-foreground mt-1">Tambahkan produk dari halaman produk.</p>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              {items.map((item, index) => (
                <div key={`${item.id}-${index}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 text-lg shadow-sm">
                      🎒
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Rp {item.price.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                  {index < items.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="border-t border-border/50 pt-4 -mx-6 px-6">
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium font-heading">Total</span>
                <span className="text-lg font-bold font-heading">Rp {total.toLocaleString()}</span>
              </div>

              <Button
                className="w-full rounded-xl gap-2" size="lg"
                onClick={handleOrder}
                disabled={ordering}
              >
                {ordering ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                )}
                Order via WhatsApp
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Kamu akan diarahkan ke WhatsApp. Kami akan konfirmasi pesananmu.
              </p>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}

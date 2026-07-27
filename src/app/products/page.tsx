import { db } from "@/lib/services/db"
import ProductsPageClient from "./ProductsPageClient"

export default async function ProductsPage() {
  const { data } = await db
    .from("products")
    .select("id, name, slug, price, image_url, category, description, stock_quantity, created_at")
    .order("created_at", { ascending: false })

  const products = ((data || []) as any[]).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    image_url: p.image_url || "",
    category: p.category,
    description: p.description || "",
    stock_quantity: p.stock_quantity,
    created_at: p.created_at,
    rating: p.rating || 0,
  }))

  return <ProductsPageClient initialProducts={products as any} />
}

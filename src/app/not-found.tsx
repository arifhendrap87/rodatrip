import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/icons"

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <Logo className="h-16 w-16 text-primary/30 mb-6" />
      <h1 className="text-6xl font-bold font-heading text-primary">404</h1>
      <p className="mt-4 text-xl font-medium font-heading">Halaman tidak ditemukan</p>
      <p className="mt-2 text-muted-foreground max-w-md">
        Halaman yang kamu cari mungkin sudah dipindah atau tidak tersedia.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/">
          <Button variant="outline" className="rounded-xl">Kembali ke Beranda</Button>
        </Link>
        <Link href="/roadtrip">
          <Button className="rounded-xl">Jelajahi Roadtrip</Button>
        </Link>
      </div>
    </div>
  )
}

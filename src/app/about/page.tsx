import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.08] via-accent/[0.03] to-background py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            Tentang Kami
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold font-heading leading-tight">
            Gas — Plan · Prepare ·{" "}
            <span className="bg-gradient-to-r from-primary via-[hsl(340_85%_55%)] to-accent bg-clip-text text-transparent">
              Go
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Platform pertama di Indonesia yang mengintegrasikan POI, info jalan, dan perlengkapan roadtrip dalam satu tempat.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold font-heading">Kenapa RodaTrip?</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed text-lg">
                Roadtrip di Indonesia punya tantangan tersendiri. Mulai dari infrastruktur jalan yang
                belum merata, minimnya informasi SPBU dan bengkel di jalur alternatif, sampai
                kesulitan mencari perlengkapan roadtrip yang terpercaya.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                RodaTrip hadir untuk menjawab tantangan itu. Kami mengkurasi spot-spot terbaik,
                menyediakan informasi POI yang akurat, dan merekomendasikan perlengkapan roadtrip
                berkualitas — semua dalam satu platform.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "📍", value: "60+", label: "Spot Istimewa" },
                { icon: "🗺️", value: "20+", label: "Rute Tersedia" },
                { icon: "🏪", value: "12+", label: "Produk Roadtrip" },
                { icon: "⛽", value: "20+", label: "POI Sepanjang Jalan" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-border/50 bg-white p-6 text-center">
                  <span className="text-3xl">{stat.icon}</span>
                  <p className="mt-2 text-3xl font-bold font-heading text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-gradient-to-b from-primary/[0.03] to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold font-heading text-center">Fitur Unggulan</h2>
          <p className="mt-2 text-center text-muted-foreground">Semua yang kamu butuhkan untuk roadtrip yang epik.</p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "🗺️", title: "Peta Interaktif", desc: "Jelajahi rute dengan POI lengkap di sepanjang jalan. Dari SPBU hingga kuliner legendaris." },
              { icon: "📍", title: "Spot Istimewa", desc: "Kumpulan tempat epik yang sudah dikurasi khusus buat roadtripper Indonesia." },
              { icon: "💰", title: "Estimasi Biaya", desc: "Hitung estimasi BBM, tol, dan makan sebelum berangkat. Bikin budgeting lebih mudah." },
              { icon: "🛒", title: "Toko Perlengkapan", desc: "Lengkapi mobilmu dengan perlengkapan roadtrip berkualitas. Dari safety gear sampai aksesoris." },
              { icon: "⛽", title: "Info POI Real-time", desc: "Lokasi SPBU, bengkel, dan info jalan terkini di sepanjang rute perjalanan." },
              { icon: "📝", title: "Tips & Blog", desc: "Artikel dan panduan roadtrip yang membantu kamu merencanakan perjalanan dengan lebih baik." },
            ].map((fitur) => (
              <div key={fitur.title} className="rounded-2xl border border-border/50 bg-white p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <span className="text-3xl">{fitur.icon}</span>
                <h3 className="mt-4 text-lg font-bold font-heading">{fitur.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{fitur.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold font-heading">Siap Mulai Petualangan?</h2>
          <p className="mt-2 text-muted-foreground">Gas — Plan · Prepare · Go!</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/spot-istimewa">
              <Button size="lg" className="rounded-xl bg-gradient-to-r from-primary via-[hsl(340_85%_55%)] to-accent text-primary-foreground shadow-lg shadow-primary/30">
                Jelajahi Spot
              </Button>
            </Link>
            <Link href="/map">
              <Button size="lg" variant="outline" className="rounded-xl">
                Cari Rute
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

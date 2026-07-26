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
            RodaTrip — Panduan Roadtrip &amp; POI untuk{" "}
            <span className="bg-gradient-to-r from-primary via-[hsl(340_85%_55%)] to-accent bg-clip-text text-transparent">
              Roadtripper Indonesia
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Platform POI, informasi jalan, dan inspirasi roadtrip untuk menjelajahi Indonesia dengan
            percaya diri.
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
                belum merata, minimnya informasi POI di jalur alternatif, sampai kesulitan
                merencanakan itinerary yang efisien.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                RodaTrip hadir untuk menjawab tantangan itu. Kami mengkurasi spot-spot terbaik
                di setiap provinsi, menyediakan itinerary roadtrip siap pakai dengan estimasi biaya,
                dan membantu roadtripper menemukan tempat-tempat menarik di sepanjang jalan.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "📍", value: "47", label: "Spot Istimewa" },
                { icon: "🗺️", value: "7", label: "Rute Roadtrip" },
                { icon: "🏪", value: "12", label: "Produk Perlengkapan" },
                { icon: "📸", value: "200+", label: "POI Sepanjang Jalan" },
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
              { icon: "🗺️", title: "Itinerary Roadtrip", desc: "Rute siap pakai dengan timeline detail, estimasi biaya BBM, tol, dan akomodasi. Tinggal pilih dan jalan." },
              { icon: "📍", title: "Spot Istimewa", desc: "47 destinasi kurasi dari alam, kuliner, petualangan, hingga foto. Lengkap dengan info harga, jam buka, dan tips." },
              { icon: "💰", title: "Estimasi Biaya", desc: "Hitung estimasi BBM, tol, tiket masuk, dan akomodasi sebelum berangkat. Bikin budgeting perjalanan lebih mudah." },
              { icon: "🤖", title: "Generator Konten AI", desc: "Buat konten sosial media untuk spot dan roadtrip secara otomatis. Caption, hashtag, dan carousel siap pakai." },
              { icon: "📍", title: "Info POI & Nearby", desc: "Informasi tempat terdekat seperti SPBU, restoran, dan penginapan di sekitar lokasi." },
              { icon: "🛒", title: "Produk Roadtrip", desc: "Rekomendasi perlengkapan roadtrip berkualitas. Dari safety gear hingga aksesoris mobil." },
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
          <p className="mt-2 text-muted-foreground">Jelajahi spot, rencanakan roadtrip, dan temukan perlengkapan perjalanan.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/spot-istimewa">
              <Button size="lg" className="rounded-xl bg-gradient-to-r from-primary via-[hsl(340_85%_55%)] to-accent text-primary-foreground shadow-lg shadow-primary/30">
                Jelajahi Spot
              </Button>
            </Link>
            <Link href="/roadtrip">
              <Button size="lg" variant="outline" className="rounded-xl">
                Lihat Roadtrip
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

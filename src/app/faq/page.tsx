"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    q: "Apa itu RodaTrip?",
    a: "RodaTrip adalah platform POI (Point of Interest), info jalan, dan perlengkapan roadtrip untuk roadtripper Indonesia. Kami membantu kamu merencanakan perjalanan dengan spot-spot istimewa, rute lengkap dengan POI, dan perlengkapan roadtrip berkualitas.",
  },
  {
    q: "Apakah RodaTrip gratis?",
    a: "Ya! RodaTrip gratis selamanya untuk semua fitur dasar. Kamu bisa menjelajahi spot, merencanakan rute, dan melihat estimasi biaya tanpa biaya sepeser pun.",
  },
  {
    q: "Bagaimana cara mendaftar?",
    a: "Kamu bisa mendaftar melalui form waitlist di halaman utama. Kami akan mengirimkan notifikasi via email begitu platform siap digunakan.",
  },
  {
    q: "Apa saja kategori spot di RodaTrip?",
    a: "Spot di RodaTrip dikategorikan menjadi: SPBU, Kuliner, Bengkel, Spot Foto, dan Info Jalan. Masing-masing kategori membantu kamu menemukan tempat yang kamu butuhkan di sepanjang rute.",
  },
  {
    q: "Bagaimana cara merencanakan rute?",
    a: "Kunjungi halaman Peta, masukkan kota asal dan tujuan, lalu pilih kendaraan kamu. RodaTrip akan menampilkan rute lengkap dengan POI di sepanjang jalan dan estimasi biaya perjalanan.",
  },
  {
    q: "Apakah estimasi biaya akurat?",
    a: "Estimasi biaya dihitung berdasarkan jarak tempuh, konsumsi BBM kendaraan, dan harga BBM terkini. Namun, biaya aktual bisa berbeda tergantung kondisi jalan, lalu lintas, dan harga di lapangan.",
  },
  {
    q: "Bisakah saya beli perlengkapan roadtrip?",
    a: "Ya! Di halaman Produk, kamu bisa membeli berbagai perlengkapan roadtrip seperti tire inflator, P3K kit, cooler bag, dan masih banyak lagi. Kami kurasi produk berkualitas untuk perjalanan kamu.",
  },
  {
    q: "Apakah ada aplikasi mobile?",
    a: "Saat ini RodaTrip tersedia dalam versi website. Rencana pengembangan aplikasi mobile masih dalam tahap perencanaan. Pantau terus info terbaru melalui blog dan media sosial kami.",
  },
  {
    q: "Bagaimana cara berkontribusi?",
    a: "Kamu bisa berkontribusi dengan merekomendasikan spot menarik yang belum terdaftar, memberikan feedback, atau menjadi bagian dari kolaborasi konten. Hubungi kami melalui halaman Kontak.",
  },
  {
    q: "Apakah data saya aman?",
    a: "Kami menjaga privasi data kamu dengan serius. Data email dan informasi lainnya hanya digunakan untuk keperluan layanan dan tidak akan dibagikan ke pihak ketiga tanpa izin kamu.",
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.08] via-accent/[0.03] to-background py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            FAQ
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold font-heading leading-tight">
            Pertanyaan{" "}
            <span className="bg-gradient-to-r from-primary via-[hsl(340_85%_55%)] to-accent bg-clip-text text-transparent">
              Umum
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Temukan jawaban untuk pertanyaan yang sering diajukan tentang RodaTrip.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/50 bg-white overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-muted/30"
                >
                  <span className="font-medium font-heading pr-4">{faq.q}</span>
                  <svg
                    className={cn(
                      "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
                      openIndex === i && "rotate-180"
                    )}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300",
                    openIndex === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.get("email"),
        source: "contact",
      }),
    })

    if (res.ok) setSubmitted(true)
  }

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.08] via-accent/[0.03] to-background py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            Kontak
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold font-heading leading-tight">
            Hubungi{" "}
            <span className="bg-gradient-to-r from-primary via-[hsl(340_85%_55%)] to-accent bg-clip-text text-transparent">
              Kami
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Punya pertanyaan, saran, atau mau kerja sama? Yuk, kirim pesan!
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold font-heading">Kirim Pesan</h2>
              <p className="mt-2 text-muted-foreground">
                Isi form di bawah dan tim kami akan merespon secepatnya.
              </p>

              {submitted ? (
                <div className="mt-8 rounded-2xl bg-green-50 border border-green-100 p-6">
                  <p className="font-semibold text-green-800">Pesan terkirim! 🎉</p>
                  <p className="mt-1 text-sm text-green-600">Terima kasih, kami akan menghubungi kamu segera.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1.5">Nama</label>
                    <Input id="name" name="name" placeholder="Nama lengkap" required className="rounded-xl" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email</label>
                    <Input id="email" name="email" type="email" placeholder="email@example.com" required className="rounded-xl" />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1.5">Pesan</label>
                    <Textarea id="message" name="message" placeholder="Tulis pesan kamu..." rows={5} required className="rounded-xl" />
                  </div>
                  <Button type="submit" size="lg" className="rounded-xl bg-gradient-to-r from-primary via-[hsl(340_85%_55%)] to-accent text-primary-foreground shadow-lg shadow-primary/30">
                    Kirim Pesan
                  </Button>
                </form>
              )}
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold font-heading">Informasi Kontak</h2>
                <p className="mt-2 text-muted-foreground">
                  Atau hubungi kami melalui saluran berikut.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { icon: "📧", title: "Email", value: "hello@gaskuy.id" },
                  { icon: "📱", title: "Instagram", value: "@gaskuy.id" },
                  { icon: "🎵", title: "TikTok", value: "@gaskuy.id" },
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-xl">
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.title}</p>
                      <p className="font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-primary/[0.05] to-accent/[0.05] border border-border/50 p-6">
                <h3 className="font-bold font-heading flex items-center gap-2">
                  <span>💡</span>
                  <span>Mau Kerja Sama?</span>
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Kami terbuka untuk kolaborasi, sponsorship, atau media partnership.
                  Kirim detail proposal kamu ke email di atas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

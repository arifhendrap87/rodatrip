import { SITE_NAME } from "@/lib/constants"

export default function TermsPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.08] via-accent/[0.03] to-background py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            Legal
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold font-heading leading-tight">
            Syarat &{" "}
            <span className="bg-gradient-to-r from-primary via-[hsl(340_85%_55%)] to-accent bg-clip-text text-transparent">
              Ketentuan
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Syarat dan ketentuan penggunaan platform {SITE_NAME}.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Terakhir diperbarui: 1 Mei 2026</p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 prose prose-gray">
          <h2 className="text-xl font-bold font-heading mt-8">1. Penerimaan Syarat</h2>
          <p className="text-muted-foreground leading-relaxed">
            Dengan mengakses dan menggunakan platform {SITE_NAME}, kamu menyetujui syarat dan ketentuan ini. Jika kamu tidak setuju, mohon untuk tidak menggunakan platform kami.
          </p>

          <h2 className="text-xl font-bold font-heading mt-8">2. Penggunaan Layanan</h2>
          <p className="text-muted-foreground leading-relaxed">
            Kamu setuju untuk menggunakan platform {SITE_NAME} hanya untuk tujuan yang sah dan sesuai dengan semua hukum yang berlaku. Kamu tidak diperbolehkan:
          </p>
          <ul className="text-muted-foreground space-y-1">
            <li>Menyalahgunakan atau mengganggu layanan</li>
            <li>Mencoba mengakses area terlarang tanpa izin</li>
            <li>Menggunakan platform untuk aktivitas ilegal</li>
            <li>Memuat konten yang melanggar hak pihak lain</li>
          </ul>

          <h2 className="text-xl font-bold font-heading mt-8">3. Akun Pengguna</h2>
          <p className="text-muted-foreground leading-relaxed">
            Kamu bertanggung jawab untuk menjaga kerahasiaan informasi akun dan semua aktivitas yang terjadi di bawah akun kamu. Kami tidak bertanggung jawab atas kerugian yang timbul dari penggunaan akun yang tidak sah.
          </p>

          <h2 className="text-xl font-bold font-heading mt-8">4. Informasi dan Konten</h2>
          <p className="text-muted-foreground leading-relaxed">
            Informasi spot, rute, dan POI yang ditampilkan di platform kami bersifat informatif dan dapat berubah sewaktu-waktu. Kami berusaha memberikan informasi yang akurat, namun tidak menjamin keakuratan 100%. Penggunaan informasi sepenuhnya risiko pengguna.
          </p>

          <h2 className="text-xl font-bold font-heading mt-8">5. Hak Kekayaan Intelektual</h2>
          <p className="text-muted-foreground leading-relaxed">
            Semua konten, logo, dan materi di platform {SITE_NAME} dilindungi hak cipta dan kekayaan intelektual. Dilarang mereproduksi, mendistribusikan, atau memodifikasi konten tanpa izin tertulis.
          </p>

          <h2 className="text-xl font-bold font-heading mt-8">6. Batasan Tanggung Jawab</h2>
          <p className="text-muted-foreground leading-relaxed">
            {SITE_NAME} tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan platform kami.
          </p>

          <h2 className="text-xl font-bold font-heading mt-8">7. Perubahan Syarat</h2>
          <p className="text-muted-foreground leading-relaxed">
            Kami berhak mengubah syarat dan ketentuan ini kapan saja. Perubahan akan diumumkan melalui platform. Penggunaan lanjutan setelah perubahan berarti kamu menyetujui syarat yang diperbarui.
          </p>

          <h2 className="text-xl font-bold font-heading mt-8">8. Hukum yang Berlaku</h2>
          <p className="text-muted-foreground leading-relaxed">
            Syarat dan ketentuan ini diatur oleh hukum Republik Indonesia. Setiap sengketa akan diselesaikan melalui musyawarah atau jalur hukum yang berlaku.
          </p>

          <h2 className="text-xl font-bold font-heading mt-8">9. Kontak</h2>
          <p className="text-muted-foreground leading-relaxed">
            Untuk pertanyaan tentang syarat dan ketentuan ini, hubungi kami di hello@rodatrip.id.
          </p>
        </div>
      </section>
    </>
  )
}

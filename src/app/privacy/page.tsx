import { SITE_NAME } from "@/lib/constants"

export default function PrivacyPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.08] via-accent/[0.03] to-background py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            Legal
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold font-heading leading-tight">
            Kebijakan{" "}
            <span className="bg-gradient-to-r from-primary via-[hsl(340_85%_55%)] to-accent bg-clip-text text-transparent">
              Privasi
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Bagaimana {SITE_NAME} mengelola dan melindungi data pribadi kamu.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Terakhir diperbarui: 1 Mei 2026</p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 prose prose-gray">
          <h2 className="text-xl font-bold font-heading mt-8">1. Informasi yang Kami Kumpulkan</h2>
          <p className="text-muted-foreground leading-relaxed">
            Kami mengumpulkan informasi yang kamu berikan secara sukarela, seperti:
          </p>
          <ul className="text-muted-foreground space-y-1">
            <li>Alamat email saat mendaftar waitlist</li>
            <li>Data penggunaan platform (halaman yang dikunjungi, fitur yang digunakan)</li>
            <li>Informasi yang kamu berikan melalui form kontak</li>
          </ul>

          <h2 className="text-xl font-bold font-heading mt-8">2. Penggunaan Informasi</h2>
          <p className="text-muted-foreground leading-relaxed">
            Informasi yang kami kumpulkan digunakan untuk:
          </p>
          <ul className="text-muted-foreground space-y-1">
            <li>Mengirim notifikasi terkait platform dan fitur baru</li>
            <li>Meningkatkan kualitas layanan dan pengalaman pengguna</li>
            <li>Menjawab pertanyaan dan memberikan dukungan</li>
            <li>Mengirim konten informatif (dengan persetujuan kamu)</li>
          </ul>

          <h2 className="text-xl font-bold font-heading mt-8">3. Perlindungan Data</h2>
          <p className="text-muted-foreground leading-relaxed">
            Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi data pribadi kamu dari akses tidak sah, perubahan, pengungkapan, atau penghancuran. Data kamu disimpan di server yang aman dengan enkripsi yang sesuai.
          </p>

          <h2 className="text-xl font-bold font-heading mt-8">4. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            Kami menggunakan cookies untuk meningkatkan pengalaman browsing kamu. Cookies membantu kami memahami bagaimana kamu menggunakan platform kami. Kamu dapat mengatur preferensi cookies melalui pengaturan browser.
          </p>

          <h2 className="text-xl font-bold font-heading mt-8">5. Pihak Ketiga</h2>
          <p className="text-muted-foreground leading-relaxed">
            Kami tidak menjual, menukar, atau mentransfer data pribadi kamu ke pihak ketiga tanpa persetujuan kamu, kecuali diwajibkan oleh hukum. Data dapat dibagikan dengan penyedia layanan tepercaya yang membantu kami mengoperasikan platform.
          </p>

          <h2 className="text-xl font-bold font-heading mt-8">6. Hak Kamu</h2>
          <p className="text-muted-foreground leading-relaxed">
            Kamu berhak untuk:
          </p>
          <ul className="text-muted-foreground space-y-1">
            <li>Mengakses data pribadi yang kami simpan</li>
            <li>Meminta koreksi atau penghapusan data</li>
            <li>Menolak penggunaan data untuk tujuan pemasaran</li>
            <li>Menarik persetujuan kapan saja</li>
          </ul>

          <h2 className="text-xl font-bold font-heading mt-8">7. Kontak</h2>
          <p className="text-muted-foreground leading-relaxed">
            Jika ada pertanyaan tentang kebijakan privasi ini, hubungi kami melalui email di hello@rodatrip.id.
          </p>
        </div>
      </section>
    </>
  )
}

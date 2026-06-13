"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">💥</div>
          <h1 className="text-2xl font-bold font-heading mb-2">Terjadi Kesalahan</h1>
          <p className="text-muted-foreground mb-6">
            Maaf, terjadi kesalahan serius pada aplikasi. Silakan coba refresh halaman.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold shadow-lg transition-all hover:shadow-primary/40"
          >
            Refresh Halaman
          </button>
        </div>
      </body>
    </html>
  )
}

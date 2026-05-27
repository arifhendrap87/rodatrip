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
      <body className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center px-4">
          <h1 className="text-6xl font-bold font-heading text-destructive">500</h1>
          <p className="mt-4 text-xl font-medium font-heading">Terjadi kesalahan</p>
          <p className="mt-2 text-muted-foreground max-w-md">
            Maaf, ada sesuatu yang tidak beres. Silakan coba lagi.
          </p>
          <button
            onClick={reset}
            className="mt-8 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  )
}

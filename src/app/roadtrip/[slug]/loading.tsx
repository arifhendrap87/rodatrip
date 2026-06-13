export default function Loading() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.08] via-accent/[0.03] to-background py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="h-4 w-24 bg-muted rounded animate-pulse mb-6" />
          <div className="h-12 w-3/4 bg-muted rounded-xl animate-pulse" />
          <div className="mt-6 flex gap-4">
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            <div className="h-5 w-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-6">
            <div className="h-12 w-12 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-48 bg-muted rounded animate-pulse" />
              <div className="h-20 w-full bg-muted rounded-xl animate-pulse" />
              <div className="h-16 w-full bg-muted rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

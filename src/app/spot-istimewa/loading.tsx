export default function Loading() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-b from-primary/[0.08] via-accent/[0.03] to-background py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
          <div className="h-12 w-96 bg-muted rounded-xl animate-pulse" />
          <div className="mt-4 h-5 w-64 bg-muted rounded animate-pulse" />
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-[2rem] bg-white shadow-md border border-border/50 overflow-hidden">
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

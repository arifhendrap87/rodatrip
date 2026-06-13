export default function Loading() {
  return (
    <div className="min-h-screen py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-6">
        <div className="h-10 w-3/4 bg-muted rounded-xl animate-pulse" />
        <div className="h-5 w-1/2 bg-muted rounded animate-pulse" />
        <div className="aspect-video bg-muted rounded-2xl animate-pulse" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

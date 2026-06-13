export default function Loading() {
  return (
    <div className="min-h-screen py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="aspect-[21/9] bg-muted rounded-2xl animate-pulse mb-8" />
        <div className="flex gap-6">
          <div className="flex-1 space-y-4">
            <div className="h-8 w-3/4 bg-muted rounded-xl animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-muted rounded animate-pulse" />
          </div>
          <div className="w-64 hidden lg:block space-y-4">
            <div className="h-40 bg-muted rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

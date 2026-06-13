export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="h-8 w-48 bg-muted rounded-xl animate-pulse mx-auto mb-4" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse mx-auto mb-6" />
        <div className="space-y-3">
          <div className="h-3 w-full bg-muted rounded animate-pulse" />
          <div className="h-3 w-5/6 bg-muted rounded animate-pulse mx-auto" />
          <div className="h-3 w-4/6 bg-muted rounded animate-pulse mx-auto" />
        </div>
      </div>
    </div>
  )
}

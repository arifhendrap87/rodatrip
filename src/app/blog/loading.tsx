export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mx-auto mb-4" />
        <div className="h-4 w-32 bg-muted rounded animate-pulse mx-auto" />
      </div>
    </div>
  )
}

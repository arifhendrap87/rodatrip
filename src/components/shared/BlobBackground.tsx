import { cn } from "@/lib/utils"

interface BlobBackgroundProps {
  className?: string
  color?: string
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "center"
}

export function BlobBackground({ className, position = "top-right" }: BlobBackgroundProps) {
  const positions = {
    "top-right": "top-0 -right-1/4",
    "top-left": "top-0 -left-1/4",
    "bottom-right": "bottom-0 -right-1/4",
    "bottom-left": "bottom-0 -left-1/4",
    "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  }

  return (
    <div className={cn("absolute pointer-events-none", positions[position], className)}>
      <div className="w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent blur-3xl" />
    </div>
  )
}

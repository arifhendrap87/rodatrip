import { cn } from "@/lib/utils"

interface GradientTextProps {
  children: React.ReactNode
  className?: string
  as?: "h1" | "h2" | "h3" | "span"
}

export function GradientText({ children, className, as: Tag = "span" }: GradientTextProps) {
  return (
    <Tag
      className={cn(
        "bg-gradient-to-r from-primary via-[hsl(340_85%_55%)] to-accent bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </Tag>
  )
}

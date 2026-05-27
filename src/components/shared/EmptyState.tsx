import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyState({ icon = "📭", title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12", className)}>
      <span className="text-4xl opacity-40 mb-4">{icon}</span>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 text-sm text-primary hover:underline underline-offset-2"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

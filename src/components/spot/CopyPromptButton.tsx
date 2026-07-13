"use client"

import { Copy } from "lucide-react"
import { toast } from "sonner"

export function CopyPromptButton({ prompt }: { prompt: string }) {
  if (!prompt) return null
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(prompt); toast.success("Prompt gambar tersalin!") }}
      className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-2"
    >
      <Copy className="h-3 w-3" />
      Copy Prompt Gambar
    </button>
  )
}

"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return

    let posthog: typeof import("posthog-js").default | null = null
    import("posthog-js")
      .then((mod) => {
        posthog = mod.default
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
          capture_pageview: false,
          loaded: (ph) => {
            if (process.env.NODE_ENV !== "production") ph.opt_out_capturing()
          },
        })
      })
      .catch(() => {})

    return () => {
      posthog = null
    }
  }, [])

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
    let cancelled = false
    import("posthog-js")
      .then((mod) => {
        if (cancelled) return
        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
        mod.default.capture("$pageview", { $current_url: url })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [pathname, searchParams])

  return <>{children}</>
}

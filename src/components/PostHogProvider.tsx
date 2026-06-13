"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import posthog from "posthog-js"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
      capture_pageview: false,
      loaded: (ph) => {
        if (process.env.NODE_ENV !== "production") ph.opt_out_capturing()
      },
    })
  }, [])

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
    posthog.capture("$pageview", { $current_url: url })
  }, [pathname, searchParams])

  return <>{children}</>
}

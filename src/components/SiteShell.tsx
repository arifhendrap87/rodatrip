"use client"

import { Suspense } from "react"
import { usePathname } from "next/navigation"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import { PostHogProvider } from "@/components/PostHogProvider"

function PostHogBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <PostHogProvider>{children}</PostHogProvider>
    </Suspense>
  )
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const adminSecret = "manage-rodatrip"
  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith(`/${adminSecret}`)

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-full flex-col">
      <PostHogBoundary>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </PostHogBoundary>
    </div>
  )
}

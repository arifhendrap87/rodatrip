"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Logo } from "@/components/icons"
import { NAV_LINKS, SITE_NAME } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Home, MapPin, Route, FileText } from "lucide-react"

const NAV_ICONS: Record<string, React.ReactNode> = {
  "/": <Home className="h-5 w-5" />,
  "/spot-istimewa": <MapPin className="h-5 w-5" />,
  "/roadtrip": <Route className="h-5 w-5" />,
  "/blog": <FileText className="h-5 w-5" />,
}

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [siteName, setSiteName] = useState(SITE_NAME)
  const [user, setUser] = useState<{ email: string; fullName?: string } | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    fetch("/api/settings")
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.site_name) setSiteName(json.data.site_name)
      })
      .catch(() => {})
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.user) setUser(json.data.user)
      })
      .catch(() => {})
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  async function handleLogout() {
    await fetch("/api/auth/signout", { method: "POST" })
    setUser(null)
    window.location.href = "/"
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-white/10 bg-[#2C4A3E]/90 backdrop-blur-xl shadow-lg"
          : "bg-[#2C4A3E]"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <Logo className="h-7 w-7 text-white transition-transform duration-300 group-hover:scale-110" />
          <span className="text-lg font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>{siteName}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/70 transition-all duration-300 hover:text-white hover:underline underline-offset-4"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 pl-3 border-l border-white/20">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                    {(user.fullName || user.email).charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-white/80">{user.fullName || user.email}</span>
                </div>
                <button onClick={handleLogout} className="text-xs text-white/50 hover:text-white transition-colors">
                  Keluar
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">
                  Masuk
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="outline" className="border-white/30 text-white bg-transparent hover:bg-white/10 rounded-xl text-xs">
                    Daftar
                  </Button>
                </Link>
              </>
            )}
          </div>
          <Link href="/roadtrip">
            <Button size="sm" className="bg-[#D95D39] text-white font-semibold shadow-lg shadow-black/20 hover:bg-[#D95D39]/90 rounded-xl">
              🚗 Mulai Jelajahi
            </Button>
          </Link>
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="Menu"
              className="md:hidden group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-white/20 bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 size-8 text-white hover:bg-white/10 rounded-xl"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-[#2C4A3E] text-white border-l border-white/10">
            <SheetHeader className="px-4 pt-2">
              <SheetTitle className="flex items-center gap-2 text-white">
                <Logo className="h-6 w-6 text-white" />
                <span className="text-base font-bold font-heading">{siteName}</span>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-1 px-3 pt-4">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white/90"
                    )}
                  >
                    <span className="shrink-0 opacity-70">{NAV_ICONS[link.href]}</span>
                    {link.label}
                  </Link>
                )
              })}
            </div>
            <div className="border-t border-white/10 px-3 pt-3 pb-4">
              {user ? (
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                      {(user.fullName || user.email).charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-white/80">{user.fullName || user.email}</span>
                  </div>
                  <button onClick={() => { handleLogout(); setOpen(false) }} className="text-xs text-white/50 hover:text-white">
                    Keluar
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 px-3">
                  <Link href="/login" onClick={() => setOpen(false)} className="flex-1">
                    <Button variant="outline" className="w-full border-white/30 text-white bg-transparent hover:bg-white/10 rounded-xl text-sm">
                      Masuk
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="flex-1">
                    <Button className="w-full bg-[#D95D39] text-white hover:bg-[#D95D39]/90 rounded-xl text-sm">
                      Daftar
                    </Button>
                  </Link>
                </div>
              )}
              <div className="mt-3 px-3">
                <Link href="/roadtrip" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-white/10 text-white hover:bg-white/20 rounded-xl text-sm h-10">
                    🚗 Mulai Jelajahi
                  </Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth, signOut } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import {
  LayoutDashboard,
  MapPin,
  ShoppingBag,
  Map,
  Image,
  Globe,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Sparkles,
  Share2,
  FileText,
  Receipt,
  MessageCircle,
  CheckCircle,
  Calendar,
  ChevronRight,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/spots", label: "Spots", icon: MapPin },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/roadtrips", label: "Roadtrips", icon: Map },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/media", label: "Media", icon: Image },
  { href: "/admin/regions", label: "Regions", icon: Globe },
  { href: "/admin/chat", label: "AI Chat", icon: MessageCircle },
  { href: "/admin/content-generator", label: "Konten Sosmed", icon: Share2 },
  { href: "/admin/content-generator/drafts", label: "Konsep", icon: FileText },
  { href: "/admin/content-generator/calendar", label: "Kalender", icon: Calendar },
  { href: "/admin/prompt-generator", label: "Prompt GPT", icon: Sparkles },
  { href: "/admin/content-readiness", label: "Kesiapan", icon: CheckCircle },
  { href: "/admin/waitlist", label: "Waitlist", icon: Mail },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/invoice", label: "Invoice", icon: Receipt },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (pathname === "/admin/login" || pathname.startsWith("/admin/auth")) {
    return <>{children}</>
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/admin/login")
  }

  const SidebarContent = ({ collapsed }: { collapsed?: boolean }) => (
    <div className="flex h-full flex-col">
      <div className={`flex h-14 items-center gap-2 border-b ${collapsed ? 'justify-center px-0' : 'px-4'}`}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shrink-0">
          R
        </div>
        {!collapsed && <span className="font-heading text-lg font-bold">RodaTrip</span>}
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                collapsed ? "justify-center mx-auto w-10" : "gap-3",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          className={`w-full justify-start text-muted-foreground ${collapsed ? 'px-0 justify-center' : 'gap-3'}`}
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className={`hidden shrink-0 border-r bg-card md:block transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-16'}`}>
        <div className="relative h-full">
          <SidebarContent collapsed={!sidebarOpen} />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3 top-1/2 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground hover:text-foreground shadow-sm transition-colors"
          >
            <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          className="fixed left-3 top-3 z-50 inline-flex items-center justify-center rounded-lg border border-input bg-background p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground md:hidden"
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-56 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-4 pt-14 md:p-8 md:pt-8">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  )
}

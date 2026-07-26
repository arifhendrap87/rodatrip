import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ALLOWED_ORIGINS = [
  "https://rodatrip.id",
  "https://www.rodatrip.id",
  "https://rodatrip.vercel.app",
  "https://rodatrip-git-staging-arifhendrap87s-projects.vercel.app",
  "http://localhost:3000",
  "http://localhost",
]

const ALLOWED_HOSTS = ALLOWED_ORIGINS.map((o) => {
  try { return new URL(o).host } catch { return null }
}).filter(Boolean) as string[]

function isAllowedOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).host
    return ALLOWED_HOSTS.includes(host)
  } catch {
    return false
  }
}

const RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>()

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  response.headers.set("x-pathname", pathname)

  // Security headers
  response.headers.set("x-frame-options", "DENY")
  response.headers.set("x-content-type-options", "nosniff")
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin")
  response.headers.set("x-dns-prefetch-control", "on")
  response.headers.set("strict-transport-security", "max-age=63072000; includeSubDomains; preload")
  response.headers.set("x-xss-protection", "1; mode=block")
  response.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()")

  // CORS
  if (pathname.startsWith("/api")) {
    const reqOrigin = request.headers.get("origin")
    if (reqOrigin) {
      if (isAllowedOrigin(reqOrigin)) {
        response.headers.set("access-control-allow-origin", reqOrigin)
        response.headers.set("access-control-allow-credentials", "true")
        response.headers.set("access-control-allow-methods", "GET, POST, PUT, DELETE, OPTIONS")
        response.headers.set("access-control-allow-headers", "Content-Type, Authorization")
      } else {
        return new NextResponse(null, { status: 403, statusText: "Forbidden" })
      }
    }
  }

  // Rate limiting for login API
  if (pathname === "/api/auth/login" && request.method === "POST") {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    const now = Date.now()
    const entry = RATE_LIMIT_MAP.get(ip)

    if (entry && now <= entry.resetAt && entry.count >= 5) {
      return NextResponse.json(
        { error: { code: "RATE_LIMITED", message: "Terlalu banyak percobaan login. Coba lagi 15 menit lagi." } },
        { status: 429 }
      )
    }

    if (!entry || now > entry.resetAt) {
      RATE_LIMIT_MAP.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
    } else {
      entry.count++
    }

    response.headers.set("x-ratelimit-remaining", String(Math.max(0, 5 - (entry?.count || 0))))
  }

  // Reset rate limit on successful login
  if (pathname === "/api/auth/login" && request.method === "POST") {
    try {
      const clone = request.clone()
      const body = await clone.json()
      // If this is a successful login response, we'll reset via the API route
    } catch {}
  }

  // Block direct /admin access — must come through secret path (via next.config.ts rewrite)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    const viaSecret = request.nextUrl.searchParams.get("__admin_via") === "1"
    if (!viaSecret && pathname !== "/admin/auth/callback") {
      return new NextResponse(null, { status: 404 })
    }
  }

  // Admin auth
  if (pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    if (pathname.startsWith("/admin/auth")) {
      return response
    }

    const secretPath = process.env.ADMIN_SECRET_PATH || "manage-rodatrip"

    if (!session) {
      const loginUrl = new URL(`/${secretPath}/login`, request.url)
      loginUrl.searchParams.set("redirect", pathname.replace("/admin", `/${secretPath}`))
      return NextResponse.redirect(loginUrl)
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (!profile || profile.role !== "super_admin") {
      const loginUrl = new URL(`/${secretPath}/login`, request.url)
      loginUrl.searchParams.set("error", "unauthorized")
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}

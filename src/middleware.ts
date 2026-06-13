import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ALLOWED_ORIGINS = [
  "https://gaskuy-roadtrip.vercel.app",
  "http://localhost:3000",
  "http://localhost",
]

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl
  const response = NextResponse.next()

  // Set pathname header for root layout
  response.headers.set("x-pathname", pathname)

  // Security headers
  response.headers.set("x-frame-options", "DENY")
  response.headers.set("x-content-type-options", "nosniff")
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin")
  response.headers.set("x-dns-prefetch-control", "on")
  response.headers.set("strict-transport-security", "max-age=63072000; includeSubDomains; preload")
  response.headers.set("x-xss-protection", "1; mode=block")
  response.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()")

  // CORS for API routes
  if (pathname.startsWith("/api")) {
    const reqOrigin = request.headers.get("origin")
    if (reqOrigin) {
      if (ALLOWED_ORIGINS.includes(reqOrigin)) {
        response.headers.set("access-control-allow-origin", reqOrigin)
        response.headers.set("access-control-allow-credentials", "true")
        response.headers.set("access-control-allow-methods", "GET, POST, PUT, DELETE, OPTIONS")
        response.headers.set("access-control-allow-headers", "Content-Type, Authorization")
      } else {
        return new NextResponse(null, { status: 403, statusText: "Forbidden" })
      }
    }
  }

  // Admin auth
  if (pathname.startsWith("/admin")) {
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

    if (pathname === "/admin/login" || pathname.startsWith("/admin/auth")) {
      return response
    }

    if (!session) {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
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
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("error", "unauthorized")
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}

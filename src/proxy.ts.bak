import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ALLOWED_ORIGINS = [
  "https://gaskuy-roadtrip.vercel.app",
  "https://gaskuy-roadtrip-kkobh3vnv-arifhendrap87s-projects.vercel.app",
  "http://localhost:3000",
  "http://localhost",
]

const CSP_HEADERS = {
  "x-frame-options": "DENY",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-dns-prefetch-control": "on",
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Set pathname header for root layout to use
  response.headers.set("x-pathname", pathname)

  // Security headers
  for (const [key, value] of Object.entries(CSP_HEADERS)) {
    response.headers.set(key, value)
  }

  // CORS protection for API routes
  if (pathname.startsWith("/api")) {
    const origin = request.headers.get("origin")
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      // Not allowed, but still process (we just don't add ACAO header)
      // This prevents cross-origin reads
    }
  }

  // Only run auth checks for /admin routes
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

    const {
      data: { session },
    } = await supabase.auth.getSession()

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

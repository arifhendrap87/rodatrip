import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { success, unauthorized } from "@/lib/api/response"
import { getRateLimiter } from "@/lib/api/rate-limit"

const loginLimiter = getRateLimiter(5)

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed, retryAfter } = await loginLimiter(`login:${ip}`)
  if (!allowed) {
    return new Response(JSON.stringify({
      error: { message: `Too many attempts. Try again in ${retryAfter}s.` }
    }), { status: 429, headers: { "Retry-After": String(retryAfter) } })
  }

  const { email, password } = await request.json()

  if (!email || !password) {
    return unauthorized("Email and password required")
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
  if (authError || !data.session) {
    return unauthorized("Invalid email or password")
  }

  const adminClient = (await import("@supabase/supabase-js")).createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: profile } = await adminClient
    .from("profiles")
    .select("id, email, role, full_name, avatar_url")
    .eq("id", data.user.id)
    .single()

  return success({
    user: {
      id: data.user.id,
      email: data.user.email,
      role: profile?.role || "user",
      fullName: profile?.full_name,
      avatarUrl: profile?.avatar_url,
    },
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    },
  })
}

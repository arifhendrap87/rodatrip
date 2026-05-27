import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { success, unauthorized } from "@/lib/api/response"

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return unauthorized("No active session")

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: profile } = await adminClient
    .from("profiles")
    .select("id, email, role, full_name, avatar_url")
    .eq("id", session.user.id)
    .single()

  return success({
    user: {
      id: session.user.id,
      email: session.user.email,
      role: profile?.role || "user",
      fullName: profile?.full_name,
      avatarUrl: profile?.avatar_url,
    },
    session: {
      access_token: session.access_token,
      expires_at: session.expires_at,
    },
  })
}

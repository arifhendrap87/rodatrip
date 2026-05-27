import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function getServerSession() {
  const { createServerClient } = await import("@supabase/ssr")
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
  return session
}

export async function getServerAdmin() {
  const session = await getServerSession()
  if (!session) return null

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: profile } = await adminClient
    .from("profiles")
    .select("id, email, role")
    .eq("id", session.user.id)
    .single()

  if (!profile || profile.role !== "super_admin") return null

  return { ...session.user, profile }
}

export async function requireAdmin() {
  const admin = await getServerAdmin()
  if (!admin) return null
  return admin
}

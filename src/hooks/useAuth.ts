"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api/client"

export function useAuth() {
  const [user, setUser] = useState<{ id: string; email: string; role: string; full_name?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.auth.session()
      .then((res) => setUser(res.data.user as typeof user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  return { user, loading }
}

export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login")
    }
  }, [user, loading, router])

  return { user, loading }
}

export async function signIn(email: string, password: string): Promise<{ data?: unknown; error?: Error }> {
  try {
    const res = await api.auth.signin(email, password)
    return { data: res.data }
  } catch (err) {
    return { error: err as Error }
  }
}

export async function signInWithGoogle() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const { createBrowserClient } = await import("@supabase/ssr")
  const supabase = createBrowserClient(
    supabaseUrl || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  )

  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/admin/auth/callback`,
    },
  })
}

export async function signOut() {
  await api.auth.signout()
  window.location.href = "/admin/login"
}

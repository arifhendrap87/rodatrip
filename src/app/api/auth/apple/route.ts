import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { success, internalError } from "@/lib/api/response"

export async function GET() {
  try {
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

    const { data } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "https://rodatrip.id"}/admin/auth/callback`,
      },
    })

    if (!data?.url) return internalError("Failed to generate OAuth URL")
    return success({ url: data.url })
  } catch {
    return internalError("Failed to generate OAuth URL")
  }
}

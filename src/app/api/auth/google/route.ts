import { createServerClient } from "@supabase/ssr"
import { success, internalError } from "@/lib/api/response"

export async function GET() {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return [] },
          setAll() {},
        },
      }
    )

    const { data } = await supabase.auth.signInWithOAuth({
      provider: "google",
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

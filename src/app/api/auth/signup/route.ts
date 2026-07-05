import { createServerClient } from "@supabase/ssr"
import { success, badRequest, internalError } from "@/lib/api/response"
import { z } from "zod"

const signupSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  full_name: z.string().min(1, "Nama wajib diisi"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((e) => e.message).join(", "))
    }

    const { email, password, full_name } = parsed.data

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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    })

    if (error) {
      if (error.message.includes("already")) {
        return badRequest("Email sudah terdaftar")
      }
      return internalError(error.message)
    }

    return success({ user: data.user }, 201)
  } catch {
    return internalError("Failed to sign up")
  }
}

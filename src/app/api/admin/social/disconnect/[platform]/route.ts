import { NextResponse } from "next/server"
import { unauthorized, notFound } from "@/lib/api/response"
import { getServerAdmin } from "@/lib/api/auth"
import { db } from "@/lib/services/db"

export async function POST(request: Request, { params }: { params: Promise<{ platform: string }> }) {
  const admin = await getServerAdmin()
  if (!admin) return unauthorized()

  const platform = (await params).platform
  const valid = ["facebook", "instagram", "threads", "twitter"]
  if (!valid.includes(platform)) {
    return NextResponse.json({ error: { code: "INVALID_PLATFORM" } }, { status: 400 })
  }

  const { error } = await db
    .from("social_accounts")
    .delete()
    .eq("platform", platform)

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 })
  }

  return NextResponse.json({ data: { platform, disconnected: true } })
}

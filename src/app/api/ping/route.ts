import { db } from "@/lib/services/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { count } = await db
      .from("spots")
      .select("*", { count: "exact", head: true })
      .limit(1)

    return Response.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: count !== null ? "connected" : "error",
    })
  } catch {
    return Response.json({ status: "error" }, { status: 500 })
  }
}

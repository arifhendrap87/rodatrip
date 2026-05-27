import { NextResponse } from "next/server"

export function success<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status })
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 })
}

export function noContent() {
  return NextResponse.json({ success: true }, { status: 200 })
}

export function paginated<T>(data: T[], total: number, limit: number, offset: number) {
  return NextResponse.json({
    data,
    pagination: { total, limit, offset, hasMore: offset + limit < total },
  })
}

export function csv(content: string, filename: string) {
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}

export function error(code: string, message: string, status: number, details?: Record<string, unknown>) {
  return NextResponse.json(
    { error: { code, message, details } },
    { status }
  )
}

export function badRequest(message = "Invalid request") {
  return error("BAD_REQUEST", message, 400)
}

export function unauthorized(message = "Unauthorized") {
  return error("UNAUTHORIZED", message, 401)
}

export function forbidden(message = "Forbidden") {
  return error("FORBIDDEN", message, 403)
}

export function notFound(entity = "Resource") {
  return error("NOT_FOUND", `${entity} not found`, 404)
}

export function conflict(message = "Resource already exists") {
  return error("CONFLICT", message, 409)
}

export function rateLimited(retryAfter: number) {
  const res = error("RATE_LIMITED", `Too many requests. Retry after ${retryAfter}s.`, 429)
  res.headers.set("Retry-After", String(retryAfter))
  return res
}

export function internalError(message = "Internal server error") {
  return error("INTERNAL_ERROR", message, 500)
}

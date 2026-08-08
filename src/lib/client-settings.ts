"use client"

let cached: Record<string, string> = {}
let inFlight: Promise<Record<string, string>> | null = null

export function fetchSettings(): Promise<Record<string, string>> {
  if (Object.keys(cached).length > 0) return Promise.resolve(cached)
  if (inFlight) return inFlight

  inFlight = fetch("/api/settings")
    .then((r) => r.json())
    .then((json) => {
      cached = json.data || {}
      return cached
    })
    .catch(() => {
      cached = {}
      return cached
    })
    .finally(() => {
      inFlight = null
    })

  return inFlight
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()
const WINDOW_MS = 60_000

let upstashRatelimit: { limit: (key: string) => Promise<{ success: boolean; reset: number }> } | null = null

async function getUpstashRatelimit() {
  if (upstashRatelimit) return upstashRatelimit
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { Ratelimit } = await import("@upstash/ratelimit")
    const { Redis } = await import("@upstash/redis")
    const redis = Redis.fromEnv()
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "60 s"),
      analytics: true,
    })
    upstashRatelimit = {
      limit: async (key: string) => {
        const result = await limiter.limit(key)
        return { success: result.success, reset: result.reset }
      },
    }
  }
  return upstashRatelimit
}

export function getRateLimiter(maxRequests: number, windowMs = WINDOW_MS) {
  return async (key: string): Promise<{ allowed: boolean; retryAfter: number }> => {
    // Try Upstash first
    const upstash = await getUpstashRatelimit()
    if (upstash) {
      const { success, reset } = await upstash.limit(key)
      const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
      return { allowed: success, retryAfter: success ? 0 : retryAfter }
    }

    // Fallback to in-memory
    const now = Date.now()
    const entry = store.get(key)

    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs })
      return { allowed: true, retryAfter: 0 }
    }

    entry.count++

    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      return { allowed: false, retryAfter }
    }

    return { allowed: true, retryAfter: 0 }
  }
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key)
      }
    }
  }, 5 * 60_000)
}

export const publicLimiter = getRateLimiter(30)
export const authLimiter = getRateLimiter(100)
export const adminLimiter = getRateLimiter(300)

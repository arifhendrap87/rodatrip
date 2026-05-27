const BASE_URL = "/api"

type RequestOptions = {
  method?: string
  body?: unknown
  headers?: Record<string, string>
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message || `Request failed (${res.status})`)
  }

  return res.json()
}

export const api = {
  auth: {
    signin: (email: string, password: string) =>
      request<{ data: { user: { id: string; email: string; role: string }; session: { access_token: string; refresh_token: string; expires_at: number } } }>("/auth/signin", {
        method: "POST",
        body: { email, password },
      }),

    signout: () =>
      request<{ data: { message: string } }>("/auth/signout", { method: "POST" }),

    session: () =>
      request<{ data: { user: { id: string; email: string; role: string; fullName?: string; avatarUrl?: string }; session: { access_token: string; expires_at: number } } }>("/auth/session"),
  },

  spots: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : ""
      return request<{ data: Record<string, unknown>[]; pagination: { total: number; limit: number; offset: number; hasMore: boolean } }>(`/spots${qs}`)
    },

    get: (slug: string) =>
      request<{ data: Record<string, unknown> }>(`/spots/${slug}`),

    create: (data: Record<string, unknown>) =>
      request<{ data: { id: string; slug: string } }>("/spots", { method: "POST", body: data }),

    update: (slug: string, data: Record<string, unknown>) =>
      request<{ data: { id: string; slug: string; updated_at: string } }>(`/spots/${slug}`, { method: "PUT", body: data }),

    delete: (slug: string) =>
      request<{ data: { deleted: boolean } }>(`/spots/${slug}`, { method: "DELETE" }),

    trackView: (slug: string) =>
      request<{ data: { viewCount: number } }>(`/spots/${slug}/view`, { method: "POST" }),
  },

  products: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : ""
      return request<{ data: Record<string, unknown>[]; pagination: { total: number; limit: number; offset: number; hasMore: boolean } }>(`/products${qs}`)
    },

    create: (data: Record<string, unknown>) =>
      request<{ data: { id: string; slug: string } }>("/products", { method: "POST", body: data }),

    update: (id: string, data: Record<string, unknown>) =>
      request<{ data: Record<string, unknown> }>(`/products/${id}`, { method: "PUT", body: data }),

    delete: (id: string) =>
      request<{ data: { deleted: boolean } }>(`/products/${id}`, { method: "DELETE" }),
  },

  poi: {
    list: () =>
      request<{ data: Record<string, unknown>[] }>("/poi"),

    create: (data: Record<string, unknown>) =>
      request<{ data: { id: string; name: string } }>("/poi", { method: "POST", body: data }),
  },

  routes: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : ""
      return request<{ data: Record<string, unknown>[] }>(`/routes${qs}`)
    },

    get: (slug: string) =>
      request<{ data: Record<string, unknown> }>(`/routes/${slug}`),

    estimate: (slug: string, vehicle?: string) =>
      request<{ data: { distanceKm: number; fuelCost: number; totalCost: number } }>(`/routes/${slug}/estimate${vehicle ? `?vehicle=${vehicle}` : ""}`),
  },

  waitlist: {
    add: (email: string, source?: string) =>
      request<{ data: { id: string; email: string; created_at: string } }>("/waitlist", {
        method: "POST",
        body: { email, source: source || "website" },
      }),

    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : ""
      return request<{ data: Record<string, unknown>[]; pagination: { total: number; limit: number; offset: number; hasMore: boolean } }>(`/waitlist${qs}`)
    },
  },

  analytics: {
    views: () =>
      request<{ data: { totalViews: number } }>("/analytics"),

    spots: () =>
      request<{ data: { slug: string; name: string; category: string; view_count: number }[] }>("/analytics/spots"),

    categories: () =>
      request<{ data: { category: string; count: number; percentage: number }[] }>("/analytics/categories"),

    track: (eventType: string, entityType?: string, entityId?: string, metadata?: Record<string, unknown>) =>
      request<{ data: { eventId: string } }>("/analytics/track", {
        method: "POST",
        body: { eventType, entityType, entityId, metadata },
      }),
  },
}

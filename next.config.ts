import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
]

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    const secretPath = process.env.ADMIN_SECRET_PATH || "manage-rodatrip"
    return [
      {
        source: `/${secretPath}/:path*`,
        destination: `/admin/:path*?__admin_via=1`,
      },
      {
        source: `/${secretPath}`,
        destination: `/admin?__admin_via=1`,
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-1a37d792e7bc411380f4fed507dc7100.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "gaskuy-spot-images.r2.cloudflarestorage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.gaskuy.id",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/gaskuy-images/**",
      },
    ],
  },
};

export default nextConfig;

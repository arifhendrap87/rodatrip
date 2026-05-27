import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.gaskuy.id",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "gaskuy-spot-images.r2.cloudflarestorage.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

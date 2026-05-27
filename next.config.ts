import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ],
  },
};

export default nextConfig;

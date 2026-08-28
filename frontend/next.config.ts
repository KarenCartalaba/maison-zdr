import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },

  // Compression
  compress: true,

  // Production optimizations
  poweredByHeader: false,
  reactStrictMode: true,

  // Bundle analysis (run ANALYZE=true npm run build)
  ...(process.env.ANALYZE === "true" && {}),
}

export default nextConfig

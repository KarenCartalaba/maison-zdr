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

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ]
  },

  // Same-origin API proxy: browser calls /api/* and Next.js forwards them
  // to the backend. The backend's Set-Cookie then lands as a first-party
  // cookie, so incognito third-party-cookie blocking no longer drops the
  // session. Returns [] when the backend URL is missing so local dev is
  // unaffected. (Rewrites API per node_modules/next/dist/docs: async
  // rewrites() returning an array of { source, destination }.)
  async rewrites() {
    const backend = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/+$/, "");
    if (!backend) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ];
  },

  // Bundle analysis (run ANALYZE=true npm run build)
  ...(process.env.ANALYZE === "true" && {}),
}

export default nextConfig

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gzip/brotli compress all responses
  compress: true,

  // Strict mode helps React optimise renders
  reactStrictMode: true,

  // Optimise remote images via Next.js CDN
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
  },

  // Cache headers: static assets forever, API never cached
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;


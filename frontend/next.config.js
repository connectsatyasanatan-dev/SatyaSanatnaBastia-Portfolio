/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['recharts'],

  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = {
        type: 'filesystem',
      };
    }
    return config;
  },

  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000'
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache public read-only content endpoints on CDN
        source: '/api/(personal-info|skills|projects|experience|education|certifications|achievements|testimonials|blog)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=60' },
        ],
      },
      {
        // Forbid caching for all administrative and authenticated endpoints
        source: '/api/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
        ],
      },
      {
        // Forbid caching for stateful and dynamic endpoints (chat, contact, analytics)
        source: '/api/(contact|chat|track-visit|track-duration|health)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, private' },
        ],
      },
    ]
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
  },
}

module.exports = nextConfig

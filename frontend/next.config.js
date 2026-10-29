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
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      preventFullImport: true,
    },
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@tanstack/react-query',
    ],
  },
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
        source: '/api/:path((?!chat).*)',
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
        // Cache public API responses briefly on CDN
        source: '/api/(personal-info|skills|projects|experience|education|certifications|achievements|testimonials|blog|stats)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=60' },
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

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
        // ── Global security headers (SXO — User Trust Signals) ────────────
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissions Policy (SXO — fewer intrusive capabilities = better UX signals)
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
        ],
      },
      {
        // ── PDF preview headers (allow inline iframe preview in Resume modal) ──
        source: '/(.*).pdf',
        headers: [
          { key: 'Content-Type', value: 'application/pdf' },
          { key: 'Content-Disposition', value: 'inline' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=3600' },
        ],
      },
      {
        // ── Cache static assets aggressively (SXO — Core Web Vitals) ──────
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache fonts and static files (performance)
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // ── GEO/AIO — AI-readable resources served with long cache + CORS ─
        source: '/llms.txt',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=3600' },
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'X-Robots-Tag', value: 'all' },
        ],
      },
      {
        source: '/humans.txt',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
        ],
      },
      {
        // ── Cache public read-only content endpoints on CDN ────────────────
        source: '/api/(personal-info|skills|projects|experience|education|certifications|achievements|testimonials|blog)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=60' },
        ],
      },
      {
        // ── GEO/AEO endpoints — cache longer since data rarely changes ─────
        source: '/api/(llms-context|aeo-data)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=300' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Vary', value: 'Accept' },
        ],
      },
      {
        // ── Forbid caching for admin/auth endpoints ────────────────────────
        source: '/api/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
        ],
      },
      {
        // ── Forbid caching for stateful/dynamic endpoints ──────────────────
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
    // Optimize images from our own domain
    domains: ['satyasanatnabastia.onrender.com'],
  },
}

module.exports = nextConfig

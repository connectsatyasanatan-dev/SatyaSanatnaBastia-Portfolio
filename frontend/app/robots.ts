import { MetadataRoute } from 'next'

const SITE_URL = 'https://satyasanatnabastia.onrender.com'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/admin/', '/admin/'],
            },
            // ── Global Search Engine Crawlers ──────────────────────────────
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/api/admin/', '/admin/'],
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/api/admin/', '/admin/'],
            },
            {
                userAgent: 'DuckDuckBot',
                allow: '/',
                disallow: ['/api/admin/', '/admin/'],
            },
            {
                userAgent: 'Slurp', // Yahoo
                allow: '/',
                disallow: ['/api/admin/', '/admin/'],
            },
            {
                userAgent: 'Bravebot', // Brave Search
                allow: '/',
                disallow: ['/api/admin/', '/admin/'],
            },
            {
                userAgent: 'YandexBot', // Yandex
                allow: '/',
                disallow: ['/api/admin/', '/admin/'],
            },
            {
                userAgent: 'Baiduspider', // Baidu
                allow: '/',
                disallow: ['/api/admin/', '/admin/'],
            },
            // ── Apple Siri / Spotlight / Safari Crawler ───────────────────
            {
                userAgent: 'Applebot',
                allow: '/',
                disallow: ['/api/admin/', '/admin/'],
            },
            {
                userAgent: 'Applebot-Extended',
                allow: '/',
                disallow: ['/api/admin/', '/admin/'],
            },
            // ── AI & LLM Search Crawlers (GEO / AEO) ───────────────────────
            {
                userAgent: 'GPTBot',
                allow: '/',
                disallow: ['/api/admin/', '/admin/'],
            },
            {
                userAgent: 'ChatGPT-User',
                allow: '/',
                disallow: ['/api/admin/', '/admin/'],
            },
            {
                userAgent: 'OAI-SearchBot', // OpenAI SearchGPT
                allow: '/',
                disallow: ['/api/admin/', '/admin/'],
            },
            {
                userAgent: 'PerplexityBot',
                allow: '/',
                disallow: ['/api/admin/', '/admin/'],
            },
            {
                userAgent: 'anthropic-ai',
                allow: '/',
                disallow: ['/api/admin/', '/admin/'],
            },
            {
                userAgent: 'Claude-Web',
                allow: '/',
                disallow: ['/api/admin/', '/admin/'],
            },
            {
                userAgent: 'CCBot',
                allow: '/',
                disallow: ['/api/admin/', '/admin/'],
            },
            {
                userAgent: 'cohere-ai',
                allow: '/',
                disallow: ['/api/admin/', '/admin/'],
            },
            {
                userAgent: 'Meta-ExternalAgent', // Meta AI
                allow: '/',
                disallow: ['/api/admin/', '/admin/'],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    }
}

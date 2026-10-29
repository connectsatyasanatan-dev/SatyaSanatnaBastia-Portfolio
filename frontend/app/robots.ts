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
            // Allow all AI/LLM crawlers (GEO Optimization)
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
                userAgent: 'CCBot',
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
                userAgent: 'PerplexityBot',
                allow: '/',
                disallow: ['/api/admin/', '/admin/'],
            },
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
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    }
}

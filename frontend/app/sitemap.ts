import { MetadataRoute } from 'next'

const SITE_URL = 'https://satyasanatnabastia.onrender.com'

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date()
    
    return [
        // ── Main page (highest priority) ──────────────────────────────────
        {
            url: SITE_URL,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        // ── Hero/About section ─────────────────────────────────────────────
        {
            url: `${SITE_URL}/#hero-section`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        // ── Skills section ─────────────────────────────────────────────────
        {
            url: `${SITE_URL}/#skills`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        // ── Experience section ─────────────────────────────────────────────
        {
            url: `${SITE_URL}/#experience`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        // ── Education section ──────────────────────────────────────────────
        {
            url: `${SITE_URL}/#education`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.7,
        },
        // ── Certifications section ─────────────────────────────────────────
        {
            url: `${SITE_URL}/#certifications`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        // ── Projects section ───────────────────────────────────────────────
        {
            url: `${SITE_URL}/#projects`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        // ── Testimonials section ───────────────────────────────────────────
        {
            url: `${SITE_URL}/#testimonials`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        // ── Blog section ───────────────────────────────────────────────────
        {
            url: `${SITE_URL}/#blog`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        // ── Contact section ────────────────────────────────────────────────
        {
            url: `${SITE_URL}/#contact`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        // ── AI-readable resources (GEO) ────────────────────────────────────
        {
            url: `${SITE_URL}/llms.txt`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ]
}

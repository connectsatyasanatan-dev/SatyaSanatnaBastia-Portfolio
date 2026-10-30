import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import '../styles/components.css'
import '../styles/sections.css'
import '../styles/sections-extended.css'
import '../styles/sections-final.css'
import '../styles/skills-modern.css'
import '../styles/responsive.css'

const inter = Inter({ subsets: ['latin'] })

const SITE_URL = 'https://satyasanatnabastia.onrender.com'

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || SITE_URL),
    title: {
        default: "Satya Sanatan Bastia | Full Stack Developer & AI Engineer",
        template: "%s | Satya Sanatan Bastia"
    },
    description: 'Satya Sanatan Bastia — Full Stack Developer & AI Engineer from Bhubaneswar, India. Expert in React, Next.js, TypeScript, Python, Flask, PostgreSQL & LLM integration. Open to hire.',
    keywords: [
        // Core Identity
        "Satya Sanatan Bastia", "Satya Sanatan", "SatyaSanatan",
        "Full Stack Developer India", "Full Stack Developer Bhubaneswar",
        "Full Stack Developer Odisha", "Web Developer India",
        // Skills — Frontend
        "React Developer", "Next.js Developer", "TypeScript Developer",
        "JavaScript Developer", "Frontend Developer India",
        "React.js Expert", "Next.js 14 App Router", "Framer Motion",
        "Redux Toolkit", "React Query", "Tailwind CSS Developer",
        // Skills — Backend
        "Python Developer", "Flask Developer", "FastAPI Developer",
        "REST API Developer", "Backend Developer India",
        "Node.js Developer", "PostgreSQL Developer",
        "MongoDB Developer", "Docker Developer",
        // Skills — AI/ML
        "AI Developer India", "LLM Integration Developer",
        "Groq API Developer", "OpenAI API Developer",
        "AI Chatbot Developer", "RAG Developer",
        "AI Engineer India", "AI-powered web applications",
        // Portfolio Terms
        "Developer Portfolio", "VS Code Portfolio",
        "Portfolio Website India", "Hire Full Stack Developer India",
        "Freelance Developer India", "Remote Developer India",
        // Location
        "Bhubaneswar Developer", "Odisha Developer",
        "India Full Stack Developer", "Remote Full Stack Developer",
        // Experience
        "2 years experience developer", "junior developer",
        "web application development", "scalable web apps",
        "cloud deployment", "Render Vercel deployment",
    ],
    authors: [{ name: "Satya Sanatan Bastia", url: SITE_URL }],
    creator: "Satya Sanatan Bastia",
    publisher: "Satya Sanatan Bastia",
    other: {
        copyright: "Copyright (c) Satya Sanatan Bastia. All Rights Reserved.",
        "author-signature": "Satya Sanatan Bastia",
        // AIO — AI-readable meta for LLM crawlers
        "ai-description": "Satya Sanatan Bastia is a Full Stack Developer and AI Engineer from Bhubaneswar, Odisha, India. He builds modern web applications using React, Next.js, TypeScript, Python, Flask, and PostgreSQL. He integrates AI/LLM capabilities and is available for hire for full-time roles and freelance projects. Contact: connectsatyasanatan@gmail.com",
        "ai-keywords": "Full Stack Developer, React, Next.js, TypeScript, Python, Flask, PostgreSQL, AI integration, LLM, Groq, OpenAI, Docker, Bhubaneswar, India, hire developer, freelance developer",
        "ai-entity": "Satya Sanatan Bastia",
        "ai-entity-type": "Person",
        "ai-entity-description": "Full Stack Developer and AI Engineer",
        "ai-contact": "connectsatyasanatan@gmail.com",
        "ai-availability": "Open to hire — full-time and freelance",
        "ai-location": "Bhubaneswar, Odisha, India",
        // GEO — Generative Engine discovery hints
        "geo-target": "India, Remote",
        "geo-position": "20.2961;85.8245",
        "ICBM": "20.2961, 85.8245",
        // AEO — Answer Engine
        "answer-entity": "Satya Sanatan Bastia | Full Stack Developer",
        "answer-context": "Developer portfolio website with skills, projects, experience, certifications, blog, AI chatbot",
        // Humans.txt & llms.txt references
        "humans-txt": `${SITE_URL}/humans.txt`,
        "llms-txt": `${SITE_URL}/llms.txt`,
    },
    alternates: {
        canonical: SITE_URL,
        languages: { 'en-US': SITE_URL },
    },
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "ZR9hCcJH3bQqK0fLHe8N7Hz7GI2tbiaQKmnt9Mut410",
        yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
        yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
        other: {
            'msvalidate.01': [process.env.NEXT_PUBLIC_BING_VERIFICATION || '15AF42CF76F4FB6E6E5531D2F4A92CF6'],
        },
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'Satya Sanatan Bastia',
    },
    formatDetection: {
        telephone: false,
        date: false,
        address: false,
        email: false,
    },
    category: "technology",
    icons: {
        icon: [
            { url: '/favicon.png', type: 'image/png' },
            { url: '/images/Polished Bearded Avatar in Hoodie.png' },
        ],
        shortcut: '/favicon.png',
        apple: '/images/Polished Bearded Avatar in Hoodie.png',
    },
    openGraph: {
        type: "profile",
        locale: "en_US",
        url: SITE_URL,
        siteName: "Satya Sanatan Bastia — Portfolio",
        title: "Satya Sanatan Bastia | Full Stack Developer & AI Engineer",
        description: "Full Stack Developer from Bhubaneswar, India. Expert in React, Next.js, Python, Flask & AI. Available for hire — full-time & freelance. View projects, skills & contact.",
        firstName: "Satya Sanatan",
        lastName: "Bastia",
        username: "connectsatyasanatan",
        images: [
            {
                url: `${SITE_URL}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: "Satya Sanatan Bastia — Full Stack Developer & AI Engineer Portfolio",
                type: "image/jpeg",
            },
            {
                url: `${SITE_URL}/images/Polished Bearded Avatar in Hoodie.png`,
                width: 400,
                height: 400,
                alt: "Satya Sanatan Bastia Profile Photo",
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        site: "@SatyaSanatan_",
        creator: "@SatyaSanatan_",
        title: "Satya Sanatan Bastia | Full Stack Developer & AI Engineer",
        description: "Full Stack Developer from Bhubaneswar, India. React, Next.js, Python, Flask, AI integration. Open to hire.",
        images: [`${SITE_URL}/og-image.jpg`],
    },
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    manifest: `${SITE_URL}/manifest.json`,
}

import { Viewport } from 'next'
export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
        { media: '(prefers-color-scheme: light)', color: '#0f172a' },
    ],
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
}

import Providers from './providers'

// ── JSON-LD Structured Data (AIO / GEO / AEO) ───────────────────────────────

const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    "name": "Satya Sanatan Bastia",
    "alternateName": ["Satya Sanatan", "SatyaSanatan"],
    "jobTitle": "Full Stack Developer & AI Engineer",
    "description": "Full Stack Developer from Bhubaneswar, Odisha, India. Specializes in React, Next.js, TypeScript, Python, Flask, PostgreSQL, and AI/LLM integration. Available for full-time and freelance work.",
    "url": SITE_URL,
    "image": `${SITE_URL}/images/Polished Bearded Avatar in Hoodie.png`,
    "email": "connectsatyasanatan@gmail.com",
    "address": {
        "@type": "PostalAddress",
        "addressLocality": "Bhubaneswar",
        "addressRegion": "Odisha",
        "addressCountry": "IN"
    },
    "sameAs": [
        "https://github.com/connectsatyasanatan",
        "https://www.linkedin.com/in/satya-sanatan-bastia-298644223/",
        SITE_URL
    ],
    "knowsAbout": [
        "React.js", "Next.js", "TypeScript", "JavaScript",
        "Python", "Flask", "FastAPI", "PostgreSQL", "MongoDB",
        "Docker", "REST API", "GraphQL", "Redux", "Tailwind CSS",
        "Framer Motion", "AI Integration", "LLM", "Groq", "OpenAI",
        "Cloud Deployment", "CI/CD", "GitHub Actions", "Render", "Vercel"
    ],
    "hasOccupation": {
        "@type": "Occupation",
        "name": "Full Stack Developer",
        "occupationLocation": {
            "@type": "Country",
            "name": "India"
        },
        "estimatedSalary": {
            "@type": "MonetaryAmountDistribution",
            "name": "base",
            "currency": "INR",
            "duration": "P1Y",
            "percentile10": 600000,
            "percentile50": 1200000,
            "percentile90": 2400000
        },
        "skills": "React, Next.js, TypeScript, Python, Flask, PostgreSQL, Docker, AI/LLM integration"
    },
    "seeks": {
        "@type": "Demand",
        "name": "Full-time Developer Role or Freelance Project",
        "description": "Satya Sanatan Bastia is open to full-time employment and freelance web development projects, particularly in full-stack, frontend, or AI-integrated applications."
    }
}

const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    "name": "Satya Sanatan Bastia Portfolio",
    "alternateName": "Satya Sanatan Developer Portfolio",
    "url": SITE_URL,
    "description": "Developer portfolio of Satya Sanatan Bastia — Full Stack Developer & AI Engineer from Bhubaneswar, India.",
    "author": { "@id": `${SITE_URL}/#person` },
    "creator": { "@id": `${SITE_URL}/#person` },
    "publisher": { "@id": `${SITE_URL}/#person` },
    "inLanguage": "en-US",
    "potentialAction": {
        "@type": "SearchAction",
        "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${SITE_URL}/?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
    }
}

const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/#webpage`,
    "name": "Satya Sanatan Bastia | Full Stack Developer & AI Engineer",
    "url": SITE_URL,
    "about": { "@id": `${SITE_URL}/#person` },
    "isPartOf": { "@id": `${SITE_URL}/#website` },
    "dateModified": new Date().toISOString().split('T')[0],
    "description": "Portfolio website of Satya Sanatan Bastia, showcasing skills, projects, experience, education, certifications, and an AI chatbot.",
    "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": SITE_URL
            }
        ]
    }
}

const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/#service`,
    "name": "Full Stack Web Development Services",
    "description": "Satya Sanatan Bastia offers professional full-stack web development services including React/Next.js frontend development, Python/Flask backend API development, PostgreSQL database design, AI/LLM integration, and cloud deployment.",
    "provider": { "@id": `${SITE_URL}/#person` },
    "areaServed": {
        "@type": "Country",
        "name": "Worldwide"
    },
    "serviceType": [
        "Full Stack Web Development",
        "Frontend Development",
        "Backend API Development",
        "AI Chatbot Development",
        "Database Design",
        "Cloud Deployment"
    ],
    "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "description": "Available for full-time employment and freelance contracts. Contact for pricing."
    }
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <head>
                {/* ── Preconnect for performance (SXO) ── */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://satyasanatnabastia.onrender.com" />
                <link rel="dns-prefetch" href="https://satyasanatnabastia.onrender.com" />

                {/* ── Google Fonts ── */}
                <link
                    href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Noto+Sans+Oriya:wght@400;700&family=Noto+Serif+Devanagari:wght@400;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />

                {/* ── Icons ── */}
                <link rel="icon" type="image/png" href="/favicon.png" />
                <link rel="shortcut icon" href="/favicon.png" />
                <link rel="apple-touch-icon" href="/images/Polished Bearded Avatar in Hoodie.png" />

                {/* ── AI Discovery links (GEO) ── */}
                <link rel="alternate" type="text/plain" href={`${SITE_URL}/llms.txt`} title="LLMs.txt - AI-readable site overview" />
                <link rel="alternate" type="text/plain" href={`${SITE_URL}/humans.txt`} title="Humans.txt - Site credits" />

                {/* ── Search Engine Verifications (Google, Bing, Yandex) ── */}
                <meta
                    name="google-site-verification"
                    content={process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "ZR9hCcJH3bQqK0fLHe8N7Hz7GI2tbiaQKmnt9Mut410"}
                />
                <meta
                    name="msvalidate.01"
                    content={process.env.NEXT_PUBLIC_BING_VERIFICATION || "15AF42CF76F4FB6E6E5531D2F4A92CF6"}
                />
                {process.env.NEXT_PUBLIC_YANDEX_VERIFICATION && (
                    <meta name="yandex-verification" content={process.env.NEXT_PUBLIC_YANDEX_VERIFICATION} />
                )}

                {/* ── Cross-Browser & Mobile Compatibility (Safari, Edge, Firefox, Chrome) ── */}
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="Satya Sanatan Bastia" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="#0f172a" />
                <meta name="msapplication-TileColor" content="#0f172a" />
                <meta name="msapplication-navbutton-color" content="#0f172a" />

                {/* ── JSON-LD Structured Data (AIO / GEO / AEO) ── */}
                <script
                    id="schema-person"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
                />
                <script
                    id="schema-website"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
                />
                <script
                    id="schema-webpage"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
                />
                <script
                    id="schema-service"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
                />
            </head>
            <body className={`${inter.className}`} style={{ background: 'var(--background-dark)', color: 'white', fontFamily: 'var(--font-display)' }}>
                <Providers>
                    {children}
                </Providers>

                {/* ── Digital watermark & attribution ── */}
                <script
                    id="author-watermark"
                    dangerouslySetInnerHTML={{
                        __html: `
                          (function() {
                            if (typeof window !== 'undefined') {
                              var badge = "%c\\n   ARCHITECTED & ENGINEERED BY SATYA SANATAN BASTIA\\n   Copyright (c) Satya Sanatan Bastia. All Rights Reserved.\\n   This code is for viewing/evaluation purposes only.\\n   No reproduction, modification, or commercial re-hosting is permitted without explicit permission.\\n";
                              console.log(badge, "color: #38bdf8; font-weight: bold; font-family: monospace; font-size: 12px; line-height: 1.6; background: #020617; padding: 10px 16px; border-left: 4px solid #00ffcc; border-radius: 4px;");
                            }
                          })();
                        `,
                    }}
                />
                <div
                    id="digital-signature-watermark"
                    data-creator="Satya Sanatan Bastia"
                    data-copyright="Copyright (c) Satya Sanatan Bastia. All Rights Reserved."
                    data-notice="This code is for viewing/evaluation purposes only. No reproduction, modification, or commercial re-hosting is permitted without explicit permission."
                    style={{ display: 'none' }}
                    aria-hidden="true"
                />

                {/* ── AIO Hidden Machine-Readable Content (for AI crawlers) ── */}
                <div
                    id="ai-readable-content"
                    aria-hidden="true"
                    itemScope
                    itemType="https://schema.org/Person"
                    style={{ display: 'none', visibility: 'hidden', height: 0, overflow: 'hidden' }}
                >
                    <span itemProp="name">Satya Sanatan Bastia</span>
                    <span itemProp="jobTitle">Full Stack Developer and AI Engineer</span>
                    <span itemProp="description">
                        Satya Sanatan Bastia is a Full Stack Developer and AI Engineer based in Bhubaneswar, Odisha, India.
                        He builds modern web applications using React, Next.js, TypeScript, Python, Flask, and PostgreSQL.
                        He integrates AI and LLM capabilities into web applications using Groq, OpenAI, and other AI APIs.
                        He is available for full-time employment and freelance web development contracts.
                        His email is connectsatyasanatan@gmail.com.
                        His GitHub is https://github.com/connectsatyasanatan.
                        His LinkedIn is https://www.linkedin.com/in/satya-sanatan-bastia-298644223/
                    </span>
                    <link itemProp="url" href="https://satyasanatnabastia.onrender.com" />
                    <link itemProp="sameAs" href="https://github.com/connectsatyasanatan" />
                    <link itemProp="sameAs" href="https://www.linkedin.com/in/satya-sanatan-bastia-298644223/" />
                    <span itemProp="knowsAbout">React.js, Next.js, TypeScript, Python, Flask, PostgreSQL, Docker, AI Integration, LLM</span>
                    <span itemProp="email">connectsatyasanatan@gmail.com</span>
                    <span itemProp="addressLocality">Bhubaneswar</span>
                    <span itemProp="addressRegion">Odisha</span>
                    <span itemProp="addressCountry">India</span>
                </div>
            </body>
        </html>
    )
}

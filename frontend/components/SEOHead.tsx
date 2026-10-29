'use client'

import { useEffect } from 'react'

const SITE_URL = 'https://satyasanatnabastia.onrender.com'

/**
 * SEOHead — AEO/GEO structured data injected after hydration.
 *
 * Injects:
 *   1. FAQPage JSON-LD  — optimised for featured snippets and AI answer engines.
 *   2. ItemList JSON-LD — optimised for project listings in rich results.
 */
export default function SEOHead() {
    useEffect(() => {
        injectJsonLd('seo-faqpage', faqPageSchema)
        injectJsonLd('seo-itemlist', itemListSchema)

        return () => {
            removeJsonLd('seo-faqpage')
            removeJsonLd('seo-itemlist')
        }
    }, [])

    return null
}

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

function injectJsonLd(id: string, data: object) {
    if (typeof document === 'undefined') return
    // Remove any stale tag first
    removeJsonLd(id)
    const script = document.createElement('script')
    script.id = id
    script.type = 'application/ld+json'
    script.text = JSON.stringify(data)
    document.head.appendChild(script)
}

function removeJsonLd(id: string) {
    if (typeof document === 'undefined') return
    const existing = document.getElementById(id)
    if (existing) existing.remove()
}

/* ─── FAQPage Schema (AEO) ──────────────────────────────────────────────────── */

const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'Who is Satya Sanatan Bastia?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Satya Sanatan Bastia is a Full Stack Developer based in Bhubaneswar, Odisha, India. He specialises in building modern web applications using React, Next.js, TypeScript on the frontend and Python, Flask, and PostgreSQL on the backend. He also integrates AI/LLM capabilities into production applications and is available for full-time and freelance opportunities.',
            },
        },
        {
            '@type': 'Question',
            name: 'What technologies does Satya Sanatan Bastia use?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Satya Sanatan Bastia works with a modern full-stack: React, Next.js, TypeScript, and Tailwind CSS on the frontend; Python, Flask, and FastAPI on the backend; PostgreSQL, MongoDB, and Redis for data; Docker and GitHub Actions for DevOps; and OpenAI, Google Gemini, and LangChain for AI integration.',
            },
        },
        {
            '@type': 'Question',
            name: 'Is Satya Sanatan Bastia available for hire?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. Satya Sanatan Bastia is actively open to full-time software engineering roles (remote or hybrid) and freelance/contract web development projects worldwide. You can reach him at connectsatyasanatan@gmail.com.',
            },
        },
        {
            '@type': 'Question',
            name: 'How can I contact Satya Sanatan Bastia?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'You can contact Satya Sanatan Bastia via email at connectsatyasanatan@gmail.com, through the contact form on his portfolio at https://satyasanatnabastia.onrender.com/#contact, or via LinkedIn at https://www.linkedin.com/in/satya-sanatan-bastia-298644223/.',
            },
        },
        {
            '@type': 'Question',
            name: 'What projects has Satya Sanatan Bastia built?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Satya Sanatan Bastia has built multiple production-ready full-stack applications including a VS Code-inspired developer portfolio (Next.js + Flask + PostgreSQL), AI-powered SaaS applications using LangChain and OpenAI, e-commerce platforms with payment integration, real-time dashboards, and various developer tools and open-source contributions.',
            },
        },
        {
            '@type': 'Question',
            name: 'Where is Satya Sanatan Bastia located?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Satya Sanatan Bastia is based in Bhubaneswar, Odisha, India, and works remotely with clients and teams worldwide.',
            },
        },
        {
            '@type': 'Question',
            name: "What is Satya Sanatan Bastia's portfolio website?",
            acceptedAnswer: {
                '@type': 'Answer',
                text: `Satya Sanatan Bastia's portfolio website is available at ${SITE_URL}. It is a VS Code-inspired interactive portfolio showcasing his projects, skills, experience, certifications, and an AI-powered chatbot.`,
            },
        },
    ],
}

/* ─── ItemList Schema (Projects) ────────────────────────────────────────────── */

const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Projects by Satya Sanatan Bastia',
    description: 'A curated list of full-stack web and AI projects built by Satya Sanatan Bastia.',
    url: `${SITE_URL}/#projects`,
    itemListElement: [
        {
            '@type': 'ListItem',
            position: 1,
            name: 'VS Code-Inspired Developer Portfolio',
            description:
                'A fully interactive portfolio site inspired by the Visual Studio Code IDE, featuring an AI chatbot, git history visualiser, and terminal emulator. Built with Next.js, TypeScript, Flask, PostgreSQL.',
            url: `${SITE_URL}/#projects`,
        },
        {
            '@type': 'ListItem',
            position: 2,
            name: 'AI-Powered Full Stack Applications',
            description:
                'SaaS-style applications integrating LLM APIs (OpenAI GPT-4o, Google Gemini) for smart search, document Q&A, auto-summarisation, and conversational UX. Stack: React, FastAPI, LangChain, pgvector.',
            url: `${SITE_URL}/#projects`,
        },
        {
            '@type': 'ListItem',
            position: 3,
            name: 'E-Commerce & Analytics Dashboards',
            description:
                'End-to-end e-commerce platforms with Razorpay/Stripe payment integration, real-time analytics dashboards, order management, and admin panels. Stack: React, Node.js, PostgreSQL, Redis.',
            url: `${SITE_URL}/#projects`,
        },
        {
            '@type': 'ListItem',
            position: 4,
            name: 'Open-Source Developer Tools',
            description:
                'CLI utilities, npm/PyPI packages, and open-source contributions focused on developer experience, code generation, and automation.',
            url: `${SITE_URL}/#projects`,
        },
    ],
}

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

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://satya-sanatan.com'),
    title: {
        default: "Satya Sanatan | Full Stack Developer",
        template: "%s | Satya Sanatan"
    },
    icons: {
        icon: [
            { url: '/images/Polished Bearded Avatar in Hoodie.png' },
            { url: '/icon.png' }
        ],
        shortcut: '/images/Polished Bearded Avatar in Hoodie.png',
        apple: '/images/Polished Bearded Avatar in Hoodie.png',
    },
    description: 'A modern VS Code inspired developer portfolio built with Next.js, React, and Flask.',
    keywords: ["Satya Sanatan", "Full Stack Developer", "Portfolio", "React", "Next.js", "Python", "Flask", "Developer"],
    authors: [{ name: "Satya Sanatan Bastia", url: "https://satya-sanatan.com" }],
    creator: "Satya Sanatan Bastia",
    publisher: "Satya Sanatan Bastia",
    other: {
        copyright: "Copyright (c) Satya Sanatan Bastia. All Rights Reserved. This code is for viewing/evaluation purposes only. No reproduction, modification, or commercial re-hosting is permitted without explicit permission.",
        "author-signature": "Satya Sanatan Bastia",
    },
    alternates: {
        canonical: "https://satya-sanatan.com", // Replace with your domain
    },
    verification: {
        google: "google-site-verification-placeholder",
    },
    category: "technology",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://satya-sanatan.com",
        siteName: "Satya Sanatan Portfolio",
        title: "Satya Sanatan | Full Stack Developer",
        description: "A modern VS Code inspired developer portfolio built with Next.js, React, and Flask.",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Satya Sanatan Portfolio Default Open Graph Image",
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Satya Sanatan | Full Stack Developer",
        description: "A modern VS Code inspired developer portfolio built with Next.js, React, and Flask.",
        images: ["/og-image.jpg"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
}

import { Viewport } from 'next'
export const viewport: Viewport = {
    themeColor: '#0f172a',
    width: 'device-width',
    initialScale: 1,
}

import Providers from './providers'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <head>
                {/* Noto Serif Devanagari – for Sanskrit preloader text */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Noto+Sans+Oriya:wght@400;700&family=Noto+Serif+Devanagari:wght@400;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
                <link rel="icon" type="image/png" href="/images/Polished Bearded Avatar in Hoodie.png" />
                <link rel="shortcut icon" href="/images/Polished Bearded Avatar in Hoodie.png" />
                <link rel="apple-touch-icon" href="/images/Polished Bearded Avatar in Hoodie.png" />
            </head>
            <body className={`${inter.className}`} style={{ background: 'var(--background-dark)', color: 'white', fontFamily: 'var(--font-display)' }}>
                <Providers>
                    {children}
                </Providers>
                {/* Hidden digital watermark & attribution */}
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
            </body>
        </html>
    )
}
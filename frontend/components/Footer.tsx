'use client'

import { useEffect, useState } from 'react'
import { Mail, Users, Heart } from 'lucide-react'
import portfolioAPI, { PersonalInfo, PortfolioStats } from '@/lib/api'
import { useFestiveTheme } from '@/hooks/useFestiveTheme'

function FooterDiya({ position }: { position: 'left' | 'right' }) {
    return (
        <div className={`footer-diya-wrap footer-diya-wrap--${position}`} title="Shubh Deepawali ✨">
            <div className="footer-diya-aura" />
            <svg
                className="footer-diya-svg"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                {/* Flame with dynamic flicker */}
                <g className="footer-diya-flame">
                    <path
                        d="M12 1.5C12 1.5 8 6.5 8 10C8 12.2 10.07 14 12 14C13.93 14 16 12.2 16 10C16 6.5 12 1.5 12 1.5Z"
                        fill="url(#ftrFlameOuter)"
                    />
                    <path
                        d="M12 5C12 5 9.8 8 9.8 10.2C9.8 11.4 10.8 12.4 12 12.4C13.2 12.4 14.2 11.4 14.2 10.2C14.2 8 12 5 12 5Z"
                        fill="#FFFDE7"
                    />
                </g>

                {/* Terracotta Base */}
                <path
                    d="M3.5 13.5C3.5 18.5 7.2 21.5 12 21.5C16.8 21.5 20.5 18.5 20.5 13.5H3.5Z"
                    fill="url(#ftrTerracotta)"
                />
                {/* Gold Rim Accent */}
                <ellipse
                    cx="12"
                    cy="13.5"
                    rx="8.5"
                    ry="2"
                    fill="url(#ftrGoldRim)"
                />
                {/* Brass Wick Point */}
                <circle cx="12" cy="12.7" r="1" fill="#FFB300" />

                <defs>
                    <linearGradient id="ftrFlameOuter" x1="12" y1="1.5" x2="12" y2="14" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FFF59D" />
                        <stop offset="0.4" stopColor="#FFB300" />
                        <stop offset="1" stopColor="#FF3D00" />
                    </linearGradient>
                    <linearGradient id="ftrTerracotta" x1="12" y1="13.5" x2="12" y2="21.5" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#E64A19" />
                        <stop offset="1" stopColor="#BF360C" />
                    </linearGradient>
                    <linearGradient id="ftrGoldRim" x1="3.5" y1="13.5" x2="20.5" y2="13.5" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FFD54F" />
                        <stop offset="0.5" stopColor="#FFF9C4" />
                        <stop offset="1" stopColor="#FFB300" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    )
}

export default function Footer() {
    const [info, setInfo] = useState<PersonalInfo | null>(null)
    const [stats, setStats] = useState<PortfolioStats | null>(null)

    useEffect(() => {
        Promise.all([portfolioAPI.getPersonalInfo(), portfolioAPI.getStats()])
            .then(([i, s]) => { setInfo(i); setStats(s) })
            .catch(() => { })
    }, [])

    const year = new Date().getFullYear()
    const visitors = stats?.unique_visitors ?? 0
    const { activeFestival, isFestiveActive } = useFestiveTheme()
    const showDiwali = isFestiveActive && activeFestival === 'diwali'

    return (
        <footer className="site-footer">
            {/* Festive Diwali Diya Banner (Admin Controlled) */}
            {showDiwali && (
                <div className="site-footer__diwali-strip">
                    <FooterDiya position="left" />
                    <div className="site-footer__diwali-center">
                        <span className="footer-diwali-title">
                            🪔 Shubh Deepawali ✨
                        </span>
                        <span className="footer-diwali-sub">
                            May your code compile smoothly and light illuminate your path
                        </span>
                    </div>
                    <FooterDiya position="right" />
                </div>
            )}

            <div className="site-footer__inner">

                {/* Left - tagline */}
                <p className="site-footer__copy">
                    <Heart size={13} className="site-footer__heart" />
                    Built with passion by <span>{info?.name || 'Developer'}</span> · {year}
                </p>

                {/* Center - visitor count */}
                <div className="site-footer__visitors">
                    <Users size={13} />
                    <span>
                        <strong>{visitors.toLocaleString()}</strong> unique visitors
                    </span>
                </div>

                {/* Right - email */}
                {info?.email && (
                    <a
                        href={`mailto:${info.email}`}
                        className="site-footer__email"
                        aria-label="Send email"
                    >
                        <Mail size={13} />
                        {info.email}
                    </a>
                )}
            </div>
        </footer>
    )
}

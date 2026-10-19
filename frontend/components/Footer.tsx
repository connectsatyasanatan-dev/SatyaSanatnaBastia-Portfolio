'use client'

import { useEffect, useState } from 'react'
import { Mail, Users, Heart } from 'lucide-react'
import portfolioAPI, { PersonalInfo, PortfolioStats } from '@/lib/api'

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

    return (
        <footer className="site-footer">
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

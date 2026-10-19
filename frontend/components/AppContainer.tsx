'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Header from '@/components/Header'
import ResizableSidebar from '@/components/ResizableSidebar'
import TabBar from '@/components/TabBar'
import GlobalBackground from '@/components/GlobalBackground'
import PreLoader from '@/components/PreLoader'
import ScrollToTop from '@/components/ScrollToTop'
import CommandPalette from '@/components/CommandPalette'
import { SECTION_FILES } from '@/components/Sidebar'
import { getStoredTheme, applyTheme } from '@/lib/theme'

interface AppContainerProps {
    children: React.ReactNode
}

export default function AppContainer({ children }: AppContainerProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [activeSection, setActiveSection] = useState<string>('hero')

    // Initialize stored theme on mount
    useEffect(() => {
        const theme = getStoredTheme()
        applyTheme(theme)
    }, [])

    // Track which section is in viewport inside .main-content
    useEffect(() => {
        if (isLoading) return

        const scrollContainer = document.querySelector('.main-content') as HTMLElement | null
        if (!scrollContainer) return

        const observers: IntersectionObserver[] = []
        const ratioMap: Record<string, number> = {}

        SECTION_FILES.forEach((file) => {
            const el = document.getElementById(file.sectionId)
            if (!el) return

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        ratioMap[file.id] = entry.intersectionRatio
                    })
                    // Pick the section with highest visibility
                    const best = Object.entries(ratioMap).sort((a, b) => b[1] - a[1])[0]
                    if (best && best[1] > 0.05) {
                        setActiveSection(best[0])
                    }
                },
                {
                    root: scrollContainer,
                    threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
                    rootMargin: '-5% 0px -30% 0px'
                }
            )

            observer.observe(el)
            observers.push(observer)
        })

        // Also scroll position listener for precision
        const handleScroll = () => {
            const containerRect = scrollContainer.getBoundingClientRect()
            if (scrollContainer.scrollTop < 80) {
                setActiveSection('hero')
                return
            }

            let currentBest = ''
            let minDistance = Infinity

            SECTION_FILES.forEach((file) => {
                const el = document.getElementById(file.sectionId)
                if (el) {
                    const rect = el.getBoundingClientRect()
                    const diff = Math.abs(rect.top - containerRect.top)
                    if (rect.top <= containerRect.top + 220 && rect.bottom > containerRect.top + 50) {
                        if (diff < minDistance) {
                            minDistance = diff
                            currentBest = file.id
                        }
                    }
                }
            })

            if (currentBest) {
                setActiveSection(currentBest)
            }
        }

        scrollContainer.addEventListener('scroll', handleScroll, { passive: true })

        return () => {
            observers.forEach((o) => o.disconnect())
            scrollContainer.removeEventListener('scroll', handleScroll)
        }
    }, [isLoading])

    return (
        <>
            <AnimatePresence>
                {isLoading && (
                    <PreLoader key="loader" onLoadingComplete={() => setIsLoading(false)} />
                )}
            </AnimatePresence>

            <div className="app-container">
                <GlobalBackground />
                <CommandPalette />
                <Header />

                <div className="app-body">
                    <ResizableSidebar
                        minWidth={200}
                        maxWidth={600}
                        defaultWidth={288}
                        activeSection={activeSection}
                    />

                    <main className="editor-main" style={{ background: 'transparent' }}>
                        <div className="grid-overlay grid-pattern" />

                        <TabBar activeSection={activeSection} />

                        <div className="main-content" style={{ backgroundColor: 'rgba(17, 24, 24, 0.4)' }}>
                            {children}
                        </div>

                        <ScrollToTop />
                    </main>
                </div>
            </div>
        </>
    )
}

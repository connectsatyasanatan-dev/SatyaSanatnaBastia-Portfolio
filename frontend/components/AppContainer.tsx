'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Header from '@/components/Header'
import ResizableSidebar from '@/components/ResizableSidebar'
import TabBar from '@/components/TabBar'
import GlobalBackground from '@/components/GlobalBackground'
import PreLoader from '@/components/PreLoader'
import ScrollToTop from '@/components/ScrollToTop'
import { SECTION_FILES } from '@/components/Sidebar'

interface AppContainerProps {
    children: React.ReactNode
}

export default function AppContainer({ children }: AppContainerProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [activeSection, setActiveSection] = useState<string>('hero')

    // Track which section is in viewport
    useEffect(() => {
        if (isLoading) return

        const observers: IntersectionObserver[] = []

        // Use a map to track intersection ratios
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
                    if (best && best[1] > 0) {
                        setActiveSection(best[0])
                    }
                },
                { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0], rootMargin: '-10% 0px -10% 0px' }
            )

            observer.observe(el)
            observers.push(observer)
        })

        return () => observers.forEach((o) => o.disconnect())
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

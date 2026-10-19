'use client'

import { X, ChevronRight } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { SECTION_FILES, SectionFile } from './Sidebar'

interface TabBarProps {
    activeSection: string
}

const TabBar = ({ activeSection }: TabBarProps) => {
    const [openTabs, setOpenTabs] = useState<string[]>(SECTION_FILES.map((f) => f.id))
    const tabContainerRef = useRef<HTMLDivElement>(null)

    const activeFile = SECTION_FILES.find((f) => f.id === activeSection) ?? SECTION_FILES[0]

    // Auto-scroll active tab into view
    useEffect(() => {
        const container = tabContainerRef.current
        if (!container) return
        const activeEl = container.querySelector('.tab-item.active') as HTMLElement
        if (!activeEl) return
        const { offsetLeft, offsetWidth } = activeEl
        const { scrollLeft, clientWidth } = container
        if (offsetLeft < scrollLeft) {
            container.scrollTo({ left: offsetLeft - 8, behavior: 'smooth' })
        } else if (offsetLeft + offsetWidth > scrollLeft + clientWidth) {
            container.scrollTo({ left: offsetLeft + offsetWidth - clientWidth + 8, behavior: 'smooth' })
        }
    }, [activeSection])

    function closeTab(e: React.MouseEvent, id: string) {
        e.stopPropagation()
        setOpenTabs((prev) => prev.filter((t) => t !== id))
    }

    function handleTabClick(file: SectionFile) {
        if (!openTabs.includes(file.id)) {
            setOpenTabs((prev) => [...prev, file.id])
        }
        const el = document.getElementById(file.sectionId)
        if (!el) return
        const container = document.querySelector('.main-content') as HTMLElement
        if (container) {
            const offset = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 16
            container.scrollTo({ top: offset, behavior: 'smooth' })
        } else {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    // Keyboard: arrow keys to move between tabs, Enter to navigate
    function handleTabKeyDown(e: React.KeyboardEvent, file: SectionFile, idx: number) {
        const tabs = SECTION_FILES.filter((f) => openTabs.includes(f.id))
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleTabClick(file)
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault()
            const next = tabs[idx + 1]
            if (next) {
                const el = tabContainerRef.current?.querySelectorAll('[role="tab"]')[idx + 1] as HTMLElement
                el?.focus()
            }
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault()
            const prev = tabs[idx - 1]
            if (prev) {
                const el = tabContainerRef.current?.querySelectorAll('[role="tab"]')[idx - 1] as HTMLElement
                el?.focus()
            }
        }
        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault()
            closeTab(e as any, file.id)
        }
    }

    const visibleTabs = SECTION_FILES.filter((f) => openTabs.includes(f.id))

    return (
        <div id="portfolio-tabbar">
            {/* Tab bar */}
            <div
                className="tab-container"
                ref={tabContainerRef}
                role="tablist"
                aria-label="Portfolio sections"
            >
                {visibleTabs.map((file, idx) => {
                    const isActive = file.id === activeSection
                    return (
                        <div
                            key={file.id}
                            role="tab"
                            tabIndex={isActive ? 0 : -1}
                            aria-selected={isActive}
                            aria-label={file.filename}
                            className={`tab-item${isActive ? ' active' : ''}`}
                            onClick={() => handleTabClick(file)}
                            onKeyDown={(e) => handleTabKeyDown(e, file, idx)}
                            title={file.filename}
                        >
                            <span
                                className="tab-icon"
                                style={{ color: file.color, fontSize: '11px', fontWeight: 700, fontFamily: 'monospace' }}
                            >
                                .{file.icon}
                            </span>
                            <span className="tab-name">{file.filename}</span>
                            <X
                                className="tab-close"
                                aria-label={`Close ${file.filename}`}
                                onClick={(e) => closeTab(e, file.id)}
                            />
                        </div>
                    )
                })}

                {/* Closed tabs - ghost pills to reopen */}
                {SECTION_FILES.filter((f) => !openTabs.includes(f.id)).map((file) => (
                    <div
                        key={`closed-${file.id}`}
                        role="tab"
                        tabIndex={0}
                        aria-selected={false}
                        aria-label={`Reopen ${file.filename}`}
                        className="tab-item tab-closed"
                        onClick={() => handleTabClick(file)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTabClick(file) }}
                        title={`Reopen ${file.filename}`}
                    >
                        <span className="tab-icon" style={{ color: '#4b5563', fontSize: '11px', fontWeight: 700, fontFamily: 'monospace' }}>
                            .{file.icon}
                        </span>
                        <span className="tab-name" style={{ color: '#4b5563' }}>{file.filename}</span>
                    </div>
                ))}
            </div>

            {/* Breadcrumb */}
            <div className="breadcrumb" aria-label="File path">
                <div className="breadcrumb-path">
                    <span>Satya's Portfolio</span>
                    <ChevronRight aria-hidden />
                    <span>src</span>
                    <ChevronRight aria-hidden />
                    <span>sections</span>
                    <ChevronRight aria-hidden />
                    <span className="current-file">
                        <span className="file-icon" style={{ color: activeFile.color, fontSize: '11px', fontWeight: 700, fontFamily: 'monospace' }}>
                            .{activeFile.icon}
                        </span>
                        {activeFile.filename}
                    </span>
                </div>
                <div className="breadcrumb-info" aria-hidden>
                    <span>Ln 1, Col 1</span>
                    <span>UTF-8</span>
                    <span>TypeScript</span>
                </div>
            </div>
        </div>
    )
}

export default TabBar

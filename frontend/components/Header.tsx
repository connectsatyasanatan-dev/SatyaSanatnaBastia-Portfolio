'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Settings, Bell, Menu, X, Search, Palette, Shield } from 'lucide-react'
import { openCommandPalette } from '@/components/CommandPalette'

const languageSequences = [
    {
        text: "Satya Sanatan's Portfolio",
        lang: 'en',
        fontFamily: 'var(--font-display)',
    },
    {
        text: 'सत्य सनातनस्य कृतिसञ्चिका',
        lang: 'sa',
        fontFamily: '"Noto Serif Devanagari", serif',
    },
    {
        text: 'ସତ୍ୟ ସନାତନଙ୍କ କୃତି ସଂଚିକା',
        lang: 'or',
        fontFamily: '"Noto Sans Oriya", serif',
    },
]

const typingSpeed = 70

const Header = () => {
    const [seqIndex, setSeqIndex] = useState(0)
    const [displayText, setDisplayText] = useState('')
    const [phase, setPhase] = useState<'waiting-fonts' | 'typing' | 'waiting' | 'fading'>('waiting-fonts')

    const current = languageSequences[seqIndex]

    // Wait for fonts before starting typewriter - prevents FOUT
    useEffect(() => {
        if (typeof document === 'undefined') return
        const start = () => setPhase('typing')
        if (document.fonts?.ready) {
            document.fonts.ready.then(start)
        } else {
            // Fallback: small delay to let fonts load
            const t = setTimeout(start, 800)
            return () => clearTimeout(t)
        }
    }, [])

    useEffect(() => {
        if (phase === 'waiting-fonts') return

        let timeout: ReturnType<typeof setTimeout>
        let interval: ReturnType<typeof setInterval>

        if (phase === 'typing') {
            let idx = 0
            setDisplayText('')
            interval = setInterval(() => {
                idx++
                setDisplayText(current.text.slice(0, idx))
                if (idx >= current.text.length) {
                    clearInterval(interval)
                    setPhase('waiting')
                }
            }, typingSpeed)
        }

        if (phase === 'waiting') {
            timeout = setTimeout(() => {
                setPhase('fading')
            }, 4000) // Show fully typed text for 4 seconds
        }

        if (phase === 'fading') {
            timeout = setTimeout(() => {
                setSeqIndex((i) => (i + 1) % languageSequences.length)
                setPhase('typing')
            }, 600) // Fade out duration
        }

        return () => {
            clearInterval(interval)
            clearTimeout(timeout)
        }
    }, [phase, seqIndex])

    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // Sync menu state with app-body class to handle swipe gestures and overlay clicks properly
    useEffect(() => {
        const checkSidebarState = () => {
            const appBody = document.querySelector('.app-body')
            setIsMenuOpen(!!appBody?.classList.contains('mobile-sidebar-open'))
        }

        // Check initially in case it's already open
        checkSidebarState()

        const appBody = document.querySelector('.app-body')
        if (appBody) {
            const observer = new MutationObserver(checkSidebarState)
            observer.observe(appBody, { attributes: true, attributeFilter: ['class'] })
            return () => observer.disconnect()
        }
    }, [])

    const toggleSidebar = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation()
            e.nativeEvent.stopImmediatePropagation()
        }
        
        const appBody = document.querySelector('.app-body')
        if (appBody) {
            const isCurrentlyOpen = appBody.classList.contains('mobile-sidebar-open')
            if (isCurrentlyOpen) {
                appBody.classList.remove('mobile-sidebar-open')
            } else {
                appBody.classList.add('mobile-sidebar-open')
            }
        }
    }

    // Close sidebar when clicking overlay
    useEffect(() => {
        const handleOverlayClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const appBody = document.querySelector('.app-body')
            if (appBody?.classList.contains('mobile-sidebar-open')) {
                // Check if click is on overlay (not sidebar)
                const sidebar = document.querySelector('.resizable-sidebar-container')
                // Don't close if clicking the toggle button itself
                const toggleBtn = document.querySelector('.mobile-menu-btn')
                if (
                    sidebar && 
                    !sidebar.contains(target) && 
                    toggleBtn && 
                    !toggleBtn.contains(target)
                ) {
                    appBody.classList.remove('mobile-sidebar-open')
                }
            }
        }

        document.addEventListener('click', handleOverlayClick)
        return () => document.removeEventListener('click', handleOverlayClick)
    }, [])

    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const settingsRef = useRef<HTMLDivElement>(null)

    // Close settings dropdown on outside click or Escape key
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
                setIsSettingsOpen(false)
            }
        }
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsSettingsOpen(false)
            }
        }
        if (isSettingsOpen) {
            document.addEventListener('click', handleOutsideClick)
            document.addEventListener('keydown', handleKeyDown)
        }
        return () => {
            document.removeEventListener('click', handleOutsideClick)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isSettingsOpen])

    const handleRunBuild = () => {
        if (typeof window !== 'undefined') {
            const heroEl = document.getElementById('hero-section') || document.getElementById('hero')
            if (heroEl) {
                heroEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
            window.dispatchEvent(new CustomEvent('trigger-run-build'))
        }
    }

    return (
        <header id="portfolio-header">
            <div className="header-left">
                <button
                    className="mobile-menu-btn"
                    onClick={toggleSidebar}
                    aria-label="Toggle Sidebar"
                >
                    {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                {/* Title Container replaces hardcoded width/display */}
                <div className="header-title-container">
                    <AnimatePresence mode="wait">
                        <motion.h2
                            key={`header-title-${seqIndex}`}
                            className="header-title"
                            lang={current.lang}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: phase === 'fading' ? 0 : 1, y: phase === 'fading' ? -5 : 0 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            style={{ fontFamily: current.fontFamily }}
                        >
                            {displayText}
                        </motion.h2>
                    </AnimatePresence>

                    {/* Blinking cursor via CSS class */}
                    <motion.span
                        animate={{ opacity: phase === 'fading' ? 0 : [0, 1, 0] }}
                        transition={{ duration: 0.75, repeat: Infinity, ease: 'easeInOut' }}
                        className="header-cursor"
                    />
                </div>

                <div className="header-nav">
                    <a href="#" onClick={(e) => { e.preventDefault(); openCommandPalette(); }}>File</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); openCommandPalette(); }}>Edit</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); openCommandPalette(); }}>View</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleRunBuild(); }}>Run</a>
                </div>
            </div>

            {/* VS Code Command Center Search Pill - Centered in middle */}
            <button
                type="button"
                className="vscode-search-pill"
                onClick={() => openCommandPalette()}
                title="Search files, sections, and commands (Ctrl+P / Cmd+K)"
                aria-label="Open Command Palette"
            >
                <div className="search-inner">
                    <Search className="search-icon" />
                    <span className="search-text">satya-portfolio - Search files & commands</span>
                </div>
                <kbd className="search-kbd">Ctrl+P</kbd>
            </button>

            <div className="header-right">
                <div
                    className="run-build-btn"
                    onClick={handleRunBuild}
                    title="Execute Code / Run Build"
                >
                    <Play className="play-icon" />
                    <span className="btn-text-full">Run Build</span>
                    <span className="btn-text-short">Run</span>
                </div>
                <div className="header-buttons">
                    <button
                        type="button"
                        className="header-btn mobile-search-btn"
                        title="Search & Commands (Ctrl+P)"
                        onClick={() => openCommandPalette()}
                        aria-label="Search Commands"
                    >
                        <Search />
                    </button>
                    <button
                        type="button"
                        className="header-btn header-theme-btn"
                        title="Change Theme (Dracula, Tokyo Night, One Dark, Cyberpunk)"
                        onClick={() => openCommandPalette('theme')}
                        aria-label="Change Theme"
                    >
                        <Palette />
                    </button>

                    {/* Settings Dropdown Container */}
                    <div className="header-settings-container" ref={settingsRef}>
                        <button
                            type="button"
                            className={`header-btn header-settings-btn ${isSettingsOpen ? 'header-btn--active' : ''}`}
                            title="Settings & Quick Menu"
                            onClick={(e) => {
                                e.stopPropagation()
                                setIsSettingsOpen(prev => !prev)
                            }}
                            aria-label="Settings & Menu"
                            aria-expanded={isSettingsOpen}
                        >
                            <Settings />
                        </button>

                        <AnimatePresence>
                            {isSettingsOpen && (
                                <motion.div
                                    className="header-settings-dropdown"
                                    initial={{ opacity: 0, y: -6, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                >
                                    <div className="settings-dropdown-header">Quick Menu</div>

                                    <button
                                        type="button"
                                        className="settings-dropdown-item"
                                        onClick={() => {
                                            handleRunBuild()
                                            setIsSettingsOpen(false)
                                        }}
                                    >
                                        <Play className="settings-item-icon text-cyan" />
                                        <div className="settings-item-text">
                                            <span className="settings-item-label">Run Build</span>
                                            <span className="settings-item-hint">Execute code in digital workspace</span>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        className="settings-dropdown-item"
                                        onClick={() => {
                                            openCommandPalette()
                                            setIsSettingsOpen(false)
                                        }}
                                    >
                                        <Search className="settings-item-icon" />
                                        <div className="settings-item-text">
                                            <span className="settings-item-label">Search & Commands</span>
                                            <span className="settings-item-hint">Files, symbols & pages</span>
                                        </div>
                                        <span className="settings-item-badge">Ctrl+P</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="settings-dropdown-item"
                                        onClick={() => {
                                            openCommandPalette('theme')
                                            setIsSettingsOpen(false)
                                        }}
                                    >
                                        <Palette className="settings-item-icon" />
                                        <div className="settings-item-text">
                                            <span className="settings-item-label">Change Theme</span>
                                            <span className="settings-item-hint">Dracula, Cyberpunk, Tokyo</span>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        className="settings-dropdown-item"
                                        onClick={() => {
                                            setIsSettingsOpen(false)
                                        }}
                                    >
                                        <Bell className="settings-item-icon" />
                                        <div className="settings-item-text">
                                            <span className="settings-item-label">Notifications</span>
                                            <span className="settings-item-hint">System is up-to-date</span>
                                        </div>
                                    </button>

                                    
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        type="button"
                        className="header-btn header-bell-btn"
                        title="Notifications"
                        aria-label="Notifications"
                    >
                        <Bell />
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
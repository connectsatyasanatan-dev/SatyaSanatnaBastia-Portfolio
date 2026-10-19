'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, FileCode, FileText, Terminal, Palette,
    Download, Linkedin, Github, Mail, Sparkles, X, ChevronRight
} from 'lucide-react'
import { SECTION_FILES } from './Sidebar'
import { applyTheme, THEME_OPTIONS, VSCodeTheme } from '@/lib/theme'

interface PaletteItem {
    id: string
    title: string
    subtitle: string
    category: 'file' | 'action' | 'theme'
    icon: React.ElementType
    color?: string
    action: () => void
}

export const openCommandPalette = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open_command_palette'))
    }
}

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    // Listen for global shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'p' || e.key.toLowerCase() === 'k')) {
                e.preventDefault()
                setIsOpen(prev => !prev)
            } else if (e.key === 'Escape' && isOpen) {
                e.preventDefault()
                setIsOpen(false)
            }
        }

        const handleCustomOpen = () => {
            setIsOpen(true)
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('open_command_palette', handleCustomOpen)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('open_command_palette', handleCustomOpen)
        }
    }, [isOpen])

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setQuery('')
            setSelectedIndex(0)
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [isOpen])

    const navigateToSection = (sectionId: string) => {
        setIsOpen(false)
        const el = document.getElementById(sectionId)
        if (!el) return
        const container = document.querySelector('.main-content') as HTMLElement
        if (container) {
            const offset = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 16
            container.scrollTo({ top: offset, behavior: 'smooth' })
        } else {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    const items: PaletteItem[] = [
        // Files
        ...SECTION_FILES.map(file => ({
            id: `file-${file.id}`,
            title: file.filename,
            subtitle: `Jump to ${file.id} section`,
            category: 'file' as const,
            icon: file.filename.endsWith('.tsx') || file.filename.endsWith('.ts') ? FileCode : FileText,
            color: file.filename.endsWith('.tsx') ? '#06f9f9' : file.filename.endsWith('.ts') ? '#3b82f6' : '#eab308',
            action: () => navigateToSection(file.sectionId)
        })),

        // Quick Actions
        {
            id: 'action-resume',
            title: 'Download Resume (PDF)',
            subtitle: 'Get Satya Sanatan\'s full curriculum vitae',
            category: 'action',
            icon: Download,
            color: '#22c55e',
            action: () => {
                setIsOpen(false)
                const link = document.createElement('a')
                link.href = '/resume.pdf'
                link.download = "Satya Sanatan's Resume.pdf"
                link.click()
            }
        },
        {
            id: 'action-email',
            title: 'Compose Email',
            subtitle: 'Direct email to connectsatyasanatan@gmail.com',
            category: 'action',
            icon: Mail,
            color: '#06f9f9',
            action: () => {
                setIsOpen(false)
                window.open('mailto:connectsatyasanatan@gmail.com', '_blank')
            }
        },
        {
            id: 'action-linkedin',
            title: 'Open LinkedIn Profile',
            subtitle: 'View professional recommendations and network',
            category: 'action',
            icon: Linkedin,
            color: '#60a5fa',
            action: () => {
                setIsOpen(false)
                window.open('https://linkedin.com/in/satya-sanatan', '_blank', 'noopener,noreferrer')
            }
        },
        {
            id: 'action-github',
            title: 'Open GitHub Profile',
            subtitle: 'Browse open-source repositories and code history',
            category: 'action',
            icon: Github,
            color: '#ffffff',
            action: () => {
                setIsOpen(false)
                window.open('https://github.com/connectsatyasanatan', '_blank', 'noopener,noreferrer')
            }
        },
        {
            id: 'action-ai',
            title: 'Chat with Zentara AI Representative',
            subtitle: 'Ask questions about experience, projects, or background',
            category: 'action',
            icon: Sparkles,
            color: '#ff00ff',
            action: () => {
                setIsOpen(false)
                const chatFab = document.querySelector('.cb-fab') as HTMLElement
                chatFab?.click()
            }
        },

        // Themes
        ...THEME_OPTIONS.map(theme => ({
            id: `theme-${theme.id}`,
            title: `Theme: ${theme.name}`,
            subtitle: `Switch IDE appearance to ${theme.name}`,
            category: 'theme' as const,
            icon: Palette,
            color: theme.color,
            action: () => {
                setIsOpen(false)
                applyTheme(theme.id)
            }
        }))
    ]

    const filteredItems = items.filter(item => {
        if (!query.trim()) return true
        const q = query.toLowerCase()
        return item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
    })

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(prev => (prev + 1) % filteredItems.length)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length)
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (filteredItems[selectedIndex]) {
                filteredItems[selectedIndex].action()
            }
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 100000,
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        padding: 'clamp(30px, 8vh, 80px) 12px 20px',
                    }}
                    onClick={() => setIsOpen(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -20 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        style={{
                            width: '100%',
                            maxWidth: '620px',
                            background: 'var(--sidebar-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(6, 249, 249, 0.15)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Search Input Bar */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px 18px',
                                borderBottom: '1px solid var(--border-color)',
                                background: 'var(--editor-bg)'
                            }}
                        >
                            <Search size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={e => {
                                    setQuery(e.target.value)
                                    setSelectedIndex(0)
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a file name, command, or theme (e.g. index, resume, dracula)..."
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: 'white',
                                    fontSize: 'var(--text-base)',
                                    fontFamily: 'var(--font-mono)'
                                }}
                            />
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-dim)',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Results List */}
                        <div
                            ref={listRef}
                            style={{
                                maxHeight: 'min(380px, 60vh)',
                                overflowY: 'auto',
                                padding: '8px'
                            }}
                        >
                            {filteredItems.length === 0 ? (
                                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>
                                    No commands or files matching "{query}"
                                </div>
                            ) : (
                                filteredItems.map((item, idx) => {
                                    const isSelected = idx === selectedIndex
                                    const Icon = item.icon
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => item.action()}
                                            onMouseEnter={() => setSelectedIndex(idx)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '10px 14px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                background: isSelected ? 'var(--hover-bg)' : 'transparent',
                                                border: isSelected ? '1px solid rgba(var(--primary-rgb), 0.3)' : '1px solid transparent',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '6px',
                                                        background: 'rgba(255, 255, 255, 0.05)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: item.color || 'var(--primary)',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    <Icon size={16} />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                                    <span style={{ color: isSelected ? 'var(--primary)' : 'white', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                                                        {item.title}
                                                    </span>
                                                    <span style={{ color: 'var(--text-dim)', fontSize: 'var(--text-xs)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {item.subtitle}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                                <span
                                                    style={{
                                                        fontSize: 'var(--text-2xs)',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        background: 'rgba(255, 255, 255, 0.06)',
                                                        color: 'var(--text-dim)',
                                                        textTransform: 'uppercase',
                                                        fontFamily: 'var(--font-mono)'
                                                    }}
                                                >
                                                    {item.category}
                                                </span>
                                                <ChevronRight size={14} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-dim)' }} />
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* Footer Shortcuts Info */}
                        <div
                            style={{
                                padding: '8px 16px',
                                background: 'var(--editor-bg)',
                                borderTop: '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: 'var(--text-2xs)',
                                color: 'var(--text-dim)',
                                fontFamily: 'var(--font-mono)'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <span><strong style={{ color: 'white' }}>↑↓</strong> Navigate</span>
                                <span><strong style={{ color: 'white' }}>Enter</strong> Select</span>
                                <span><strong style={{ color: 'white' }}>Esc</strong> Close</span>
                            </div>
                            <span style={{ color: 'var(--primary)' }}>VS Code Command Center</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

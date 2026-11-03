'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Sparkles, Save, Eye, RefreshCw, AlertCircle,
    Calendar, ShieldCheck, CheckCircle2, ExternalLink
} from 'lucide-react'
import adminApiClient from '@/lib/admin-api'
import { toast } from '@/lib/toast'

interface FestivalOption {
    id: string
    name: string
    icon: string
    tagline: string
    season: string
    features: string[]
    accentColor: string
    glowColor: string
    sampleColors: string[]
}

const FESTIVAL_CATALOG: FestivalOption[] = [
    {
        id: 'diwali',
        name: 'Diwali Festival of Lights',
        icon: '🪔',
        tagline: 'Warm golden fairy-lights, flickering corner diyas, ambient background embers & celebratory bursts',
        season: 'October – November',
        features: ['Top Hanging Fairy Lights', 'Corner Diyas with Click Sparkles', 'Deep Golden Floating Embers', 'Footer Terracotta Diyas', 'PreLoader Fireworks Burst'],
        accentColor: '#ff9933',
        glowColor: 'rgba(255, 153, 51, 0.25)',
        sampleColors: ['#ff9933', '#ffd166', '#ec407a', '#06f9f9', '#ffb703'],
    },
    {
        id: 'newyear',
        name: 'New Year Celebration',
        icon: '✨',
        tagline: 'Celebratory champagne confetti particles, radiant trim, and celebratory greeting banner',
        season: 'Late December – January',
        features: ['Celebration Golden Confetti', 'Champagne Shimmer Trim', 'Year-End Greeting Banner'],
        accentColor: '#ffd166',
        glowColor: 'rgba(255, 209, 102, 0.25)',
        sampleColors: ['#ffd166', '#ffb703', '#ffffff', '#e0e7ff'],
    },
    {
        id: 'christmas',
        name: 'Christmas & Winter Holiday',
        icon: '🎄',
        tagline: 'Soft falling snowflake particles, winter holiday trim, and gentle holiday spirit accents',
        season: 'December',
        features: ['Gentle Snowfall Particles', 'Holiday Pine Garland Trim', 'Subtle Mistletoe Accent'],
        accentColor: '#22c55e',
        glowColor: 'rgba(34, 197, 94, 0.25)',
        sampleColors: ['#22c55e', '#ef4444', '#ffffff', '#86efac'],
    },
    {
        id: 'holi',
        name: 'Holi Festival of Colors',
        icon: '🎨',
        tagline: 'Vibrant color powder dust particles, multi-gradient trim, and radiant spring palette',
        season: 'March',
        features: ['Color Splash Particle Aura', 'Radiant Multi-Gradient Trim', 'Festive Spring Greeting'],
        accentColor: '#ec4899',
        glowColor: 'rgba(236, 72, 153, 0.25)',
        sampleColors: ['#ec4899', '#a855f7', '#06f9f9', '#f59e0b'],
    },
    {
        id: 'none',
        name: 'Standard (Clean Developer Mode)',
        icon: '⚪',
        tagline: 'Clean, distraction-free default VS Code cyberpunk developer portfolio with zero festive overlays',
        season: 'Year-Round Default',
        features: ['Zero festive overlays', '100% standard IDE theme', 'Cleanest initial paint'],
        accentColor: '#64748b',
        glowColor: 'rgba(100, 116, 139, 0.15)',
        sampleColors: ['#64748b', '#475569', '#334155'],
    },
]

export default function FestiveThemeTab() {
    const [selectedFestival, setSelectedFestival] = useState<string>('diwali')
    const [isEnabled, setIsEnabled] = useState<boolean>(true)

    // Baseline persisted state to detect unsaved changes
    const [savedFestival, setSavedFestival] = useState<string>('diwali')
    const [savedEnabled, setSavedEnabled] = useState<boolean>(true)

    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [lastSaved, setLastSaved] = useState<string>('')

    // Fetch current settings on mount
    useEffect(() => {
        const loadSettings = async () => {
            setIsLoading(true)
            try {
                const res = await adminApiClient.getFestiveTheme()
                if (res?.data) {
                    let fest = res.data.activeFestival || 'diwali'
                    let enabled = Boolean(res.data.enabled)
                    if (fest === 'none') enabled = false
                    if (enabled && fest === 'none') fest = 'diwali'
                    setSelectedFestival(fest)
                    setIsEnabled(enabled)
                    setSavedFestival(fest)
                    setSavedEnabled(enabled)
                    if (res.data.updatedAt) {
                        setLastSaved(new Date(res.data.updatedAt * 1000).toLocaleTimeString())
                    }
                    return
                }
            } catch {
                // Fall back to localStorage if available
                try {
                    const cached = localStorage.getItem('portfolio_festive_theme')
                    if (cached) {
                        const parsed = JSON.parse(cached)
                        let fest = parsed.activeFestival || 'diwali'
                        let enabled = Boolean(parsed.enabled)
                        if (fest === 'none') enabled = false
                        if (enabled && fest === 'none') fest = 'diwali'
                        setSelectedFestival(fest)
                        setIsEnabled(enabled)
                        setSavedFestival(fest)
                        setSavedEnabled(enabled)
                    }
                } catch {}
            } finally {
                setIsLoading(false)
            }
        }
        loadSettings()
    }, [])

    // State helper: is festive truly active on public site?
    const isPublicFestiveActive = isEnabled && selectedFestival !== 'none'
    const isDirty = selectedFestival !== savedFestival || isEnabled !== savedEnabled

    // Master Switch Toggle Handler
    const handleToggleMasterSwitch = () => {
        if (!isEnabled) {
            // Turning ON
            setIsEnabled(true)
            // If currently set to 'none', automatically switch to 'diwali'
            if (selectedFestival === 'none') {
                setSelectedFestival('diwali')
            }
        } else {
            // Turning OFF
            setIsEnabled(false)
        }
    }

    // Card Selection Handler
    const handleSelectFestival = (festivalId: string) => {
        setSelectedFestival(festivalId)
        if (festivalId === 'none') {
            setIsEnabled(false)
        } else {
            setIsEnabled(true)
        }
    }

    // Save & Publish Handler
    const handleSave = async () => {
        setIsSaving(true)
        try {
            const payload = {
                activeFestival: selectedFestival,
                enabled: isEnabled,
            }
            const res = await adminApiClient.updateFestiveTheme(payload)
            if (res.success) {
                toast.success('Festive theme updated and published live! 🚀')
                setSavedFestival(selectedFestival)
                setSavedEnabled(isEnabled)
                const nowStr = new Date().toLocaleTimeString()
                setLastSaved(nowStr)

                // Instant client broadcast for open portfolio tabs
                if (typeof window !== 'undefined') {
                    localStorage.setItem('portfolio_festive_theme', JSON.stringify(payload))
                    window.dispatchEvent(new CustomEvent('festive-theme-changed', { detail: payload }))
                }
            } else {
                toast.error(res.message || 'Failed to update festive theme')
            }
        } catch (err: any) {
            toast.error(err.message || 'Backend offline. Changes saved locally to client.')
            if (typeof window !== 'undefined') {
                const payload = { activeFestival: selectedFestival, enabled: isEnabled }
                localStorage.setItem('portfolio_festive_theme', JSON.stringify(payload))
                window.dispatchEvent(new CustomEvent('festive-theme-changed', { detail: payload }))
            }
            setSavedFestival(selectedFestival)
            setSavedEnabled(isEnabled)
        } finally {
            setIsSaving(false)
        }
    }

    const currentFest = FESTIVAL_CATALOG.find(f => f.id === selectedFestival) || FESTIVAL_CATALOG[0]

    return (
        <div className="festive-tab-wrap">
            {/* ── Executive Top Header Bar ── */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    paddingBottom: '20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                        style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(255, 179, 0, 0.16), rgba(255, 107, 26, 0.16))',
                            border: '1px solid rgba(255, 179, 0, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffb300',
                            boxShadow: '0 0 20px rgba(255, 179, 0, 0.2)',
                            flexShrink: 0,
                        }}
                    >
                        <Sparkles size={22} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
                            Festive & Seasonal Themes
                        </h2>
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '3px 0 0' }}>
                            Dynamically switch seasonal decorations and interactive overlays across your live portfolio.
                        </p>
                    </div>
                </div>

                {/* Top Action Buttons (Compact horizontal group) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <a
                        href="/"
                        target="_blank"
                        rel="noreferrer"
                        className="admin-btn admin-btn-gray"
                        title="Open public portfolio to see changes live"
                    >
                        <Eye size={15} />
                        <span>Preview Live Site</span>
                        <ExternalLink size={12} style={{ opacity: 0.6 }} />
                    </a>
                    <button
                        type="button"
                        className="admin-btn admin-btn-blue"
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        style={{ minWidth: '160px' }}
                    >
                        {isSaving ? <RefreshCw size={15} className="admin-spin" /> : <Save size={15} />}
                        <span>{isSaving ? 'Publishing...' : 'Save & Publish'}</span>
                    </button>
                </div>
            </div>

            {/* ── Unsaved Changes Alert Bar ── */}
            <AnimatePresence>
                {isDirty && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="festive-unsaved-alert"
                    >
                        <div className="festive-unsaved-left">
                            <span className="festive-unsaved-dot" />
                            <span>
                                <strong>Unsaved Changes:</strong> You selected <strong>{currentFest.name}</strong> ({isEnabled ? 'Active' : 'Paused'}). Click &ldquo;Save &amp; Publish&rdquo; to apply to public visitors.
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="admin-btn admin-btn-blue"
                            style={{ padding: '6px 14px', fontSize: '12px' }}
                        >
                            <Save size={13} /> Save Now
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Master Status Banner (Obsidian Glass Card) ── */}
            <div className="festive-status-banner">
                <div className="festive-status-left">
                    <div className="festive-beacon-wrap">
                        <span className={`festive-beacon-core ${isPublicFestiveActive ? 'live' : 'off'}`} />
                        {isPublicFestiveActive && <span className="festive-beacon-ping" />}
                    </div>

                    <div>
                        <div className="festive-status-title-row">
                            <h3 className="festive-status-heading">
                                {isPublicFestiveActive ? (
                                    <>
                                        <span>{currentFest.icon} {currentFest.name}</span>
                                    </>
                                ) : (
                                    <>Festive Display Disabled</>
                                )}
                            </h3>

                            {isPublicFestiveActive ? (
                                <span className="festive-pill-tag live">
                                    <CheckCircle2 size={12} /> Live on Portfolio
                                </span>
                            ) : (
                                <span className="festive-pill-tag off">
                                    Standard Theme Active
                                </span>
                            )}
                        </div>

                        <p className="festive-status-desc">
                            {isPublicFestiveActive
                                ? `Visitors currently see ${currentFest.name} decorations: ${currentFest.features.join(', ')}.`
                                : 'Portfolio is currently running in clean, distraction-free standard developer mode with zero festive overlays.'}
                        </p>

                        <div className="festive-status-meta">
                            {lastSaved && <span>Last published: {lastSaved}</span>}
                            <span>·</span>
                            <span>Client Cache: Synchronized</span>
                        </div>
                    </div>
                </div>

                {/* Master Switch Toggle */}
                <div className="festive-toggle-box">
                    <div className="festive-toggle-label-wrap">
                        <span style={{ color: '#64748b' }}>FESTIVE DISPLAY:</span>
                        <span className={`festive-toggle-state-text ${isEnabled ? 'active' : 'paused'}`}>
                            {isEnabled ? 'ACTIVE (ON)' : 'PAUSED (OFF)'}
                        </span>
                    </div>

                    <button
                        type="button"
                        role="switch"
                        aria-checked={isEnabled}
                        className={`festive-switch-button ${isEnabled ? 'on' : 'off'}`}
                        onClick={handleToggleMasterSwitch}
                        title={isEnabled ? 'Click to pause festive display' : 'Click to activate festive display'}
                    >
                        <span className="festive-switch-handle" />
                    </button>
                </div>
            </div>

            {/* ── Festival Catalog Cards Grid ── */}
            <div>
                <div className="festive-section-header-block">
                    <h3 className="festive-section-title-text">Select Active Celebration</h3>
                    <p className="festive-section-subtitle-text">
                        Click on any festival below to switch themes. Changes take effect on the live site when published.
                    </p>
                </div>

                <div className="festive-cards-grid">
                    {FESTIVAL_CATALOG.map((fest) => {
                        const isSelected = selectedFestival === fest.id
                        return (
                            <div
                                key={fest.id}
                                className={`festive-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleSelectFestival(fest.id)}
                                role="button"
                                tabIndex={0}
                                style={{
                                    ['--card-accent' as string]: fest.accentColor,
                                    ['--card-glow' as string]: fest.glowColor,
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        handleSelectFestival(fest.id)
                                    }
                                }}
                            >
                                <div className="festive-card-top">
                                    <div
                                        className="festive-card-icon-box"
                                        style={{ borderColor: isSelected ? fest.accentColor : 'rgba(255,255,255,0.1)' }}
                                    >
                                        <span>{fest.icon}</span>
                                    </div>

                                    <div className="festive-card-meta">
                                        <div className="festive-card-season-tag">
                                            <Calendar size={11} />
                                            <span>{fest.season}</span>
                                        </div>
                                        <h4 className="festive-card-title">{fest.name}</h4>
                                    </div>

                                    <span className={`festive-radio-badge ${isSelected ? 'active' : 'inactive'}`}>
                                        {isSelected ? (isEnabled ? 'ACTIVE' : 'SELECTED') : 'SELECT'}
                                    </span>
                                </div>

                                <p className="festive-card-tagline">{fest.tagline}</p>

                                <div className="festive-features-wrap">
                                    {fest.features.map((feat, idx) => (
                                        <span key={idx} className="festive-feature-chip">
                                            ✓ {feat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ── Architecture & Safety Assurance Card ── */}
            <div className="festive-safeguard-box">
                <ShieldCheck size={20} className="festive-safeguard-icon" />
                <div>
                    <h4 className="festive-safeguard-title">Zero-Error & Hydration-Safe Architecture</h4>
                    <p className="festive-safeguard-desc">
                        All festive decorations are client-hydrated after DOM mount. Theme settings are synced between the backend database and local cache.
                        Even if the backend server is temporarily sleeping, the portfolio operates cleanly with zero console errors, zero layout shifts, and zero performance slowdowns.
                    </p>
                </div>
            </div>
        </div>
    )
}

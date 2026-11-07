'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Save, RefreshCw, CheckCircle2, AlertCircle,
    Layers, SlidersHorizontal, ShieldCheck, Terminal,
    Briefcase, GraduationCap, Award, FolderGit2,
    MessageSquare, BookOpen, Send, User, RotateCcw,
    Eye, ExternalLink
} from 'lucide-react'
import adminApiClient from '@/lib/admin-api'
import { toast } from '@/lib/toast'
import {
    SectionId,
    SECTION_ORDER,
    DEFAULT_SECTION_VISIBILITY,
    updateSharedVisibility
} from '@/hooks/useSectionVisibility'

interface SectionMeta {
    id: SectionId
    title: string
    filename: string
    ext: string
    color: string
    icon: React.ElementType
    description: string
    defaultCategory: string
}

const SECTION_CATALOG: SectionMeta[] = [
    {
        id: 'hero',
        title: 'Hero / Introduction',
        filename: 'index.tsx',
        ext: 'tsx',
        color: '#61dafb',
        icon: User,
        description: 'Landing introduction, animated name, roles, quick action buttons, and social links.',
        defaultCategory: 'Core'
    },
    {
        id: 'skills',
        title: 'Technical Skills & Tools',
        filename: 'skills.ts',
        ext: 'ts',
        color: '#3178c6',
        icon: SlidersHorizontal,
        description: 'Categorized skillset cards (Frontend, Backend, Database, Cloud/DevOps, Tools) with proficiency.',
        defaultCategory: 'Core'
    },
    {
        id: 'experience',
        title: 'Work Experience (Git History)',
        filename: 'git-history.log',
        ext: 'log',
        color: '#f97316',
        icon: Briefcase,
        description: 'Git commit log formatted career journey, roles, achievements, and tech stacks.',
        defaultCategory: 'Career'
    },
    {
        id: 'education',
        title: 'Education & Academics',
        filename: 'education.md',
        ext: 'md',
        color: '#a78bfa',
        icon: GraduationCap,
        description: 'Academic degrees, university details, grades, and coursework highlights.',
        defaultCategory: 'Career'
    },
    {
        id: 'certifications',
        title: 'Certifications & Credentials',
        filename: 'certifications.json',
        ext: 'json',
        color: '#22c55e',
        icon: Award,
        description: 'Verified professional certifications, issuing organizations, and credential links.',
        defaultCategory: 'Career'
    },
    {
        id: 'projects',
        title: 'Projects Showcase',
        filename: 'projects.sh',
        ext: 'sh',
        color: '#f59e0b',
        icon: FolderGit2,
        description: 'Portfolio projects with live demos, GitHub links, tech tags, and performance metrics.',
        defaultCategory: 'Projects'
    },
    {
        id: 'testimonials',
        title: 'Recommendations & Testimonials',
        filename: 'testimonials.md',
        ext: 'md',
        color: '#a78bfa',
        icon: MessageSquare,
        description: 'Client and mentor recommendations, quotes, roles, and avatar cards.',
        defaultCategory: 'Engagement'
    },
    {
        id: 'blog',
        title: 'Technical Blog & Articles',
        filename: 'blog.md',
        ext: 'md',
        color: '#a78bfa',
        icon: BookOpen,
        description: 'Technical articles, publication cards, reading times, and markdown articles.',
        defaultCategory: 'Engagement'
    },
    {
        id: 'terminal',
        title: 'Interactive Developer Terminal',
        filename: 'terminal.sh',
        ext: 'sh',
        color: '#f59e0b',
        icon: Terminal,
        description: 'Embedded Linux terminal simulator with custom commands, themes, and Easter eggs.',
        defaultCategory: 'Interactive'
    },
    {
        id: 'contact',
        title: 'Contact & Hire Form',
        filename: 'contact.json',
        ext: 'json',
        color: '#22c55e',
        icon: Send,
        description: 'Direct contact messaging form, email link, socials, and availability status.',
        defaultCategory: 'Engagement'
    },
]

export default function SectionVisibilityTab() {
    const [visibility, setVisibility] = useState<Record<string, boolean>>({ ...DEFAULT_SECTION_VISIBILITY })
    const [initialVisibility, setInitialVisibility] = useState<Record<string, boolean>>({ ...DEFAULT_SECTION_VISIBILITY })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [lastSavedTime, setLastSavedTime] = useState<string | null>(null)

    const fetchVisibility = async () => {
        setLoading(true)
        try {
            const res = await adminApiClient.getSectionVisibility()
            if (res && res.visibility) {
                setVisibility(res.visibility)
                setInitialVisibility(res.visibility)
            }
        } catch (error: any) {
            console.error('Failed to fetch section visibility:', error)
            toast.error(error.message || 'Failed to load section visibility')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchVisibility()
    }, [])

    const toggleSection = (id: string) => {
        setVisibility((prev) => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const setAllSections = (enabled: boolean) => {
        const next: Record<string, boolean> = {}
        SECTION_ORDER.forEach((id) => {
            next[id] = enabled
        })
        setVisibility(next)
    }

    const setPresetMinimal = () => {
        const next: Record<string, boolean> = {
            hero: true,
            skills: true,
            experience: true,
            education: false,
            certifications: false,
            projects: true,
            testimonials: false,
            blog: false,
            terminal: false,
            contact: true,
        }
        setVisibility(next)
    }

    const resetToDefaults = () => {
        setVisibility({ ...DEFAULT_SECTION_VISIBILITY })
    }

    const hasChanges = JSON.stringify(visibility) !== JSON.stringify(initialVisibility)
    const visibleCount = Object.values(visibility).filter(Boolean).length
    const totalCount = SECTION_ORDER.length

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await adminApiClient.updateSectionVisibility(visibility)
            if (res.success) {
                setInitialVisibility(res.visibility || visibility)
                setLastSavedTime(new Date().toLocaleTimeString())
                // Broadcast live update instantly across the current client session
                updateSharedVisibility(res.visibility || visibility, true, true)
                toast.success('Section visibility saved and applied live!')
            } else {
                toast.error(res.message || 'Failed to update section visibility')
            }
        } catch (error: any) {
            console.error('Failed to save section visibility:', error)
            toast.error(error.message || 'Error saving section visibility')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '16px' }}>
                <RefreshCw size={28} className="admin-spin" style={{ color: '#06f9f9' }} />
                <p style={{ fontSize: '14px', color: '#94a3b8' }}>Loading section visibility settings...</p>
            </div>
        )
    }

    return (
        <div className="secvis-tab-wrap">
            {/* ── Top Header Bar ── */}
            <div className="secvis-header-bar">
                <div className="secvis-header-left">
                    <div className="secvis-header-icon-box">
                        <Layers size={22} />
                    </div>
                    <div>
                        <h2 className="secvis-header-title">
                            Section Visibility Control
                        </h2>
                        <p className="secvis-header-desc">
                            Select which portfolio sections appear on your live site. Disabled sections are completely hidden from the main view, TabBar, Sidebar explorer tree, and Command Palette.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        type="button"
                        onClick={fetchVisibility}
                        disabled={loading || saving}
                        className="admin-btn admin-btn-gray"
                        title="Reload latest state from database"
                    >
                        <RefreshCw size={14} className={loading ? 'admin-spin' : ''} />
                        <span>Sync</span>
                    </button>
                    <a
                        href="/"
                        target="_blank"
                        rel="noreferrer"
                        className="admin-btn admin-btn-gray"
                        title="Open live site in new tab"
                    >
                        <Eye size={14} />
                        <span>View Live</span>
                        <ExternalLink size={12} style={{ opacity: 0.6 }} />
                    </a>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                        className={`admin-btn ${hasChanges ? 'admin-btn-blue' : 'admin-btn-gray'}`}
                        style={{ minWidth: '150px' }}
                    >
                        {saving ? <RefreshCw size={14} className="admin-spin" /> : <Save size={14} />}
                        <span>{saving ? 'Publishing...' : hasChanges ? 'Save & Apply Live' : 'Saved'}</span>
                    </button>
                </div>
            </div>

            {/* ── Status Banner (Obsidian Glass Card) ── */}
            <div className="secvis-status-banner">
                <div className="secvis-status-left">
                    <div className="secvis-counter-badge">
                        <span className="secvis-counter-number">{visibleCount}/{totalCount}</span>
                        <span className="secvis-counter-label">Active</span>
                    </div>

                    <div className="secvis-status-info">
                        <h3 className="secvis-status-heading">
                            <span>{visibleCount === totalCount ? 'All Sections Active' : `${visibleCount} of ${totalCount} Sections Visible`}</span>
                            <span className="secvis-status-pill visible" style={{ fontSize: '11px' }}>
                                <CheckCircle2 size={12} /> Live Sync
                            </span>
                        </h3>
                        <p className="secvis-status-desc">
                            {visibleCount === totalCount
                                ? 'All 10 sections are enabled and visible across your portfolio.'
                                : `${totalCount - visibleCount} section(s) currently hidden with zero layout gap or glitch.`}
                        </p>
                        <div className="secvis-status-meta">
                            {lastSavedTime && <span>Last saved: {lastSavedTime}</span>}
                            <span>·</span>
                            <span>Universal mode: Live DB &amp; Fallback compatible</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Quick Presets Bar ── */}
            <div className="secvis-presets-bar">
                <div className="secvis-presets-group">
                    <span className="secvis-presets-label">Quick Presets:</span>
                    <button
                        type="button"
                        onClick={() => setAllSections(true)}
                        className="secvis-preset-btn"
                    >
                        Show All (10)
                    </button>
                    <button
                        type="button"
                        onClick={setPresetMinimal}
                        className="secvis-preset-btn"
                        style={{ color: '#06f9f9', borderColor: 'rgba(6, 249, 249, 0.3)' }}
                    >
                        Developer Minimal (5)
                    </button>
                    <button
                        type="button"
                        onClick={resetToDefaults}
                        className="secvis-preset-btn"
                    >
                        <RotateCcw size={12} />
                        Reset Default
                    </button>
                </div>

                {hasChanges && (
                    <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", display: "inline-block", marginRight: "5px" }} /> Unsaved changes pending
                    </span>
                )}
            </div>

            {/* ── Architecture Notice Box ── */}
            <div className="secvis-info-box">
                <ShieldCheck size={20} className="secvis-info-icon" />
                <div>
                    <strong style={{ color: '#38bdf8' }}>Universal Live Toggle: </strong>
                    Works whether section data is fetched live from PostgreSQL database or loaded from local fallback files. Changes apply immediately to public visitors with zero blank space and zero console errors.
                </div>
            </div>

            {/* ── Grid of 10 Sections ── */}
            <div className="secvis-grid">
                {SECTION_CATALOG.map((sec) => {
                    const isChecked = Boolean(visibility[sec.id])
                    const IconComponent = sec.icon

                    return (
                        <div
                            key={sec.id}
                            onClick={() => toggleSection(sec.id)}
                            className={`secvis-card ${isChecked ? 'active' : 'inactive'}`}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    toggleSection(sec.id)
                                }
                            }}
                        >
                            {/* Left Side: Icon + Details */}
                            <div className="secvis-card-left">
                                <div
                                    className="secvis-card-icon"
                                    style={{
                                        backgroundColor: isChecked ? `${sec.color}15` : 'rgba(255,255,255,0.03)',
                                        borderColor: isChecked ? `${sec.color}40` : 'rgba(255,255,255,0.06)',
                                        color: isChecked ? sec.color : '#64748b'
                                    }}
                                >
                                    <IconComponent size={20} />
                                </div>

                                <div className="secvis-card-body">
                                    <div className="secvis-card-title-row">
                                        <h4 className="secvis-card-title">{sec.title}</h4>
                                        <span
                                            className="secvis-file-badge"
                                            style={{
                                                color: sec.color,
                                                borderColor: `${sec.color}35`,
                                                backgroundColor: `${sec.color}10`
                                            }}
                                        >
                                            {sec.filename}
                                        </span>
                                    </div>
                                    <p className="secvis-card-desc">
                                        {sec.description}
                                    </p>
                                </div>
                            </div>

                            {/* Right Side: Status Badge + Switch */}
                            <div className="secvis-card-controls">
                                <span className={`secvis-status-pill ${isChecked ? 'visible' : 'hidden'}`}>
                                    {isChecked ? 'Visible' : 'Hidden'}
                                </span>

                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isChecked}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        toggleSection(sec.id)
                                    }}
                                    className={`secvis-toggle-switch ${isChecked ? 'on' : 'off'}`}
                                    title={isChecked ? 'Click to hide section' : 'Click to show section'}
                                >
                                    <span className="secvis-toggle-handle" />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* ── Sticky Unsaved Save Bar ── */}
            <AnimatePresence>
                {hasChanges && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="secvis-save-bar"
                    >
                        <div className="secvis-save-bar-text">
                            <AlertCircle size={18} style={{ color: '#06f9f9', flexShrink: 0 }} />
                            <span>You have unsaved visibility changes. Click &ldquo;Save &amp; Apply Live&rdquo; to publish.</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={() => setVisibility({ ...initialVisibility })}
                                disabled={saving}
                                className="admin-btn admin-btn-gray"
                            >
                                Discard
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="admin-btn admin-btn-blue"
                            >
                                {saving ? <RefreshCw size={14} className="admin-spin" /> : <Save size={14} />}
                                <span>{saving ? 'Publishing...' : 'Save & Apply Live'}</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

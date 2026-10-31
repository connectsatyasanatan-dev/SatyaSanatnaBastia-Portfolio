'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Award, Rocket, Target, Zap, Save, Plus, Trash2,
    BarChart3, Star, CheckCircle2, Coffee, Bug, Sparkles, Loader2
} from 'lucide-react'
import type { Achievements } from '@/lib/admin-types'

interface AchievementsTabProps {
    data: Achievements
    onUpdate: (category: string, data: unknown) => Promise<void>
}

const AchievementsTab = ({ data, onUpdate }: AchievementsTabProps) => {
    const [stats, setStats] = useState(data.stats)
    const [highlights, setHighlights] = useState(data.highlights)
    const [newHighlight, setNewHighlight] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [savingType, setSavingType] = useState<'stats' | 'highlights' | null>(null)

    useEffect(() => {
        setStats(data.stats)
        setHighlights(data.highlights)
    }, [data])

    const handleStatChange = (field: keyof typeof stats, value: string) => {
        setStats({
            ...stats,
            [field]: parseInt(value) || 0
        })
    }

    const handleSaveStats = async () => {
        setIsSaving(true)
        setSavingType('stats')
        try {
            await onUpdate('stats', stats)
        } finally {
            setIsSaving(false)
            setSavingType(null)
        }
    }

    const handleAddHighlight = () => {
        if (newHighlight.trim()) {
            const updated = [...highlights, newHighlight.trim()]
            setHighlights(updated)
            setNewHighlight('')
        }
    }

    const handleRemoveHighlight = (index: number) => {
        const updated = highlights.filter((_, i) => i !== index)
        setHighlights(updated)
    }

    const handleSaveHighlights = async () => {
        setIsSaving(true)
        setSavingType('highlights')
        try {
            await onUpdate('highlights', highlights)
        } finally {
            setIsSaving(false)
            setSavingType(null)
        }
    }

    const statFields = [
        { key: 'yearsOfExperience', label: 'Years of Experience', icon: Rocket, color: '#06f9f9', description: 'Total professional journey' },
        { key: 'projectsCompleted', label: 'Projects Delivered', icon: Target, color: '#3b82f6', description: 'Production deployments' },
        { key: 'codeCommits', label: 'Code Commits', icon: Zap, color: '#f59e0b', description: 'Version control activity' },
        { key: 'hackathonsWon', label: 'Hackathons Won', icon: Award, color: '#10b981', description: 'Competitive recognitions' },
        { key: 'clientsSatisfied', label: 'Clients Satisfied', icon: Star, color: '#a855f7', description: 'Happy partnerships' },
        { key: 'linesOfCode', label: 'Lines of Code', icon: BarChart3, color: '#ec4899', description: 'Approximate scope' },
        { key: 'bugsFixed', label: 'Bugs Resolved', icon: Bug, color: '#ef4444', description: 'Quality assurance' },
        { key: 'coffeeConsumed', label: 'Coffee Consumed', icon: Coffee, color: '#eab308', description: 'Developer fuel (cups)' },
    ]

    return (
        <div className="admin-achievements-container">
            {/* Header */}
            <div className="admin-section-header">
                <div className="admin-section-title-wrapper">
                    <div
                        className="admin-section-icon-badge"
                        style={{
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 179, 8, 0.15))',
                            color: '#fbbf24',
                            border: '1px solid rgba(245, 158, 11, 0.3)'
                        }}
                    >
                        <Award size={22} />
                    </div>
                    <div>
                        <h2 className="admin-section-title">Achievements &amp; Metrics</h2>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                            Numerical statistics and career milestones featured in your hero and about sections.
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleSaveStats}
                    disabled={isSaving}
                    className="admin-btn admin-btn-green"
                    style={{ minWidth: '160px' }}
                >
                    {savingType === 'stats' ? (
                        <>
                            <Loader2 className="animate-spin" size={16} />
                            Saving Metrics...
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            Save All Metrics
                        </>
                    )}
                </button>
            </div>

            {/* Metrics Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '20px',
                    marginBottom: '48px'
                }}
            >
                {statFields.map((field, index) => {
                    const Icon = field.icon
                    const val = stats[field.key as keyof typeof stats] ?? 0

                    return (
                        <motion.div
                            key={field.key}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className="admin-card"
                            style={{
                                padding: '22px',
                                position: 'relative',
                                overflow: 'hidden',
                                borderLeft: `3px solid ${field.color}`
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div
                                    style={{
                                        width: '42px',
                                        height: '42px',
                                        borderRadius: '12px',
                                        background: `${field.color}15`,
                                        border: `1px solid ${field.color}35`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: field.color
                                    }}
                                >
                                    <Icon size={20} />
                                </div>
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Live Stat
                                </span>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>
                                    {field.label}
                                </label>
                                <p style={{ margin: '0 0 14px', fontSize: '11.5px', color: '#64748b' }}>
                                    {field.description}
                                </p>
                            </div>

                            <div>
                                <input
                                    type="number"
                                    min="0"
                                    value={val}
                                    onChange={(e) => handleStatChange(field.key as keyof typeof stats, e.target.value)}
                                    className="admin-form-input"
                                    style={{
                                        fontSize: '22px',
                                        fontWeight: 700,
                                        fontFamily: 'monospace',
                                        padding: '10px 14px',
                                        color: '#ffffff',
                                        borderColor: `${field.color}30`
                                    }}
                                    placeholder="0"
                                />
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Highlights & Milestones Section */}
            <div className="admin-section-header" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '32px' }}>
                <div className="admin-section-title-wrapper">
                    <div
                        className="admin-section-icon-badge"
                        style={{
                            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.15))',
                            color: '#c084fc',
                            border: '1px solid rgba(168, 85, 247, 0.3)'
                        }}
                    >
                        <Sparkles size={22} />
                    </div>
                    <div>
                        <h2 className="admin-section-title">Key Career Milestones</h2>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                            Major honors, awards, hackathon recognitions, and standout achievements.
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleSaveHighlights}
                    disabled={isSaving}
                    className="admin-btn admin-btn-blue"
                    style={{ minWidth: '170px' }}
                >
                    {savingType === 'highlights' ? (
                        <>
                            <Loader2 className="animate-spin" size={16} />
                            Updating...
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            Save Milestones ({highlights.length})
                        </>
                    )}
                </button>
            </div>

            {/* Add Milestone Input Box */}
            <div
                className="admin-card"
                style={{
                    padding: '16px 20px',
                    marginBottom: '20px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
                }}
            >
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="e.g. 🏆 Built an AI full-stack app recognized in National Developer Summit"
                        value={newHighlight}
                        onChange={(e) => setNewHighlight(e.target.value)}
                        className="admin-form-input"
                        style={{ flex: '1 1 280px', minWidth: '240px' }}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddHighlight()}
                    />
                    <button
                        onClick={handleAddHighlight}
                        className="admin-btn admin-btn-green"
                        disabled={!newHighlight.trim()}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        <Plus size={16} />
                        Add Milestone
                    </button>
                </div>
            </div>

            {/* Highlights List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <AnimatePresence>
                    {highlights.map((highlight, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 15 }}
                            transition={{ delay: index * 0.02 }}
                            className="admin-card"
                            style={{
                                padding: '16px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '16px',
                                borderLeft: '3px solid #a855f7'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: 'rgba(16, 185, 129, 0.12)',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                        color: '#10b981',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}
                                >
                                    <CheckCircle2 size={15} />
                                </div>
                                <span style={{ fontSize: '14px', color: '#f1f5f9', lineHeight: 1.5, wordBreak: 'break-word' }}>
                                    {highlight}
                                </span>
                            </div>

                            <button
                                onClick={() => handleRemoveHighlight(index)}
                                className="admin-btn-icon delete"
                                title="Delete milestone"
                            >
                                <Trash2 size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {highlights.length === 0 && (
                    <div className="admin-empty-state" style={{ padding: '60px 20px' }}>
                        <Rocket size={44} style={{ opacity: 0.3, marginBottom: '14px', color: '#a855f7' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px' }}>
                            No career milestones added yet
                        </h3>
                        <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b', maxWidth: '400px' }}>
                            Add your hackathon wins, major certifications, open source contributions, or standout client projects.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AchievementsTab

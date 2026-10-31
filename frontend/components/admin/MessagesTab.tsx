'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mail, Trash2, Search, X, Reply, Copy, Filter, Calendar, Eye, Sparkles, Phone, Building2, ChevronRight
} from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'
import type { ContactMessage, AiLead } from '@/lib/admin-types'

type SortOption = 'newest' | 'oldest'
type SubjectFilter = 'all' | 'with_subject' | 'no_subject'
type ViewMode = 'contact' | 'ai_leads'

interface MessagesTabProps {
    messages: ContactMessage[]
    aiLeads?: AiLead[]
    onDeleteMessage: (id: number) => Promise<void>
    onDeleteAiLead?: (id: number) => Promise<void>
    onRefresh: () => void
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const CYAN = '#06f9f9'
const PURPLE = '#a855f7'
const BLUE = '#3b82f6'
const RED = '#ef4444'
const CARD_BG = 'rgba(15, 22, 40, 0.85)'
const BORDER = 'rgba(255,255,255,0.08)'
const TEXT_PRIMARY = '#f8fafc'
const TEXT_SECONDARY = '#94a3b8'
const TEXT_MUTED = '#64748b'

// ─── Avatar circle ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
    '#06f9f9', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#a855f7',
]
function getAvatarColor(name: string): string {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

// ─── Inline styles helpers ────────────────────────────────────────────────────
const glassCard: React.CSSProperties = {
    background: CARD_BG,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    backdropFilter: 'blur(12px)',
}

const iconBtnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    flexShrink: 0,
}

const MessagesTab = ({
    messages,
    aiLeads = [],
    onDeleteMessage,
    onDeleteAiLead,
    onRefresh
}: MessagesTabProps) => {
    const [viewMode, setViewMode] = useState<ViewMode>('contact')
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<SortOption>('newest')
    const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all')
    const [dateFilter, setDateFilter] = useState('') // YYYY-MM-DD or ''
    const [detailMessage, setDetailMessage] = useState<ContactMessage | null>(null)
    const [detailAiLead, setDetailAiLead] = useState<AiLead | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean
        id: number | null
        type: 'contact' | 'ai_lead'
    }>({
        isOpen: false,
        id: null,
        type: 'contact',
    })
    const [copiedId, setCopiedId] = useState<number | null>(null)

    const handleDeleteContact = (id: number) => {
        setDeleteConfirm({ isOpen: true, id, type: 'contact' })
    }

    const handleDeleteLead = (id: number) => {
        setDeleteConfirm({ isOpen: true, id, type: 'ai_lead' })
    }

    const confirmDelete = async () => {
        if (deleteConfirm.id !== null) {
            try {
                if (deleteConfirm.type === 'ai_lead' && onDeleteAiLead) {
                    await onDeleteAiLead(deleteConfirm.id)
                    setDetailAiLead((prev) => (prev?.id === deleteConfirm.id ? null : prev))
                } else {
                    await onDeleteMessage(deleteConfirm.id)
                    setDetailMessage((prev) => (prev?.id === deleteConfirm.id ? null : prev))
                }
                setDeleteConfirm({ isOpen: false, id: null, type: 'contact' })
                onRefresh()
            } catch {
                // Parent toast handles error
            }
        }
    }

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr)
            return d.toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short'
            })
        } catch {
            return dateStr
        }
    }

    const formatDateOnly = (dateStr: string) => {
        try {
            const d = new Date(dateStr)
            return d.toLocaleDateString(undefined, { dateStyle: 'medium' })
        } catch {
            return dateStr
        }
    }

    const getMessageDateString = (dateStr: string) => {
        const d = new Date(dateStr)
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
    }

    const copyEmail = (name: string, email: string, id: number, e?: React.MouseEvent) => {
        e?.stopPropagation()
        const text = `${name} <${email}>`
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id)
            setTimeout(() => setCopiedId(null), 2000)
        })
    }

    // Filtered contact messages
    const filteredAndSortedMessages = useMemo(() => {
        const q = searchQuery.trim().toLowerCase()
        let list = messages.filter((msg) => {
            if (q) {
                const match =
                    msg.name.toLowerCase().includes(q) ||
                    msg.email.toLowerCase().includes(q) ||
                    (msg.subject || '').toLowerCase().includes(q) ||
                    msg.message.toLowerCase().includes(q)
                if (!match) return false
            }
            if (subjectFilter === 'with_subject') if (!msg.subject?.trim()) return false
            if (subjectFilter === 'no_subject') if (msg.subject?.trim()) return false
            if (dateFilter) {
                const msgDate = getMessageDateString(msg.created_at)
                if (msgDate !== dateFilter) return false
            }
            return true
        })
        list = [...list].sort((a, b) => {
            const dateA = new Date(a.created_at).getTime()
            const dateB = new Date(b.created_at).getTime()
            return sortBy === 'newest' ? dateB - dateA : dateA - dateB
        })
        return list
    }, [messages, searchQuery, subjectFilter, sortBy, dateFilter])

    // Filtered AI leads (visitors who gave their personal info)
    const filteredAndSortedLeads = useMemo(() => {
        const q = searchQuery.trim().toLowerCase()
        let list = (aiLeads || []).filter((lead) => {
            if (q) {
                const match =
                    (lead.name || '').toLowerCase().includes(q) ||
                    (lead.email || '').toLowerCase().includes(q) ||
                    (lead.phone || '').toLowerCase().includes(q) ||
                    (lead.company || '').toLowerCase().includes(q) ||
                    (lead.message || '').toLowerCase().includes(q)
                if (!match) return false
            }
            if (dateFilter) {
                const leadDate = getMessageDateString(lead.created_at)
                if (leadDate !== dateFilter) return false
            }
            return true
        })
        list = [...list].sort((a, b) => {
            const dateA = new Date(a.created_at).getTime()
            const dateB = new Date(b.created_at).getTime()
            return sortBy === 'newest' ? dateB - dateA : dateA - dateB
        })
        return list
    }, [aiLeads, searchQuery, sortBy, dateFilter])

    const hasActiveFilters =
        searchQuery.trim() !== '' ||
        sortBy !== 'newest' ||
        (viewMode === 'contact' && subjectFilter !== 'all') ||
        dateFilter !== ''

    const clearAllFilters = () => {
        setSearchQuery('')
        setSortBy('newest')
        setSubjectFilter('all')
        setDateFilter('')
    }

    // ─── Shared select style ───────────────────────────────────────────────────
    const selectStyle: React.CSSProperties = {
        background: 'rgba(15,22,40,0.9)',
        border: `1px solid ${BORDER}`,
        borderRadius: '10px',
        color: TEXT_PRIMARY,
        fontSize: '13px',
        padding: '8px 12px',
        outline: 'none',
        cursor: 'pointer',
        appearance: 'none' as const,
        WebkitAppearance: 'none' as const,
        minWidth: '130px',
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* ── Section Header ──────────────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    {/* Icon badge */}
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                        background: `linear-gradient(135deg, ${CYAN}22, ${BLUE}33)`,
                        border: `1px solid ${CYAN}33`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Mail size={22} color={CYAN} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: TEXT_PRIMARY, letterSpacing: '-0.01em' }}>
                            Inquiries &amp; AI Leads
                        </h2>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: TEXT_MUTED }}>
                            Manage contact submissions and AI chat lead captures.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                            <span style={{
                                fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px',
                                background: `${BLUE}22`, color: '#60a5fa', border: `1px solid ${BLUE}44`,
                            }}>
                                <Mail size={10} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                {messages.length} Contacts
                            </span>
                            <span style={{
                                fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px',
                                background: `${PURPLE}22`, color: '#c084fc', border: `1px solid ${PURPLE}44`,
                            }}>
                                <Sparkles size={10} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                {aiLeads.length} AI Leads
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── View Mode Pill Tabs ──────────────────────────────────────────── */}
            <div style={{
                display: 'inline-flex', gap: '4px', padding: '4px',
                background: 'rgba(255,255,255,0.04)', borderRadius: '14px',
                border: `1px solid ${BORDER}`, width: 'fit-content',
            }}>
                {/* Contact Forms Tab */}
                <button
                    type="button"
                    onClick={() => {
                        setViewMode('contact')
                        setDetailMessage(null)
                        setDetailAiLead(null)
                    }}
                    style={{
                        padding: '9px 20px',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '13px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '7px',
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'all 0.2s ease',
                        background: viewMode === 'contact'
                            ? `linear-gradient(135deg, ${CYAN}22, ${BLUE}33)`
                            : 'transparent',
                        color: viewMode === 'contact' ? CYAN : TEXT_SECONDARY,
                        boxShadow: viewMode === 'contact' ? `0 0 16px ${CYAN}22` : 'none',
                    }}
                >
                    <Mail size={15} />
                    <span>Contact Forms</span>
                    <span style={{
                        fontSize: '11px', fontWeight: 700, padding: '1px 7px', borderRadius: '10px',
                        background: viewMode === 'contact' ? `${CYAN}33` : 'rgba(255,255,255,0.08)',
                        color: viewMode === 'contact' ? CYAN : TEXT_MUTED,
                    }}>{messages.length}</span>
                </button>

                {/* AI Chat Leads Tab */}
                <button
                    type="button"
                    onClick={() => {
                        setViewMode('ai_leads')
                        setDetailMessage(null)
                        setDetailAiLead(null)
                    }}
                    style={{
                        padding: '9px 20px',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '13px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '7px',
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'all 0.2s ease',
                        background: viewMode === 'ai_leads'
                            ? `linear-gradient(135deg, ${PURPLE}22, ${PURPLE}11)`
                            : 'transparent',
                        color: viewMode === 'ai_leads' ? '#c084fc' : TEXT_SECONDARY,
                        boxShadow: viewMode === 'ai_leads' ? `0 0 16px ${PURPLE}22` : 'none',
                    }}
                >
                    <Sparkles size={15} />
                    <span>AI Chat Leads</span>
                    <span style={{
                        fontSize: '11px', fontWeight: 700, padding: '1px 7px', borderRadius: '10px',
                        background: viewMode === 'ai_leads' ? `${PURPLE}33` : 'rgba(255,255,255,0.08)',
                        color: viewMode === 'ai_leads' ? '#c084fc' : TEXT_MUTED,
                    }}>{aiLeads.length}</span>
                </button>
            </div>

            {/* ── Filter Bar ──────────────────────────────────────────────────── */}
            <div style={{
                display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap',
                ...glassCard, padding: '12px 16px',
            }}>
                {/* Search */}
                <div style={{ flex: 1, minWidth: '200px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={15} style={{ position: 'absolute', left: '12px', color: TEXT_MUTED, pointerEvents: 'none' }} />
                    <input
                        type="text"
                        placeholder={viewMode === 'contact' ? 'Name, email, subject or message…' : 'Name, email, phone, company…'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search"
                        style={{
                            width: '100%', padding: '8px 36px 8px 36px',
                            background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`,
                            borderRadius: '10px', color: TEXT_PRIMARY, fontSize: '13px', outline: 'none',
                        }}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            aria-label="Clear search"
                            style={{ ...iconBtnBase, position: 'absolute', right: '4px', background: 'transparent', color: TEXT_MUTED, width: '28px', height: '28px' }}
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>

                {/* Sort */}
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    aria-label="Sort by date"
                    style={selectStyle}
                >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                </select>

                {/* Subject filter (contact only) */}
                {viewMode === 'contact' && (
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Filter size={13} style={{ position: 'absolute', left: '10px', color: TEXT_MUTED, pointerEvents: 'none' }} />
                        <select
                            value={subjectFilter}
                            onChange={(e) => setSubjectFilter(e.target.value as SubjectFilter)}
                            aria-label="Filter by subject"
                            style={{ ...selectStyle, paddingLeft: '28px' }}
                        >
                            <option value="all">All subjects</option>
                            <option value="with_subject">With subject</option>
                            <option value="no_subject">No subject</option>
                        </select>
                    </div>
                )}

                {/* Date filter */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Calendar size={13} style={{ position: 'absolute', left: '10px', color: TEXT_MUTED, pointerEvents: 'none' }} />
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        aria-label="Filter by date"
                        style={{ ...selectStyle, paddingLeft: '28px', colorScheme: 'dark' }}
                    />
                    {dateFilter && (
                        <button
                            type="button"
                            onClick={() => setDateFilter('')}
                            aria-label="Clear date"
                            style={{ ...iconBtnBase, position: 'absolute', right: '4px', background: 'transparent', color: TEXT_MUTED, width: '24px', height: '24px' }}
                        >
                            <X size={11} />
                        </button>
                    )}
                </div>

                {/* Clear all filters */}
                <AnimatePresence>
                    {hasActiveFilters && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            type="button"
                            onClick={clearAllFilters}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '8px 14px', borderRadius: '10px', border: `1px solid ${BORDER}`,
                                background: 'rgba(255,255,255,0.05)', color: TEXT_SECONDARY,
                                fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                            }}
                        >
                            <X size={12} />
                            Clear Filters
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Results count ────────────────────────────────────────────────── */}
            <div style={{ fontSize: '12px', color: TEXT_MUTED, paddingLeft: '2px' }}>
                {viewMode === 'contact' ? (
                    <>Showing <strong style={{ color: TEXT_SECONDARY }}>{filteredAndSortedMessages.length}</strong> of {messages.length} contact message{messages.length !== 1 ? 's' : ''}</>
                ) : (
                    <>Showing <strong style={{ color: TEXT_SECONDARY }}>{filteredAndSortedLeads.length}</strong> of {aiLeads.length} AI visitor lead{aiLeads.length !== 1 ? 's' : ''}</>
                )}
                {dateFilter && (
                    <span style={{ color: CYAN, marginLeft: '6px' }}>on {formatDateOnly(dateFilter + 'T12:00:00')}</span>
                )}
            </div>

            {/* ══ MODE 1: Contact Form Messages ══════════════════════════════════ */}
            {viewMode === 'contact' && (
                <>
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                ...glassCard, padding: '64px 24px', textAlign: 'center',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                            }}
                        >
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '16px',
                                background: `${BLUE}22`, border: `1px solid ${BLUE}33`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px',
                            }}>
                                <Mail size={24} color={BLUE} style={{ opacity: 0.7 }} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: TEXT_PRIMARY }}>No contact messages yet</h3>
                            <p style={{ margin: 0, fontSize: '13px', color: TEXT_MUTED, maxWidth: '340px' }}>
                                Contact form submissions from your portfolio will appear here.
                            </p>
                        </motion.div>
                    ) : filteredAndSortedMessages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                ...glassCard, padding: '48px 24px', textAlign: 'center',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                            }}
                        >
                            <Search size={28} color={TEXT_MUTED} />
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: TEXT_PRIMARY }}>No items match your filters</h3>
                            <p style={{ margin: 0, fontSize: '13px', color: TEXT_MUTED }}>Try a different date, search term, or clear filters.</p>
                            <button
                                type="button"
                                onClick={clearAllFilters}
                                style={{
                                    marginTop: '8px', padding: '8px 20px', borderRadius: '10px',
                                    background: `${BLUE}22`, border: `1px solid ${BLUE}44`,
                                    color: '#60a5fa', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                Clear all filters
                            </button>
                        </motion.div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <AnimatePresence mode="popLayout">
                                {filteredAndSortedMessages.map((msg, index) => {
                                    const avatarColor = getAvatarColor(msg.name)
                                    const isExpanded = detailMessage?.id === msg.id
                                    return (
                                        <motion.div
                                            key={msg.id}
                                            layout
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.97 }}
                                            transition={{ delay: Math.min(index * 0.03, 0.2) }}
                                        >
                                            {/* Card */}
                                            <motion.div
                                                whileHover={{ y: -2, boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${BORDER}` }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                onClick={() => setDetailMessage(isExpanded ? null : msg)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault()
                                                        setDetailMessage(isExpanded ? null : msg)
                                                    }
                                                }}
                                                aria-label={`View message from ${msg.name}`}
                                                style={{
                                                    ...glassCard,
                                                    borderLeft: `3px solid ${BLUE}`,
                                                    padding: '16px 20px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    gap: '14px',
                                                    alignItems: 'flex-start',
                                                }}
                                            >
                                                {/* Avatar */}
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                                                    background: `${avatarColor}22`, border: `1px solid ${avatarColor}44`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '16px', fontWeight: 700, color: avatarColor,
                                                }}>
                                                    {msg.name.charAt(0).toUpperCase()}
                                                </div>

                                                {/* Body */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                                                        <div style={{ minWidth: 0 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                                <span style={{ fontWeight: 700, fontSize: '14px', color: TEXT_PRIMARY }}>{msg.name}</span>
                                                                {msg.subject && (
                                                                    <span style={{
                                                                        fontSize: '11px', padding: '2px 8px', borderRadius: '6px',
                                                                        background: 'rgba(255,255,255,0.07)', color: TEXT_SECONDARY, maxWidth: '200px',
                                                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                                    }}>
                                                                        {msg.subject}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                                                <Mail size={11} style={{ color: TEXT_MUTED, flexShrink: 0 }} />
                                                                <a
                                                                    href={`mailto:${msg.email}`}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    style={{ fontSize: '12px', color: TEXT_SECONDARY, textDecoration: 'none' }}
                                                                >
                                                                    {msg.email}
                                                                </a>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                                                            <a
                                                                href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Your message')}`}
                                                                title="Reply"
                                                                onClick={(e) => e.stopPropagation()}
                                                                style={{ ...iconBtnBase, background: 'rgba(59,130,246,0.12)', color: '#60a5fa', textDecoration: 'none' }}
                                                            >
                                                                <Reply size={14} />
                                                            </a>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => copyEmail(msg.name, msg.email, msg.id, e)}
                                                                title={copiedId === msg.id ? 'Copied!' : 'Copy email'}
                                                                style={{ ...iconBtnBase, background: copiedId === msg.id ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.06)', color: copiedId === msg.id ? '#10b981' : TEXT_SECONDARY }}
                                                            >
                                                                <Copy size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteContact(msg.id) }}
                                                                title="Delete"
                                                                style={{ ...iconBtnBase, background: 'rgba(239,68,68,0.1)', color: RED }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p style={{
                                                        margin: '10px 0 0', fontSize: '13px', color: TEXT_MUTED,
                                                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                                                        overflow: 'hidden', lineHeight: '1.5',
                                                    }}>
                                                        {msg.message}
                                                    </p>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                                                        <span style={{ fontSize: '11px', color: TEXT_MUTED }}>
                                                            <Calendar size={10} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                                            {formatDate(msg.created_at)}
                                                        </span>
                                                        <span style={{ fontSize: '11px', color: CYAN, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                            <ChevronRight size={12} style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                                            {isExpanded ? 'Collapse' : 'View details'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            {/* Inline expanded detail */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                        style={{ overflow: 'hidden' }}
                                                    >
                                                        <div style={{
                                                            ...glassCard,
                                                            borderLeft: `3px solid ${CYAN}`,
                                                            marginTop: '4px', padding: '20px 24px',
                                                            background: 'rgba(6,249,249,0.03)',
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                                <span style={{ fontSize: '11px', fontWeight: 700, color: CYAN, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                                    Full Message
                                                                </span>
                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                    <a
                                                                        href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Your message')}`}
                                                                        style={{
                                                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                                            padding: '6px 14px', borderRadius: '8px', textDecoration: 'none',
                                                                            background: `${BLUE}22`, border: `1px solid ${BLUE}44`,
                                                                            color: '#60a5fa', fontSize: '12px', fontWeight: 600,
                                                                        }}
                                                                    >
                                                                        <Reply size={13} /> Reply
                                                                    </a>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => copyEmail(msg.name, msg.email, msg.id)}
                                                                        style={{
                                                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                                            padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
                                                                            background: copiedId === msg.id ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.06)',
                                                                            border: `1px solid ${BORDER}`,
                                                                            color: copiedId === msg.id ? '#10b981' : TEXT_SECONDARY,
                                                                            fontSize: '12px', fontWeight: 600,
                                                                        }}
                                                                    >
                                                                        <Copy size={13} />
                                                                        {copiedId === msg.id ? 'Copied!' : 'Copy email'}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setDetailMessage(null)}
                                                                        style={{
                                                                            ...iconBtnBase, background: 'rgba(255,255,255,0.06)',
                                                                            border: `1px solid ${BORDER}`, color: TEXT_MUTED,
                                                                        }}
                                                                    >
                                                                        <X size={13} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {msg.subject && (
                                                                <div style={{ marginBottom: '12px' }}>
                                                                    <span style={{ fontSize: '11px', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Subject</span>
                                                                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: TEXT_PRIMARY, fontWeight: 600 }}>{msg.subject}</p>
                                                                </div>
                                                            )}

                                                            <div>
                                                                <span style={{ fontSize: '11px', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Message</span>
                                                                <p style={{ margin: '8px 0 0', fontSize: '14px', color: TEXT_SECONDARY, lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                                                                    {msg.message}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </>
            )}

            {/* ══ MODE 2: AI Visitor Leads ════════════════════════════════════════ */}
            {viewMode === 'ai_leads' && (
                <>
                    {aiLeads.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                ...glassCard, padding: '64px 24px', textAlign: 'center',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                            }}
                        >
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '16px',
                                background: `${PURPLE}22`, border: `1px solid ${PURPLE}33`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px',
                            }}>
                                <Sparkles size={24} color={PURPLE} style={{ opacity: 0.8 }} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: TEXT_PRIMARY }}>No AI visitor leads yet</h3>
                            <p style={{ margin: 0, fontSize: '13px', color: TEXT_MUTED, maxWidth: '380px' }}>
                                Only visitors who provide their contact details (name, email, phone, company) in the chatbot will appear here.
                            </p>
                        </motion.div>
                    ) : filteredAndSortedLeads.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                ...glassCard, padding: '48px 24px', textAlign: 'center',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                            }}
                        >
                            <Search size={28} color={TEXT_MUTED} />
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: TEXT_PRIMARY }}>No items match your filters</h3>
                            <p style={{ margin: 0, fontSize: '13px', color: TEXT_MUTED }}>Try a different date, search term, or clear filters.</p>
                            <button
                                type="button"
                                onClick={clearAllFilters}
                                style={{
                                    marginTop: '8px', padding: '8px 20px', borderRadius: '10px',
                                    background: `${PURPLE}22`, border: `1px solid ${PURPLE}44`,
                                    color: '#c084fc', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                Clear all filters
                            </button>
                        </motion.div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <AnimatePresence mode="popLayout">
                                {filteredAndSortedLeads.map((lead, index) => {
                                    const avatarColor = PURPLE
                                    const isExpanded = detailAiLead?.id === lead.id
                                    return (
                                        <motion.div
                                            key={lead.id}
                                            layout
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.97 }}
                                            transition={{ delay: Math.min(index * 0.03, 0.2) }}
                                        >
                                            {/* Card */}
                                            <motion.div
                                                whileHover={{ y: -2, boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${BORDER}` }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                onClick={() => setDetailAiLead(isExpanded ? null : lead)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault()
                                                        setDetailAiLead(isExpanded ? null : lead)
                                                    }
                                                }}
                                                aria-label={`View AI Lead from ${lead.name}`}
                                                style={{
                                                    ...glassCard,
                                                    borderLeft: `3px solid ${PURPLE}`,
                                                    padding: '16px 20px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    gap: '14px',
                                                    alignItems: 'flex-start',
                                                }}
                                            >
                                                {/* Avatar */}
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                                                    background: `${avatarColor}22`, border: `1px solid ${avatarColor}44`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '16px', fontWeight: 700, color: avatarColor,
                                                }}>
                                                    {(lead.name || 'V').charAt(0).toUpperCase()}
                                                </div>

                                                {/* Body */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                                                        <div style={{ minWidth: 0 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                                <span style={{ fontWeight: 700, fontSize: '14px', color: TEXT_PRIMARY }}>{lead.name || 'Visitor'}</span>
                                                                <span style={{
                                                                    fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px',
                                                                    background: `${PURPLE}22`, color: '#c084fc', border: `1px solid ${PURPLE}33`,
                                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                                }}>
                                                                    <Sparkles size={9} /> AI Lead
                                                                </span>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
                                                                {lead.email && (
                                                                    <a
                                                                        href={`mailto:${lead.email}`}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        style={{ fontSize: '12px', color: TEXT_SECONDARY, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                                    >
                                                                        <Mail size={11} style={{ color: TEXT_MUTED }} /> {lead.email}
                                                                    </a>
                                                                )}
                                                                {lead.phone && (
                                                                    <span style={{ fontSize: '12px', color: TEXT_SECONDARY, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                        <Phone size={11} style={{ color: TEXT_MUTED }} /> {lead.phone}
                                                                    </span>
                                                                )}
                                                                {lead.company && (
                                                                    <span style={{ fontSize: '12px', color: '#a78bfa', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                        <Building2 size={11} /> {lead.company}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                                                            {lead.email && (
                                                                <a
                                                                    href={`mailto:${lead.email}?subject=Regarding your message with Satya Sanatan`}
                                                                    title="Reply via Email"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    style={{ ...iconBtnBase, background: `${PURPLE}18`, color: '#c084fc', textDecoration: 'none' }}
                                                                >
                                                                    <Reply size={14} />
                                                                </a>
                                                            )}
                                                            {lead.email && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => copyEmail(lead.name, lead.email, lead.id, e)}
                                                                    title={copiedId === lead.id ? 'Copied!' : 'Copy email'}
                                                                    style={{ ...iconBtnBase, background: copiedId === lead.id ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.06)', color: copiedId === lead.id ? '#10b981' : TEXT_SECONDARY }}
                                                                >
                                                                    <Copy size={14} />
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteLead(lead.id) }}
                                                                title="Delete"
                                                                style={{ ...iconBtnBase, background: 'rgba(239,68,68,0.1)', color: RED }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p style={{
                                                        margin: '10px 0 0', fontSize: '13px', color: TEXT_MUTED,
                                                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                                                        overflow: 'hidden', lineHeight: '1.5',
                                                    }}>
                                                        {lead.message}
                                                    </p>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                                                        <span style={{ fontSize: '11px', color: TEXT_MUTED }}>
                                                            <Calendar size={10} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                                            {formatDate(lead.created_at)}
                                                        </span>
                                                        <span style={{ fontSize: '11px', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                            <ChevronRight size={12} style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                                            {isExpanded ? 'Collapse' : 'View details'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            {/* Inline expanded detail */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                        style={{ overflow: 'hidden' }}
                                                    >
                                                        <div style={{
                                                            ...glassCard,
                                                            borderLeft: `3px solid ${PURPLE}`,
                                                            marginTop: '4px', padding: '20px 24px',
                                                            background: `${PURPLE}08`,
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <Sparkles size={12} /> AI Lead Details
                                                                </span>
                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                    {lead.email && (
                                                                        <a
                                                                            href={`mailto:${lead.email}?subject=Regarding your message with Satya Sanatan`}
                                                                            style={{
                                                                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                                                padding: '6px 14px', borderRadius: '8px', textDecoration: 'none',
                                                                                background: `${BLUE}22`, border: `1px solid ${BLUE}44`,
                                                                                color: '#60a5fa', fontSize: '12px', fontWeight: 600,
                                                                            }}
                                                                        >
                                                                            <Reply size={13} /> Reply
                                                                        </a>
                                                                    )}
                                                                    {lead.phone && (
                                                                        <a
                                                                            href={`tel:${lead.phone}`}
                                                                            style={{
                                                                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                                                padding: '6px 14px', borderRadius: '8px', textDecoration: 'none',
                                                                                background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`,
                                                                                color: TEXT_SECONDARY, fontSize: '12px', fontWeight: 600,
                                                                            }}
                                                                        >
                                                                            <Phone size={13} /> Call
                                                                        </a>
                                                                    )}
                                                                    {lead.email && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => copyEmail(lead.name, lead.email, lead.id)}
                                                                            style={{
                                                                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                                                padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
                                                                                background: copiedId === lead.id ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.06)',
                                                                                border: `1px solid ${BORDER}`,
                                                                                color: copiedId === lead.id ? '#10b981' : TEXT_SECONDARY,
                                                                                fontSize: '12px', fontWeight: 600,
                                                                            }}
                                                                        >
                                                                            <Copy size={13} />
                                                                            {copiedId === lead.id ? 'Copied!' : 'Copy email'}
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setDetailAiLead(null)}
                                                                        style={{
                                                                            ...iconBtnBase, background: 'rgba(255,255,255,0.06)',
                                                                            border: `1px solid ${BORDER}`, color: TEXT_MUTED,
                                                                        }}
                                                                    >
                                                                        <X size={13} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                                                                {lead.company && (
                                                                    <div>
                                                                        <span style={{ fontSize: '10px', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Company</span>
                                                                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#a78bfa', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                            <Building2 size={12} /> {lead.company}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <span style={{ fontSize: '10px', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date &amp; Time</span>
                                                                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: TEXT_SECONDARY }}>{formatDate(lead.created_at)}</p>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <span style={{ fontSize: '11px', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Chat Inquiry / Requirement</span>
                                                                <p style={{ margin: '8px 0 0', fontSize: '14px', color: TEXT_SECONDARY, lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                                                                    {lead.message}
                                                                </p>
                                                            </div>

                                                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'flex-end' }}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const id = lead.id
                                                                        setDetailAiLead(null)
                                                                        handleDeleteLead(id)
                                                                    }}
                                                                    style={{
                                                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                                        padding: '7px 16px', borderRadius: '8px', cursor: 'pointer',
                                                                        background: 'rgba(239,68,68,0.1)', border: `1px solid rgba(239,68,68,0.3)`,
                                                                        color: RED, fontSize: '12px', fontWeight: 600,
                                                                    }}
                                                                >
                                                                    <Trash2 size={13} /> Delete Lead
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </>
            )}

            {/* ── Contact Message Detail Modal ────────────────────────────────── */}
            <AnimatePresence>
                {detailMessage && viewMode !== 'contact' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="admin-modal-overlay"
                        onClick={() => setDetailMessage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: 'spring', duration: 0.3 }}
                            className="admin-modal admin-message-detail-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="admin-modal-header">
                                <h2 className="admin-modal-title">Contact Message Details</h2>
                                <button
                                    type="button"
                                    onClick={() => setDetailMessage(null)}
                                    className="admin-modal-close"
                                    aria-label="Close"
                                >
                                    <X />
                                </button>
                            </div>
                            <div className="admin-modal-body admin-message-detail-body">
                                <div className="admin-message-detail-row">
                                    <span className="admin-message-detail-label">From</span>
                                    <div className="admin-message-detail-value">
                                        <strong>{detailMessage.name}</strong>
                                        <a href={`mailto:${detailMessage.email}`} className="admin-message-email">
                                            {detailMessage.email}
                                        </a>
                                    </div>
                                </div>
                                {detailMessage.subject && (
                                    <div className="admin-message-detail-row">
                                        <span className="admin-message-detail-label">Subject</span>
                                        <span className="admin-message-detail-value">{detailMessage.subject}</span>
                                    </div>
                                )}
                                <div className="admin-message-detail-row">
                                    <span className="admin-message-detail-label">Date &amp; time</span>
                                    <span className="admin-message-detail-value">{formatDate(detailMessage.created_at)}</span>
                                </div>
                                <div className="admin-message-detail-row admin-message-detail-message">
                                    <span className="admin-message-detail-label">Message</span>
                                    <div className="admin-message-detail-value admin-message-detail-message-text">
                                        {detailMessage.message}
                                    </div>
                                </div>
                            </div>
                            <div className="admin-modal-footer">
                                <a
                                    href={`mailto:${detailMessage.email}?subject=Re: ${encodeURIComponent(detailMessage.subject || 'Your message')}`}
                                    className="admin-btn admin-btn-blue"
                                >
                                    <Reply />
                                    Reply
                                </a>
                                <button
                                    type="button"
                                    className={`admin-btn admin-btn-gray ${copiedId === detailMessage.id ? 'copied' : ''}`}
                                    onClick={() => copyEmail(detailMessage.name, detailMessage.email, detailMessage.id)}
                                >
                                    <Copy />
                                    {copiedId === detailMessage.id ? 'Copied!' : 'Copy email'}
                                </button>
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-red"
                                    onClick={() => {
                                        setDetailMessage(null)
                                        handleDeleteContact(detailMessage.id)
                                    }}
                                >
                                    <Trash2 />
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── AI Visitor Lead Detail Modal ────────────────────────────────── */}
            <AnimatePresence>
                {detailAiLead && viewMode !== 'ai_leads' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="admin-modal-overlay"
                        onClick={() => setDetailAiLead(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: 'spring', duration: 0.3 }}
                            className="admin-modal admin-message-detail-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="admin-modal-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Sparkles size={18} color="#a855f7" />
                                    <h2 className="admin-modal-title">AI Visitor Lead Details</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setDetailAiLead(null)}
                                    className="admin-modal-close"
                                    aria-label="Close"
                                >
                                    <X />
                                </button>
                            </div>
                            <div className="admin-modal-body admin-message-detail-body">
                                <div className="admin-message-detail-row">
                                    <span className="admin-message-detail-label">Lead Name</span>
                                    <div className="admin-message-detail-value">
                                        <strong>{detailAiLead.name || 'Anonymous Visitor'}</strong>
                                    </div>
                                </div>
                                {detailAiLead.email && (
                                    <div className="admin-message-detail-row">
                                        <span className="admin-message-detail-label">Email</span>
                                        <div className="admin-message-detail-value">
                                            <a href={`mailto:${detailAiLead.email}`} className="admin-message-email">
                                                {detailAiLead.email}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {detailAiLead.phone && (
                                    <div className="admin-message-detail-row">
                                        <span className="admin-message-detail-label">Phone</span>
                                        <div className="admin-message-detail-value">
                                            <a href={`tel:${detailAiLead.phone}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>
                                                {detailAiLead.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {detailAiLead.company && (
                                    <div className="admin-message-detail-row">
                                        <span className="admin-message-detail-label">Company / Organization</span>
                                        <span className="admin-message-detail-value">{detailAiLead.company}</span>
                                    </div>
                                )}
                                <div className="admin-message-detail-row">
                                    <span className="admin-message-detail-label">Date &amp; time</span>
                                    <span className="admin-message-detail-value">{formatDate(detailAiLead.created_at)}</span>
                                </div>
                                <div className="admin-message-detail-row admin-message-detail-message">
                                    <span className="admin-message-detail-label">Chat Inquiry / Requirement</span>
                                    <div className="admin-message-detail-value admin-message-detail-message-text">
                                        {detailAiLead.message}
                                    </div>
                                </div>
                            </div>
                            <div className="admin-modal-footer">
                                {detailAiLead.email && (
                                    <a
                                        href={`mailto:${detailAiLead.email}?subject=Regarding your message with Satya Sanatan`}
                                        className="admin-btn admin-btn-blue"
                                    >
                                        <Reply />
                                        Reply via Email
                                    </a>
                                )}
                                {detailAiLead.phone && (
                                    <a
                                        href={`tel:${detailAiLead.phone}`}
                                        className="admin-btn admin-btn-gray"
                                    >
                                        <Phone size={14} />
                                        Call
                                    </a>
                                )}
                                {detailAiLead.email && (
                                    <button
                                        type="button"
                                        className={`admin-btn admin-btn-gray ${copiedId === detailAiLead.id ? 'copied' : ''}`}
                                        onClick={() => copyEmail(detailAiLead.name, detailAiLead.email, detailAiLead.id)}
                                    >
                                        <Copy />
                                        {copiedId === detailAiLead.id ? 'Copied!' : 'Copy email'}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-red"
                                    onClick={() => {
                                        const id = detailAiLead.id
                                        setDetailAiLead(null)
                                        handleDeleteLead(id)
                                    }}
                                >
                                    <Trash2 />
                                    Delete Lead
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null, type: 'contact' })}
                title={deleteConfirm.type === 'ai_lead' ? "Delete AI Lead" : "Delete Message"}
                message={deleteConfirm.type === 'ai_lead'
                    ? "Are you sure you want to delete this visitor lead? This action cannot be undone."
                    : "Are you sure you want to delete this contact message? This action cannot be undone."}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                type="delete"
            />
        </div>
    )
}

export default MessagesTab

'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mail, Trash2, Search, X, Reply, Copy, Filter, Calendar, Eye, Sparkles, Phone, Building2
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

    return (
        <div className="admin-messages-wrap">
            <div className="admin-section-header admin-messages-header">
                <div>
                    <div className="admin-section-title-wrapper">
                        <Mail />
                        <h2 className="admin-section-title">Inquiries & Leads</h2>
                    </div>
                    <p className="admin-section-description">
                        Manage direct contact form submissions and high-intent visitor leads from your AI portfolio assistant.
                    </p>
                </div>
            </div>

            {/* View Mode Switcher: Contact Form vs AI Chat Leads */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    type="button"
                    onClick={() => {
                        setViewMode('contact')
                        setDetailMessage(null)
                        setDetailAiLead(null)
                    }}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '14px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: viewMode === 'contact' ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
                        background: viewMode === 'contact' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        color: viewMode === 'contact' ? '#60a5fa' : '#94a3b8',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <Mail size={16} />
                    <span>Contact Form Messages ({messages.length})</span>
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setViewMode('ai_leads')
                        setDetailMessage(null)
                        setDetailAiLead(null)
                    }}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '14px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: viewMode === 'ai_leads' ? '#a855f7' : 'rgba(255, 255, 255, 0.1)',
                        background: viewMode === 'ai_leads' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        color: viewMode === 'ai_leads' ? '#c084fc' : '#94a3b8',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <Sparkles size={16} />
                    <span>AI Visitor Leads ({aiLeads.length})</span>
                </button>
            </div>

            {/* Toolbar: Search + Filters */}
            <div className="admin-messages-toolbar-v2">
                <div className="admin-messages-toolbar-group">
                    <label className="admin-messages-toolbar-label">Search</label>
                    <div className="admin-messages-search-wrap">
                        <Search className="admin-messages-search-icon" />
                        <input
                            type="text"
                            className="admin-search-input admin-messages-search"
                            placeholder={viewMode === 'contact' ? "Name, email, subject or message..." : "Name, email, phone, company, message..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="admin-messages-clear-search"
                                onClick={() => setSearchQuery('')}
                                aria-label="Clear search"
                            >
                                <X />
                            </button>
                        )}
                    </div>
                </div>

                <div className="admin-messages-toolbar-group">
                    <label className="admin-messages-toolbar-label">Date</label>
                    <div className="admin-messages-date-wrap">
                        <Calendar className="admin-messages-date-icon" />
                        <input
                            type="date"
                            className="admin-messages-date-input"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            aria-label="Filter by date"
                        />
                        {dateFilter && (
                            <button
                                type="button"
                                className="admin-messages-clear-date"
                                onClick={() => setDateFilter('')}
                                aria-label="Clear date"
                            >
                                <X />
                            </button>
                        )}
                    </div>
                </div>

                {viewMode === 'contact' && (
                    <div className="admin-messages-toolbar-group">
                        <label className="admin-messages-toolbar-label">Subject</label>
                        <div className="admin-messages-select-wrap">
                            <Filter className="admin-messages-filter-icon" />
                            <select
                                className="admin-messages-select"
                                value={subjectFilter}
                                onChange={(e) => setSubjectFilter(e.target.value as SubjectFilter)}
                                aria-label="Filter by subject"
                            >
                                <option value="all">All</option>
                                <option value="with_subject">With subject</option>
                                <option value="no_subject">No subject</option>
                            </select>
                        </div>
                    </div>
                )}

                <div className="admin-messages-toolbar-group">
                    <label className="admin-messages-toolbar-label">Sort</label>
                    <select
                        className="admin-messages-select admin-messages-select-standalone"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        aria-label="Sort by date"
                    >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                    </select>
                </div>

                {hasActiveFilters && (
                    <button
                        type="button"
                        className="admin-btn admin-btn-gray admin-messages-clear-btn"
                        onClick={clearAllFilters}
                    >
                        <X />
                        Clear all
                    </button>
                )}
            </div>

            {/* Results count */}
            <div className="admin-messages-results">
                <span className="admin-messages-count">
                    {viewMode === 'contact' ? (
                        <>Showing <strong>{filteredAndSortedMessages.length}</strong> of {messages.length} contact message{messages.length !== 1 ? 's' : ''}</>
                    ) : (
                        <>Showing <strong>{filteredAndSortedLeads.length}</strong> of {aiLeads.length} verified AI visitor lead{aiLeads.length !== 1 ? 's' : ''}</>
                    )}
                    {dateFilter && (
                        <span className="admin-messages-date-hint"> on {formatDateOnly(dateFilter + 'T12:00:00')}</span>
                    )}
                </span>
            </div>

            {/* ── Mode 1: Contact Form Messages ──────────────── */}
            {viewMode === 'contact' && (
                <>
                    <div className="admin-items-grid">
                        <AnimatePresence mode="popLayout">
                            {filteredAndSortedMessages.map((msg, index) => (
                                <motion.div
                                    key={msg.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ delay: Math.min(index * 0.03, 0.2) }}
                                    className="admin-item-card admin-message-card admin-message-card-clickable"
                                    onClick={() => setDetailMessage(msg)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            setDetailMessage(msg)
                                        }
                                    }}
                                    aria-label={`View message from ${msg.name}`}
                                >
                                    <div className="admin-item-header">
                                        <div className="admin-message-meta">
                                            <h3 className="admin-item-title">{msg.name}</h3>
                                            <a
                                                href={`mailto:${msg.email}`}
                                                className="admin-message-email"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {msg.email}
                                            </a>
                                            {msg.subject && (
                                                <p className="admin-message-subject">{msg.subject}</p>
                                            )}
                                            <p className="admin-message-date">{formatDate(msg.created_at)}</p>
                                        </div>
                                        <div className="admin-item-actions admin-message-actions" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                type="button"
                                                className="admin-btn-icon edit"
                                                title="View full details"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setDetailMessage(msg)
                                                }}
                                            >
                                                <Eye />
                                            </button>
                                            <a
                                                href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Your message')}`}
                                                className="admin-btn-icon edit"
                                                title="Reply"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Reply />
                                            </a>
                                            <button
                                                type="button"
                                                className={`admin-btn-icon edit ${copiedId === msg.id ? 'copied' : ''}`}
                                                onClick={(e) => copyEmail(msg.name, msg.email, msg.id, e)}
                                                title={copiedId === msg.id ? 'Copied!' : 'Copy email'}
                                            >
                                                <Copy />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteContact(msg.id)
                                                }}
                                                className="admin-btn-icon delete"
                                                title="Delete"
                                            >
                                                <Trash2 />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="admin-message-preview admin-message-card-preview">
                                        {msg.message.length > 120 ? `${msg.message.slice(0, 120)}…` : msg.message}
                                    </p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {messages.length === 0 && (
                        <div className="admin-empty-state">
                            <Mail />
                            <h3>No contact messages yet</h3>
                            <p>Contact form submissions from your portfolio will appear here.</p>
                        </div>
                    )}
                </>
            )}

            {/* ── Mode 2: AI Visitor Leads (Only verified users who provided details) ── */}
            {viewMode === 'ai_leads' && (
                <>
                    <div className="admin-items-grid">
                        <AnimatePresence mode="popLayout">
                            {filteredAndSortedLeads.map((lead, index) => (
                                <motion.div
                                    key={lead.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ delay: Math.min(index * 0.03, 0.2) }}
                                    className="admin-item-card admin-message-card admin-message-card-clickable"
                                    onClick={() => setDetailAiLead(lead)}
                                    role="button"
                                    tabIndex={0}
                                    style={{ borderLeft: '3px solid #a855f7' }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            setDetailAiLead(lead)
                                        }
                                    }}
                                    aria-label={`View AI Lead from ${lead.name}`}
                                >
                                    <div className="admin-item-header">
                                        <div className="admin-message-meta">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                <h3 className="admin-item-title">{lead.name || 'Visitor'}</h3>
                                                <span style={{
                                                    fontSize: '11px',
                                                    background: 'rgba(168, 85, 247, 0.18)',
                                                    color: '#c084fc',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontWeight: 600,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <Sparkles size={11} /> AI Lead
                                                </span>
                                            </div>

                                            {lead.email && (
                                                <a
                                                    href={`mailto:${lead.email}`}
                                                    className="admin-message-email"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {lead.email}
                                                </a>
                                            )}

                                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
                                                {lead.phone && (
                                                    <span style={{ fontSize: '12px', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        <Phone size={12} /> {lead.phone}
                                                    </span>
                                                )}
                                                {lead.company && (
                                                    <span style={{ fontSize: '12px', color: '#a78bfa', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        <Building2 size={12} /> {lead.company}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="admin-message-date" style={{ marginTop: '4px' }}>{formatDate(lead.created_at)}</p>
                                        </div>

                                        <div className="admin-item-actions admin-message-actions" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                type="button"
                                                className="admin-btn-icon edit"
                                                title="View full inquiry"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setDetailAiLead(lead)
                                                }}
                                            >
                                                <Eye />
                                            </button>
                                            {lead.email && (
                                                <a
                                                    href={`mailto:${lead.email}?subject=Regarding your message with Satya Sanatan`}
                                                    className="admin-btn-icon edit"
                                                    title="Reply via Email"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Reply />
                                                </a>
                                            )}
                                            {lead.email && (
                                                <button
                                                    type="button"
                                                    className={`admin-btn-icon edit ${copiedId === lead.id ? 'copied' : ''}`}
                                                    onClick={(e) => copyEmail(lead.name, lead.email, lead.id, e)}
                                                    title={copiedId === lead.id ? 'Copied!' : 'Copy email'}
                                                >
                                                    <Copy />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteLead(lead.id)
                                                }}
                                                className="admin-btn-icon delete"
                                                title="Delete"
                                            >
                                                <Trash2 />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="admin-message-preview admin-message-card-preview" style={{ marginTop: '8px' }}>
                                        {lead.message.length > 120 ? `${lead.message.slice(0, 120)}…` : lead.message}
                                    </p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {aiLeads.length === 0 && (
                        <div className="admin-empty-state">
                            <Sparkles />
                            <h3>No AI visitor leads yet</h3>
                            <p>Only visitors who provide their contact details (name, email, phone, company) in the chatbot will appear here.</p>
                        </div>
                    )}
                </>
            )}

            {/* Empty search filter state */}
            {((viewMode === 'contact' && messages.length > 0 && filteredAndSortedMessages.length === 0) ||
              (viewMode === 'ai_leads' && aiLeads.length > 0 && filteredAndSortedLeads.length === 0)) && (
                <div className="admin-empty-state admin-empty-state-filtered">
                    <Search />
                    <h3>No items match your filters</h3>
                    <p>Try a different date, search term, or clear filters.</p>
                    <button
                        type="button"
                        className="admin-btn admin-btn-blue"
                        onClick={clearAllFilters}
                    >
                        Clear all filters
                    </button>
                </div>
            )}

            {/* Contact Message detail modal */}
            <AnimatePresence>
                {detailMessage && (
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
                                        <a
                                            href={`mailto:${detailMessage.email}`}
                                            className="admin-message-email"
                                        >
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
                                    <span className="admin-message-detail-label">Date & time</span>
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

            {/* AI Visitor Lead detail modal */}
            <AnimatePresence>
                {detailAiLead && (
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
                                    <span className="admin-message-detail-label">Date & time</span>
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

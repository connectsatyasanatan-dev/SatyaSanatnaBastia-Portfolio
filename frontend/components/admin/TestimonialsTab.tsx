'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Save, X, Star, MessageSquare, Quote, Building2, Calendar, Loader2 } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'

interface Testimonial {
    id?: number
    name: string
    role: string
    company: string
    text: string
    rating: number
    date: string
}

interface TestimonialsTabProps {
    testimonials: Testimonial[]
    onAddTestimonial: (testimonial: Omit<Testimonial, 'id'>) => Promise<void>
    onUpdateTestimonial: (id: number, testimonial: Partial<Testimonial>) => Promise<void>
    onDeleteTestimonial: (id: number) => Promise<void>
}

const AVATAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06f9f9']
function getAvatarColor(name: string): string {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const TestimonialsTab = ({ testimonials, onAddTestimonial, onUpdateTestimonial, onDeleteTestimonial }: TestimonialsTabProps) => {
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editData, setEditData] = useState<Partial<Testimonial> | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({
        isOpen: false,
        id: null
    })

    const initialFormState: Testimonial = {
        name: '',
        role: '',
        company: '',
        text: '',
        rating: 5,
        date: new Date().getFullYear().toString()
    }

    const [newTestimonial, setNewTestimonial] = useState<Testimonial>(initialFormState)
    const [loading, setLoading] = useState(false)

    const handleEdit = (testimonial: Testimonial) => {
        setEditingId(testimonial.id!)
        setEditData({ ...testimonial })
    }

    const handleSave = async () => {
        if (!editingId || !editData) return

        setLoading(true)
        try {
            await onUpdateTestimonial(editingId, editData)
            setEditingId(null)
            setEditData(null)
        } catch (error) {
            console.error("Failed to update testimonial", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditData(null)
    }

    const handleAdd = async () => {
        if (!newTestimonial.name.trim() || !newTestimonial.text.trim()) return

        setLoading(true)
        try {
            await onAddTestimonial(newTestimonial)
            setNewTestimonial(initialFormState)
            setShowAddForm(false)
        } catch (error) {
            console.error("Failed to add testimonial", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = (id: number) => {
        setDeleteConfirm({ isOpen: true, id })
    }

    const confirmDelete = async () => {
        if (deleteConfirm.id !== null) {
            try {
                await onDeleteTestimonial(deleteConfirm.id)
                setDeleteConfirm({ isOpen: false, id: null })
            } catch (error) {
                console.error("Failed to delete testimonial", error)
            }
        }
    }

    const renderStars = (rating: number, interactive: boolean = false, onChange?: (rating: number) => void) => {
        return (
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={interactive ? 22 : 16}
                        style={{
                            color: star <= rating ? '#fbbf24' : '#334155',
                            fill: star <= rating ? '#fbbf24' : 'none',
                            cursor: interactive ? 'pointer' : 'default',
                            transition: 'all 0.15s ease',
                            transform: interactive && star <= rating ? 'scale(1.08)' : 'scale(1)'
                        }}
                        onClick={interactive && onChange ? () => onChange(star) : undefined}
                    />
                ))}
            </div>
        )
    }

    return (
        <div className="admin-testimonials-container">
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
                        <MessageSquare size={22} />
                    </div>
                    <div>
                        <h2 className="admin-section-title">Client Testimonials</h2>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                            Endorsements, recommendations, and reviews from clients and colleagues ({testimonials.length}).
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowAddForm(true)}
                    className="admin-btn admin-btn-green"
                >
                    <Plus size={16} /> Add Testimonial
                </button>
            </div>

            {/* Add Testimonial Form */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="admin-card"
                        style={{
                            marginBottom: '28px',
                            borderLeft: '4px solid #f59e0b',
                            background: 'rgba(15, 23, 42, 0.95)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                            <h3 className="admin-card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MessageSquare size={18} style={{ color: '#f59e0b' }} /> Add Client Endorsement
                            </h3>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="admin-btn-icon delete"
                                title="Close"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <div className="admin-form-grid" style={{ marginBottom: '16px' }}>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Client Name *</label>
                                <input
                                    type="text"
                                    value={newTestimonial.name}
                                    onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="e.g. Sarah Jenkins"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Client Title / Role *</label>
                                <input
                                    type="text"
                                    value={newTestimonial.role}
                                    onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="e.g. VP of Engineering"
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Company / Organization *</label>
                                <input
                                    type="text"
                                    value={newTestimonial.company}
                                    onChange={(e) => setNewTestimonial({ ...newTestimonial, company: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="e.g. Acme Corp"
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Year / Date</label>
                                <input
                                    type="text"
                                    value={newTestimonial.date}
                                    onChange={(e) => setNewTestimonial({ ...newTestimonial, date: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="2024"
                                />
                            </div>

                            <div className="admin-form-group admin-form-group-full">
                                <label className="admin-form-label">Rating Score</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '6px 0' }}>
                                    {renderStars(newTestimonial.rating, true, (rating) => setNewTestimonial({ ...newTestimonial, rating }))}
                                    <span style={{ fontSize: '13px', color: '#fbbf24', fontWeight: 600 }}>
                                        {newTestimonial.rating} of 5 Stars
                                    </span>
                                </div>
                            </div>

                            <div className="admin-form-group admin-form-group-full">
                                <label className="admin-form-label">Endorsement Text *</label>
                                <textarea
                                    value={newTestimonial.text}
                                    onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                                    className="admin-textarea"
                                    rows={4}
                                    placeholder="Paste client recommendation or review..."
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={handleAdd}
                                disabled={loading || !newTestimonial.name.trim() || !newTestimonial.text.trim()}
                                className="admin-btn admin-btn-green"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                Save Testimonial
                            </button>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="admin-btn admin-btn-gray"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Testimonials List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {testimonials.map((testimonial, index) => {
                    const isEditing = editingId === testimonial.id
                    const avatarColor = getAvatarColor(testimonial.name || 'Anonymous')
                    const initials = (testimonial.name || 'A').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

                    return (
                        <motion.div
                            key={testimonial.id ?? index}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className="admin-card"
                            style={{
                                borderLeft: '4px solid #f59e0b',
                                position: 'relative'
                            }}
                        >
                            {/* Card Top Row */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div
                                        style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '50%',
                                            background: `${avatarColor}20`,
                                            border: `1px solid ${avatarColor}50`,
                                            color: avatarColor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '15px',
                                            fontWeight: 700,
                                            flexShrink: 0
                                        }}
                                    >
                                        {initials}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                                            {testimonial.name}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '3px' }}>
                                            <span style={{ fontSize: '12.5px', color: '#38bdf8' }}>
                                                {testimonial.role} @ <strong>{testimonial.company}</strong>
                                            </span>
                                            {testimonial.date && (
                                                <span style={{ fontSize: '11px', color: '#64748b', background: 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: '4px' }}>
                                                    {testimonial.date}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div>{renderStars(testimonial.rating)}</div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {isEditing ? (
                                            <>
                                                <button
                                                    onClick={handleSave}
                                                    disabled={loading}
                                                    className="admin-btn admin-btn-green"
                                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                                >
                                                    <Save size={13} /> Save
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="admin-btn admin-btn-gray"
                                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                                >
                                                    <X size={13} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(testimonial)}
                                                    className="admin-btn-icon edit"
                                                    title="Edit Testimonial"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => testimonial.id != null && handleDelete(testimonial.id)}
                                                    className="admin-btn-icon delete"
                                                    title="Delete Testimonial"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Inline Edit Form */}
                            {isEditing && editData ? (
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', marginTop: '12px' }}>
                                    <div className="admin-form-grid" style={{ marginBottom: '14px' }}>
                                        <div className="admin-form-group">
                                            <label className="admin-form-label">Name</label>
                                            <input
                                                type="text"
                                                value={editData.name ?? ''}
                                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                className="admin-form-input"
                                            />
                                        </div>
                                        <div className="admin-form-group">
                                            <label className="admin-form-label">Role</label>
                                            <input
                                                type="text"
                                                value={editData.role ?? ''}
                                                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                                className="admin-form-input"
                                            />
                                        </div>
                                        <div className="admin-form-group">
                                            <label className="admin-form-label">Company</label>
                                            <input
                                                type="text"
                                                value={editData.company ?? ''}
                                                onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                                                className="admin-form-input"
                                            />
                                        </div>
                                        <div className="admin-form-group">
                                            <label className="admin-form-label">Date</label>
                                            <input
                                                type="text"
                                                value={editData.date ?? ''}
                                                onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                                                className="admin-form-input"
                                            />
                                        </div>
                                        <div className="admin-form-group admin-form-group-full">
                                            <label className="admin-form-label">Rating</label>
                                            <div style={{ padding: '4px 0' }}>
                                                {renderStars(editData.rating ?? 5, true, (rating) => setEditData({ ...editData, rating }))}
                                            </div>
                                        </div>
                                        <div className="admin-form-group admin-form-group-full">
                                            <label className="admin-form-label">Testimonial Text</label>
                                            <textarea
                                                value={editData.text ?? ''}
                                                onChange={(e) => setEditData({ ...editData, text: e.target.value })}
                                                className="admin-textarea"
                                                rows={4}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={handleSave} disabled={loading} className="admin-btn admin-btn-green">
                                            <Save size={14} /> Save Changes
                                        </button>
                                        <button onClick={handleCancelEdit} className="admin-btn admin-btn-gray">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Quote Text */
                                <div
                                    style={{
                                        background: 'rgba(2, 6, 23, 0.4)',
                                        border: '1px solid rgba(255, 255, 255, 0.04)',
                                        borderRadius: '12px',
                                        padding: '16px 18px',
                                        position: 'relative'
                                    }}
                                >
                                    <p style={{ margin: 0, fontStyle: 'italic', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.7 }}>
                                        &ldquo;{testimonial.text}&rdquo;
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )
                })}
            </div>

            {/* Empty State */}
            {testimonials.length === 0 && !showAddForm && (
                <div className="admin-empty-state" style={{ padding: '80px 20px' }}>
                    <div
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fbbf24',
                            margin: '0 auto 16px'
                        }}
                    >
                        <MessageSquare size={30} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: '0 0 6px' }}>
                        No testimonials published yet
                    </h3>
                    <p style={{ margin: '0 0 20px', fontSize: '13.5px', color: '#64748b', maxWidth: '380px' }}>
                        Add client recommendations, peer endorsements, or manager reviews to elevate social proof on your site.
                    </p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="admin-btn admin-btn-blue"
                    >
                        <Plus size={16} /> Add First Testimonial
                    </button>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
                title="Delete Testimonial"
                message="Are you sure you want to delete this testimonial? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                type="delete"
            />
        </div>
    )
}

export default TestimonialsTab

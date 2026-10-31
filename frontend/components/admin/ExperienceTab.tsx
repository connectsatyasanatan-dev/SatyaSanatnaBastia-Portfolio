'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit, Save, X, Plus, Trash2, Calendar, MapPin, Briefcase, Clock } from 'lucide-react'
import type { Experience } from '@/lib/admin-types'
import ErrorAlert from './ErrorAlert'
import ConfirmDialog from './ConfirmDialog'
import TagListField from './TagListField'

interface ExperienceTabProps {
    experience: Experience[]
    onAddExperience: (experience: Omit<Experience, 'id'>) => Promise<void>
    onUpdateExperience: (id: number, experience: Partial<Experience>) => Promise<void>
    onDeleteExperience: (id: number) => Promise<void>
}

const ExperienceTab = ({ experience, onAddExperience, onUpdateExperience, onDeleteExperience }: ExperienceTabProps) => {
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editData, setEditData] = useState<Partial<Experience> | null>(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [newExperience, setNewExperience] = useState<Omit<Experience, 'id'>>({
        title: '',
        company: '',
        location: '',
        period: '',
        duration: '',
        type: 'Full-time',
        description: '',
        achievements: [],
        technologies: []
    })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({
        isOpen: false,
        id: null
    })

    const handleEdit = (exp: Experience) => {
        setEditingId(exp.id ?? null)
        setEditData({ ...exp })
    }

    const handleSave = async () => {
        const id = editingId ?? editData?.id
        if (id == null || id === undefined || !editData) {
            setError('Cannot save: missing experience id')
            return
        }

        if (!editData.title?.trim() || !editData.company?.trim() || !editData.description?.trim()) {
            setError('Title, company, and description are required')
            return
        }

        setLoading(true)
        setError(null)
        try {
            const payload = {
                title: editData.title.trim(),
                company: editData.company.trim(),
                location: (editData.location ?? '').trim() || undefined,
                period: (editData.period ?? '').trim() || undefined,
                duration: (editData.duration ?? '').trim() || undefined,
                type: editData.type ?? 'Full-time',
                description: editData.description.trim(),
                achievements: Array.isArray(editData.achievements) ? editData.achievements : [],
                technologies: Array.isArray(editData.technologies) ? editData.technologies : [],
            }
            await onUpdateExperience(Number(id), payload)
            setEditingId(null)
            setEditData(null)
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to update experience')
        } finally {
            setLoading(false)
        }
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditData(null)
        setError(null)
    }

    const handleAdd = async () => {
        if (!newExperience.title || !newExperience.company || !newExperience.description) {
            setError('Title, company, and description are required')
            return
        }

        setLoading(true)
        try {
            await onAddExperience(newExperience)
            setNewExperience({
                title: '',
                company: '',
                location: '',
                period: '',
                duration: '',
                type: 'Full-time',
                description: '',
                achievements: [],
                technologies: []
            })
            setShowAddForm(false)
            setError(null)
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to add experience')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = (id: number) => {
        setDeleteConfirm({ isOpen: true, id })
    }

    const confirmDelete = async () => {
        if (deleteConfirm.id !== null) {
            setLoading(true)
            try {
                await onDeleteExperience(deleteConfirm.id)
                setDeleteConfirm({ isOpen: false, id: null })
            } catch (err: unknown) {
                setError((err as Error).message || 'Failed to delete experience')
            } finally {
                setLoading(false)
            }
        }
    }

    const typeColors: Record<string, string> = {
        'Full-time':  'rgba(16,185,129,0.15)',
        'Part-time':  'rgba(59,130,246,0.15)',
        'Contract':   'rgba(245,158,11,0.15)',
        'Freelance':  'rgba(168,85,247,0.15)',
        'Internship': 'rgba(6,249,249,0.12)',
    }
    const typeTextColors: Record<string, string> = {
        'Full-time':  '#10b981',
        'Part-time':  '#3b82f6',
        'Contract':   '#f59e0b',
        'Freelance':  '#a855f7',
        'Internship': '#06f9f9',
    }

    const ExperienceFormFields = ({
        data,
        onChange,
    }: {
        data: Partial<Experience>
        onChange: (updated: Partial<Experience>) => void
    }) => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px'
        }}>
            <div className="admin-form-group">
                <label className="admin-form-label">Job Title *</label>
                <input
                    type="text"
                    value={data.title ?? ''}
                    onChange={(e) => onChange({ ...data, title: e.target.value })}
                    className="admin-form-input"
                    placeholder="Senior Developer"
                />
            </div>
            <div className="admin-form-group">
                <label className="admin-form-label">Company *</label>
                <input
                    type="text"
                    value={data.company ?? ''}
                    onChange={(e) => onChange({ ...data, company: e.target.value })}
                    className="admin-form-input"
                    placeholder="Tech Corp Inc."
                />
            </div>
            <div className="admin-form-group">
                <label className="admin-form-label">Location</label>
                <input
                    type="text"
                    value={data.location ?? ''}
                    onChange={(e) => onChange({ ...data, location: e.target.value })}
                    className="admin-form-input"
                    placeholder="San Francisco, CA"
                />
            </div>
            <div className="admin-form-group">
                <label className="admin-form-label">Period</label>
                <input
                    type="text"
                    value={data.period ?? ''}
                    onChange={(e) => onChange({ ...data, period: e.target.value })}
                    className="admin-form-input"
                    placeholder="Jan 2020 - Present"
                />
            </div>
            <div className="admin-form-group">
                <label className="admin-form-label">Duration</label>
                <input
                    type="text"
                    value={data.duration ?? ''}
                    onChange={(e) => onChange({ ...data, duration: e.target.value })}
                    className="admin-form-input"
                    placeholder="2 years 6 months"
                />
            </div>
            <div className="admin-form-group">
                <label className="admin-form-label">Type</label>
                <select
                    value={data.type ?? 'Full-time'}
                    onChange={(e) => onChange({ ...data, type: e.target.value })}
                    className="admin-select"
                >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                </select>
            </div>
            <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="admin-form-label">Description *</label>
                <textarea
                    value={data.description ?? ''}
                    onChange={(e) => onChange({ ...data, description: e.target.value })}
                    className="admin-textarea"
                    rows={3}
                    placeholder="Describe your role and responsibilities..."
                />
            </div>
            <div className="admin-form-group">
                <TagListField
                    label="Achievements"
                    hint=" Add one by one or paste multiple lines"
                    value={data.achievements ?? []}
                    onChange={(items) => onChange({ ...data, achievements: items })}
                    placeholder="e.g. Led team of 5 developers"
                    variant="long"
                />
            </div>
            <div className="admin-form-group">
                <TagListField
                    label="Technologies"
                    hint=" Add one by one or paste multiple lines"
                    value={data.technologies ?? []}
                    onChange={(items) => onChange({ ...data, technologies: items })}
                    placeholder="e.g. React, Node.js"
                />
            </div>
        </div>
    )

    return (
        <div>
            {/* ── Section Header ── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '28px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Icon badge */}
                    <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #10b981 0%, #06f9f9 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 0 20px rgba(16,185,129,0.35)',
                    }}>
                        <Briefcase style={{ width: '20px', height: '20px', color: '#0a1628' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc', margin: 0, lineHeight: 1.2 }}>
                            Professional Experience
                        </h2>
                        <p style={{ fontSize: '14px', color: '#94a3b8', margin: '4px 0 0' }}>
                            Manage your career timeline and work history.
                        </p>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowAddForm(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        borderRadius: '999px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#fff',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        boxShadow: '0 4px 15px rgba(16,185,129,0.4)',
                    }}
                >
                    <Plus style={{ width: '16px', height: '16px' }} />
                    Add Experience
                </motion.button>
            </div>

            {error && (
                <ErrorAlert
                    message={error}
                    type="error"
                    onDismiss={() => setError(null)}
                />
            )}

            {/* ── Add Experience Form ── */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25 }}
                        style={{
                            background: 'rgba(15,22,40,0.85)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderLeft: '4px solid #10b981',
                            borderRadius: '16px',
                            padding: '28px',
                            marginBottom: '28px',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        }}
                    >
                        {/* Form header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                                Add New Experience Entry
                            </h3>
                            <button
                                onClick={() => setShowAddForm(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    padding: '6px',
                                    cursor: 'pointer',
                                    color: '#94a3b8',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <X style={{ width: '16px', height: '16px' }} />
                            </button>
                        </div>

                        <ExperienceFormFields
                            data={newExperience}
                            onChange={(updated) => setNewExperience(updated as Omit<Experience, 'id'>)}
                        />

                        <div className="admin-form-actions" style={{ marginTop: '24px' }}>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAdd}
                                disabled={loading}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 22px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#fff',
                                    background: loading
                                        ? 'rgba(16,185,129,0.5)'
                                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    boxShadow: '0 4px 12px rgba(16,185,129,0.35)',
                                    opacity: loading ? 0.7 : 1,
                                }}
                            >
                                <Save style={{ width: '16px', height: '16px' }} />
                                {loading ? 'Saving...' : 'Add Experience'}
                            </motion.button>
                            <button
                                onClick={() => setShowAddForm(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 20px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#94a3b8',
                                    background: 'rgba(255,255,255,0.04)',
                                }}
                            >
                                <X style={{ width: '16px', height: '16px' }} />
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Experience List ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {experience.map((exp, index) => {
                    const isEditing = editingId === exp.id
                    return (
                        <motion.div
                            key={exp.id ?? index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.07 }}
                            whileHover={!isEditing ? { borderLeftColor: 'rgba(6,249,249,0.5)' } : {}}
                            style={{
                                background: 'rgba(15,22,40,0.85)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderLeft: isEditing
                                    ? '3px solid #3b82f6'
                                    : '3px solid transparent',
                                borderRadius: '16px',
                                padding: '24px',
                                backdropFilter: 'blur(12px)',
                                boxShadow: isEditing
                                    ? '0 0 0 1px rgba(59,130,246,0.2), 0 8px 32px rgba(0,0,0,0.35)'
                                    : '0 4px 20px rgba(0,0,0,0.3)',
                                transition: 'border-left-color 0.25s, box-shadow 0.25s',
                            }}
                        >
                            {isEditing && editData ? (
                                /* ── Edit Form ── */
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                                            Edit Experience
                                        </h3>
                                        <button
                                            onClick={handleCancelEdit}
                                            style={{
                                                background: 'rgba(255,255,255,0.06)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px',
                                                padding: '6px',
                                                cursor: 'pointer',
                                                color: '#94a3b8',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <X style={{ width: '16px', height: '16px' }} />
                                        </button>
                                    </div>

                                    <ExperienceFormFields
                                        data={editData}
                                        onChange={(updated) => setEditData(updated)}
                                    />

                                    <div className="admin-form-actions" style={{ marginTop: '24px' }}>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleSave}
                                            disabled={loading}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '10px 22px',
                                                borderRadius: '10px',
                                                border: 'none',
                                                cursor: loading ? 'not-allowed' : 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: '#fff',
                                                background: loading
                                                    ? 'rgba(59,130,246,0.5)'
                                                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
                                                opacity: loading ? 0.7 : 1,
                                            }}
                                        >
                                            <Save style={{ width: '16px', height: '16px' }} />
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </motion.button>
                                        <button
                                            onClick={handleCancelEdit}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '10px 20px',
                                                borderRadius: '10px',
                                                border: '1px solid rgba(255,255,255,0.12)',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: '#94a3b8',
                                                background: 'rgba(255,255,255,0.04)',
                                            }}
                                        >
                                            <X style={{ width: '16px', height: '16px' }} />
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                /* ── List View ── */
                                <>
                                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                        {/* Left: info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 style={{
                                                fontSize: '17px',
                                                fontWeight: '700',
                                                color: '#f8fafc',
                                                margin: '0 0 6px',
                                                lineHeight: 1.3,
                                            }}>
                                                {exp.title}
                                            </h3>

                                            {/* Company row */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                marginBottom: '10px',
                                                color: '#06f9f9',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                            }}>
                                                <Briefcase style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                                                {exp.company}
                                            </div>

                                            {/* Meta row */}
                                            <div style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '12px',
                                                fontSize: '13px',
                                                color: '#94a3b8',
                                            }}>
                                                {exp.location && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <MapPin style={{ width: '13px', height: '13px', color: '#64748b' }} />
                                                        {exp.location}
                                                    </span>
                                                )}
                                                {exp.period && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Calendar style={{ width: '13px', height: '13px', color: '#64748b' }} />
                                                        {exp.period}
                                                    </span>
                                                )}
                                                {exp.duration && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Clock style={{ width: '13px', height: '13px', color: '#64748b' }} />
                                                        {exp.duration}
                                                    </span>
                                                )}
                                                {exp.type && (
                                                    <span style={{
                                                        padding: '2px 10px',
                                                        borderRadius: '999px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        background: typeColors[exp.type] ?? 'rgba(255,255,255,0.08)',
                                                        color: typeTextColors[exp.type] ?? '#94a3b8',
                                                        border: `1px solid ${typeTextColors[exp.type] ?? '#94a3b8'}22`,
                                                    }}>
                                                        {exp.type}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: actions */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleEdit(exp)}
                                                title="Edit this experience"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '7px 14px',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(59,130,246,0.5)',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: '#3b82f6',
                                                    background: 'rgba(59,130,246,0.08)',
                                                }}
                                            >
                                                <Edit style={{ width: '14px', height: '14px' }} />
                                                Edit
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => exp.id != null && handleDelete(exp.id)}
                                                title="Delete this experience"
                                                disabled={exp.id == null}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '7px 14px',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(239,68,68,0.5)',
                                                    cursor: exp.id == null ? 'not-allowed' : 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: '#ef4444',
                                                    background: 'rgba(239,68,68,0.08)',
                                                    opacity: exp.id == null ? 0.5 : 1,
                                                }}
                                            >
                                                <Trash2 style={{ width: '14px', height: '14px' }} />
                                                Delete
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p style={{
                                        fontSize: '14px',
                                        color: '#94a3b8',
                                        lineHeight: 1.7,
                                        marginTop: '16px',
                                        marginBottom: 0,
                                    }}>
                                        {exp.description}
                                    </p>

                                    {/* Achievements */}
                                    {exp.achievements && exp.achievements.length > 0 && (
                                        <div style={{
                                            marginTop: '16px',
                                            background: 'rgba(6,249,249,0.04)',
                                            border: '1px solid rgba(6,249,249,0.12)',
                                            borderRadius: '10px',
                                            padding: '14px 16px',
                                        }}>
                                            <h4 style={{
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                color: '#06f9f9',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                                margin: '0 0 10px',
                                            }}>
                                                Key Achievements
                                            </h4>
                                            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                {exp.achievements.map((achievement, i) => (
                                                    <li key={i} style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: '10px',
                                                        fontSize: '14px',
                                                        color: '#94a3b8',
                                                        lineHeight: 1.6,
                                                    }}>
                                                        <span style={{
                                                            marginTop: '7px',
                                                            width: '6px',
                                                            height: '6px',
                                                            borderRadius: '50%',
                                                            background: '#06f9f9',
                                                            boxShadow: '0 0 6px rgba(6,249,249,0.6)',
                                                            flexShrink: 0,
                                                        }} />
                                                        {achievement}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Technologies */}
                                    {exp.technologies && exp.technologies.length > 0 && (
                                        <div style={{ marginTop: '14px' }}>
                                            <h4 style={{
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                color: '#64748b',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                                margin: '0 0 10px',
                                            }}>
                                                Technologies Used
                                            </h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {exp.technologies.map((tech, i) => (
                                                    <span key={i} style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '999px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        color: '#06f9f9',
                                                        background: 'rgba(6,249,249,0.1)',
                                                        border: '1px solid rgba(6,249,249,0.2)',
                                                    }}>
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    )
                })}
            </div>

            {/* ── Empty State ── */}
            {experience.length === 0 && !showAddForm && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        textAlign: 'center',
                        padding: '64px 32px',
                        background: 'rgba(15,22,40,0.6)',
                        border: '1px dashed rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                    }}
                >
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '18px',
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(6,249,249,0.1) 100%)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                    }}>
                        <Briefcase style={{ width: '28px', height: '28px', color: '#10b981' }} />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc', margin: '0 0 8px' }}>
                        No experience entries yet
                    </h3>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px' }}>
                        Add your work experience to showcase your career journey.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowAddForm(true)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 22px',
                            borderRadius: '999px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#fff',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: '0 4px 15px rgba(16,185,129,0.4)',
                        }}
                    >
                        <Plus style={{ width: '16px', height: '16px' }} />
                        Add Experience
                    </motion.button>
                </motion.div>
            )}

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
                title="Delete Experience"
                message="Are you sure you want to delete this experience entry? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                type="delete"
            />
        </div>
    )
}

export default ExperienceTab

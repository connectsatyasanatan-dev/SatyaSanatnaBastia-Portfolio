'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Edit, Save, X, Plus, Trash2, Calendar, MapPin, GraduationCap,
    BookOpen, Award, CheckCircle2, Loader2
} from 'lucide-react'
import type { Education } from '@/lib/admin-types'
import ErrorAlert from './ErrorAlert'
import ConfirmDialog from './ConfirmDialog'
import TagListField from './TagListField'

interface EducationTabProps {
    education: Education[]
    onAddEducation: (education: Omit<Education, 'id'>) => Promise<void>
    onUpdateEducation: (id: number, education: Partial<Education>) => Promise<void>
    onDeleteEducation: (id: number) => Promise<void>
}

const EducationTab = ({
    education,
    onAddEducation,
    onUpdateEducation,
    onDeleteEducation
}: EducationTabProps) => {
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editData, setEditData] = useState<Partial<Education> | null>(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [newEducation, setNewEducation] = useState<Omit<Education, 'id'>>({
        degree: '',
        school: '',
        location: '',
        period: '',
        gpa: '',
        relevant_courses: [],
        achievements: [],
        focus: ''
    })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({
        isOpen: false,
        id: null
    })

    const handleEdit = (edu: Education) => {
        setEditingId(edu.id ?? null)
        setEditData({ ...edu })
    }

    const handleSave = async () => {
        const id = editingId ?? editData?.id
        if (id == null || !editData) {
            setError('Cannot save: missing education record id')
            return
        }

        if (!editData.degree?.trim() || !editData.school?.trim()) {
            setError('Degree and School / University are required')
            return
        }

        setLoading(true)
        setError(null)
        try {
            const payload = {
                degree: editData.degree.trim(),
                school: editData.school.trim(),
                location: (editData.location ?? '').trim() || undefined,
                period: (editData.period ?? '').trim() || undefined,
                gpa: (editData.gpa ?? '').trim() || undefined,
                focus: (editData.focus ?? '').trim() || undefined,
                relevant_courses: Array.isArray(editData.relevant_courses) ? editData.relevant_courses : [],
                achievements: Array.isArray(editData.achievements) ? editData.achievements : [],
            }
            await onUpdateEducation(Number(id), payload)
            setEditingId(null)
            setEditData(null)
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to update education record')
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
        if (!newEducation.degree.trim() || !newEducation.school.trim()) {
            setError('Degree and School / University are required')
            return
        }

        setLoading(true)
        try {
            await onAddEducation(newEducation)
            setNewEducation({
                degree: '',
                school: '',
                location: '',
                period: '',
                gpa: '',
                relevant_courses: [],
                achievements: [],
                focus: ''
            })
            setShowAddForm(false)
            setError(null)
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to add education record')
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
                await onDeleteEducation(deleteConfirm.id)
                setDeleteConfirm({ isOpen: false, id: null })
            } catch (err: unknown) {
                setError((err as Error).message || 'Failed to delete education record')
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <div className="admin-education-container">
            {/* Header */}
            <div className="admin-section-header">
                <div className="admin-section-title-wrapper">
                    <div
                        className="admin-section-icon-badge"
                        style={{
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.15))',
                            color: '#60a5fa',
                            border: '1px solid rgba(59, 130, 246, 0.3)'
                        }}
                    >
                        <GraduationCap size={22} />
                    </div>
                    <div>
                        <h2 className="admin-section-title">Academic Background</h2>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                            Degrees, universities, specializations, academic awards, and coursework ({education.length}).
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowAddForm(true)}
                    className="admin-btn admin-btn-green"
                >
                    <Plus size={16} /> Add Education
                </button>
            </div>

            {error && (
                <ErrorAlert
                    message={error}
                    type="error"
                    onDismiss={() => setError(null)}
                />
            )}

            {/* Add Education Form */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="admin-card"
                        style={{
                            marginBottom: '28px',
                            borderLeft: '4px solid #3b82f6',
                            background: 'rgba(15, 23, 42, 0.95)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                            <h3 className="admin-card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <GraduationCap size={18} style={{ color: '#3b82f6' }} /> Add Academic Degree / College
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
                                <label className="admin-form-label">Degree / Certificate *</label>
                                <input
                                    type="text"
                                    value={newEducation.degree}
                                    onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="e.g. Bachelor of Technology (B.Tech) in CSE"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">College / University *</label>
                                <input
                                    type="text"
                                    value={newEducation.school}
                                    onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="e.g. Biju Patnaik University of Technology"
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Campus Location</label>
                                <input
                                    type="text"
                                    value={newEducation.location}
                                    onChange={(e) => setNewEducation({ ...newEducation, location: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="e.g. Bhubaneswar, Odisha, India"
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Study Period</label>
                                <input
                                    type="text"
                                    value={newEducation.period}
                                    onChange={(e) => setNewEducation({ ...newEducation, period: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="e.g. 2019 - 2023"
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Grade / GPA / Percentage</label>
                                <input
                                    type="text"
                                    value={newEducation.gpa}
                                    onChange={(e) => setNewEducation({ ...newEducation, gpa: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="e.g. 8.4 CGPA or 82%"
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Field of Study / Stream</label>
                                <input
                                    type="text"
                                    value={newEducation.focus}
                                    onChange={(e) => setNewEducation({ ...newEducation, focus: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="e.g. Computer Science & Engineering"
                                />
                            </div>

                            <div className="admin-form-group admin-form-group-full">
                                <TagListField
                                    label="Relevant Coursework"
                                    hint=" Add key subjects or specializations"
                                    value={newEducation.relevant_courses ?? []}
                                    onChange={(items) => setNewEducation({ ...newEducation, relevant_courses: items })}
                                    placeholder="e.g. Data Structures & Algorithms, OS, DBMS, Computer Networks"
                                />
                            </div>

                            <div className="admin-form-group admin-form-group-full">
                                <TagListField
                                    label="Academic Honors & Achievements"
                                    hint=" Add awards, dean's list, club leadership"
                                    value={newEducation.achievements ?? []}
                                    onChange={(items) => setNewEducation({ ...newEducation, achievements: items })}
                                    placeholder="e.g. Department Rank Holder, President of Coding Club"
                                    variant="long"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={handleAdd}
                                disabled={loading || !newEducation.degree.trim() || !newEducation.school.trim()}
                                className="admin-btn admin-btn-green"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                Save Education Record
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

            {/* Education List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {education.map((edu, index) => {
                    const isEditing = editingId === edu.id

                    return (
                        <motion.div
                            key={edu.id ?? index}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className="admin-card"
                            style={{
                                borderLeft: '4px solid #3b82f6',
                                position: 'relative'
                            }}
                        >
                            {/* Card Header Row */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '240px' }}>
                                    <div
                                        style={{
                                            width: '46px',
                                            height: '46px',
                                            borderRadius: '12px',
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            border: '1px solid rgba(59, 130, 246, 0.25)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#60a5fa',
                                            flexShrink: 0
                                        }}
                                    >
                                        <GraduationCap size={22} />
                                    </div>

                                    <div>
                                        <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                                            {edu.degree}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                                            <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 500 }}>
                                                {edu.school}
                                            </span>
                                            {edu.location && (
                                                <span style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <MapPin size={12} /> {edu.location}
                                                </span>
                                            )}
                                            {edu.period && (
                                                <span style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={12} /> {edu.period}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                                onClick={() => handleEdit(edu)}
                                                className="admin-btn-icon edit"
                                                title="Edit Education Record"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => edu.id != null && handleDelete(edu.id)}
                                                className="admin-btn-icon delete"
                                                title="Delete Education Record"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Tags / GPA Row */}
                            {!isEditing && (edu.gpa || edu.focus) && (
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                                    {edu.gpa && (
                                        <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#10b981', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '2px 8px', borderRadius: '6px' }}>
                                            GPA: {edu.gpa}
                                        </span>
                                    )}
                                    {edu.focus && (
                                        <span style={{ fontSize: '11.5px', fontWeight: 500, color: '#cbd5e1', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '6px' }}>
                                            Stream: {edu.focus}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Relevant Courses */}
                            {!isEditing && edu.relevant_courses && edu.relevant_courses.length > 0 && (
                                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                                        Key Coursework:
                                    </span>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {edu.relevant_courses.map((course, i) => (
                                            <span
                                                key={i}
                                                style={{
                                                    fontSize: '11.5px',
                                                    color: '#93c5fd',
                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                                    padding: '2px 8px',
                                                    borderRadius: '6px'
                                                }}
                                            >
                                                {course}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Achievements */}
                            {!isEditing && edu.achievements && edu.achievements.length > 0 && (
                                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                                        Honors &amp; Recognitions:
                                    </span>
                                    <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {edu.achievements.map((ach, i) => (
                                            <li key={i} style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5 }}>
                                                {ach}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Inline Edit Form */}
                            {isEditing && editData && (
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', marginTop: '16px' }}>
                                    <div className="admin-form-grid" style={{ marginBottom: '14px' }}>
                                        <div className="admin-form-group">
                                            <label className="admin-form-label">Degree</label>
                                            <input
                                                type="text"
                                                value={editData.degree ?? ''}
                                                onChange={(e) => setEditData({ ...editData, degree: e.target.value })}
                                                className="admin-form-input"
                                            />
                                        </div>
                                        <div className="admin-form-group">
                                            <label className="admin-form-label">School / University</label>
                                            <input
                                                type="text"
                                                value={editData.school ?? ''}
                                                onChange={(e) => setEditData({ ...editData, school: e.target.value })}
                                                className="admin-form-input"
                                            />
                                        </div>
                                        <div className="admin-form-group">
                                            <label className="admin-form-label">Location</label>
                                            <input
                                                type="text"
                                                value={editData.location ?? ''}
                                                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                                className="admin-form-input"
                                            />
                                        </div>
                                        <div className="admin-form-group">
                                            <label className="admin-form-label">Period</label>
                                            <input
                                                type="text"
                                                value={editData.period ?? ''}
                                                onChange={(e) => setEditData({ ...editData, period: e.target.value })}
                                                className="admin-form-input"
                                            />
                                        </div>
                                        <div className="admin-form-group">
                                            <label className="admin-form-label">GPA / Grade</label>
                                            <input
                                                type="text"
                                                value={editData.gpa ?? ''}
                                                onChange={(e) => setEditData({ ...editData, gpa: e.target.value })}
                                                className="admin-form-input"
                                            />
                                        </div>
                                        <div className="admin-form-group">
                                            <label className="admin-form-label">Stream / Focus</label>
                                            <input
                                                type="text"
                                                value={editData.focus ?? ''}
                                                onChange={(e) => setEditData({ ...editData, focus: e.target.value })}
                                                className="admin-form-input"
                                            />
                                        </div>
                                        <div className="admin-form-group admin-form-group-full">
                                            <TagListField
                                                label="Relevant Coursework"
                                                hint=" Add key subjects or specializations"
                                                value={editData.relevant_courses ?? []}
                                                onChange={(items) => setEditData({ ...editData, relevant_courses: items })}
                                                placeholder="e.g. Data Structures"
                                            />
                                        </div>
                                        <div className="admin-form-group admin-form-group-full">
                                            <TagListField
                                                label="Academic Honors & Achievements"
                                                hint=" Add awards, dean's list"
                                                value={editData.achievements ?? []}
                                                onChange={(items) => setEditData({ ...editData, achievements: items })}
                                                placeholder="e.g. Dean's List"
                                                variant="long"
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
                            )}
                        </motion.div>
                    )
                })}
            </div>

            {/* Empty State */}
            {education.length === 0 && !showAddForm && (
                <div className="admin-empty-state" style={{ padding: '80px 20px' }}>
                    <div
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#60a5fa',
                            margin: '0 auto 16px'
                        }}
                    >
                        <GraduationCap size={30} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: '0 0 6px' }}>
                        No academic history added yet
                    </h3>
                    <p style={{ margin: '0 0 20px', fontSize: '13.5px', color: '#64748b', maxWidth: '380px' }}>
                        Add your university degrees, colleges, relevant coursework, and academic honors.
                    </p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="admin-btn admin-btn-blue"
                    >
                        <Plus size={16} /> Add First Education Record
                    </button>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
                title="Delete Education Record"
                message="Are you sure you want to delete this education entry? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                type="delete"
            />
        </div>
    )
}

export default EducationTab

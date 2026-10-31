'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit, Save, X, User, Mail, MapPin, Globe, Github, Linkedin, Twitter, Phone, Clock, Languages, Briefcase, FileText, FileUp, Loader2, CheckCircle2, Trash2, Eye } from 'lucide-react'
import { adminApiClient } from '@/lib/admin-api'
import ResumeModal from '../ResumeModal'
import ConfirmDialog from './ConfirmDialog'

interface PersonalInfoTabProps {
    data: Record<string, any>
    onUpdate: (data: Record<string, any>) => void
}

const PersonalInfoTab = ({ data, onUpdate }: PersonalInfoTabProps) => {
    const [editData, setEditData] = useState(data)
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [uploadingResume, setUploadingResume] = useState(false)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

    const handleSave = async () => {
        setLoading(true)
        try {
            await onUpdate(editData)
            setIsEditing(false)
        } catch (error) {
            console.error('Failed to update personal info', error)
        } finally {
            setLoading(false)
        }
    }

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingResume(true)
        try {
            const response = await adminApiClient.uploadFile(file)
            if (response.success) {
                // Prepend base URL if not already there, but backend returns /api/static/uploads/...
                // In production, we just want to save the path.
                setEditData({
                    ...editData,
                    resume: response.url
                })
            }
        } catch (error) {
            console.error('Resume upload failed:', error)
            alert('Failed to upload resume. Please try again.')
        } finally {
            setUploadingResume(false)
        }
    }

    const handleDeleteResume = () => {
        setIsDeleteConfirmOpen(true)
    }

    const confirmDeleteResume = () => {
        setEditData({
            ...editData,
            resume: ''
        })
        setIsDeleteConfirmOpen(false)
    }

    const handleCancel = () => {
        setEditData(data)
        setIsEditing(false)
    }

    // Field configuration with icons and grouping
    const fieldGroups = [
        {
            title: 'Basic Information',
            fields: [
                { key: 'name', label: 'Full Name', icon: User, required: true },
                { key: 'title', label: 'Professional Title', icon: Briefcase, required: true },
                { key: 'role', label: 'Role', icon: User },
                { key: 'status', label: 'Status', icon: Clock },
            ]
        },
        {
            title: 'Contact Details',
            fields: [
                { key: 'email', label: 'Email', icon: Mail, type: 'email', required: true },
                { key: 'phone', label: 'Phone', icon: Phone, type: 'tel' },
                { key: 'location', label: 'Location', icon: MapPin },
                { key: 'timezone', label: 'Timezone', icon: Clock },
            ]
        },
        {
            title: 'Professional Links & CV',
            fields: [
                { key: 'github', label: 'GitHub', icon: Github, type: 'url' },
                { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, type: 'url' },
                { key: 'twitter', label: 'Twitter', icon: Twitter, type: 'url' },
                { key: 'website', label: 'Website', icon: Globe, type: 'url' },
                { key: 'portfolio', label: 'Portfolio', icon: Globe, type: 'url' },
                { key: 'resume', label: 'Curriculum Vitae (PDF)', icon: FileText, isResume: true },
            ]
        },
        {
            title: 'Additional Information',
            fields: [
                { key: 'bio', label: 'Bio', icon: User, multiline: true },
                { key: 'experience', label: 'Years of Experience', icon: Briefcase },
                { key: 'availability', label: 'Availability', icon: Clock },
                { key: 'languages', label: 'Languages (comma separated)', icon: Languages, isArray: true },
            ]
        }
    ]

    const renderField = (field: Record<string, any>) => {
        const { key, label, icon: Icon, type = 'text', multiline = false, isArray = false, required = false, isResume = false } = field
        const value = editData[key] || ''
        const displayValue = isArray && Array.isArray(value) ? value.join(', ') : value

        if (isResume) {
            return (
                <div key={key} className="admin-form-group full-width-field" style={{ gridColumn: 'span 2' }}>
                    <label className="admin-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {Icon && <Icon size={14} style={{ opacity: 0.7 }} />}
                        {label}
                    </label>
                    <div className="resume-upload-card" style={{
                        background: 'rgba(30, 41, 59, 1.0)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}>
                        {value ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(6, 249, 249, 0.05)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(6, 249, 249, 0.1)' }}>
                                <div style={{ background: 'var(--primary)', color: '#000', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CheckCircle2 size={14} />
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#fff' }}>Resume Uploaded</p>
                                    <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{value}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                        onClick={() => setIsPreviewOpen(true)}
                                        className="admin-btn-small" 
                                        style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <Eye size={12} /> Preview
                                    </button>
                                    {isEditing && (
                                        <button 
                                            onClick={handleDeleteResume}
                                            className="admin-btn-small" 
                                            style={{ fontSize: '11px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            <Trash2 size={12} /> Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>No CV uploaded yet</p>
                            </div>
                        )}

                        {isEditing && (
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleResumeUpload}
                                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                    disabled={uploadingResume}
                                />
                                <button
                                    type="button"
                                    className="admin-btn"
                                    disabled={uploadingResume}
                                    style={{ width: '100%', justifyContent: 'center', gap: '10px' }}
                                >
                                    {uploadingResume ? <Loader2 className="animate-spin" size={18} /> : <FileUp size={18} />}
                                    {uploadingResume ? 'Uploading...' : 'Click to Upload New CV (PDF Only)'}
                                </button>
                            </div>
                        )}
                        
                        <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                            Supported format: PDF. Max size: 10MB. This CV will be available for download in the Hero section.
                        </p>
                    </div>

                    <ResumeModal 
                        isOpen={isPreviewOpen}
                        onClose={() => setIsPreviewOpen(false)}
                        resumeUrl={value}
                        name={editData.name || 'Developer'}
                    />
                </div>
            )
        }

        return (
            <div key={key} className="admin-form-group">
                <label className="admin-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {Icon && <Icon size={14} style={{ opacity: 0.7 }} />}
                    {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                {isEditing ? (
                    multiline ? (
                        <textarea
                            value={displayValue}
                            onChange={(e) => setEditData({
                                ...editData,
                                [key]: isArray ? e.target.value.split(',').map(s => s.trim()) : e.target.value
                            })}
                            className="admin-textarea"
                            rows={4}
                            placeholder={`Enter ${label.toLowerCase()}...`}
                        />
                    ) : (
                        <input
                            type={type}
                            value={displayValue}
                            onChange={(e) => setEditData({
                                ...editData,
                                [key]: isArray ? e.target.value.split(',').map(s => s.trim()) : e.target.value
                            })}
                            className="admin-form-input"
                            placeholder={`Enter ${label.toLowerCase()}...`}
                        />
                    )
                ) : (
                    <div className="admin-readonly-field" style={{
                        padding: '12px 16px',
                        background: 'rgba(55, 65, 81, 0.3)',
                        borderRadius: '8px',
                        color: value ? '#e4e7eb' : '#6b7280',
                        minHeight: multiline ? '80px' : 'auto',
                        whiteSpace: multiline ? 'pre-wrap' : 'normal'
                    }}>
                        {displayValue || <span style={{ fontStyle: 'italic' }}>Not set</span>}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div>
            <div className="admin-section-header">
                <div className="admin-section-title-wrapper">
                    <User />
                    <h2 className="admin-section-title">Personal Information</h2>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="admin-btn admin-btn-green"
                            >
                                <Save size={18} />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="admin-btn admin-btn-gray"
                            >
                                <X size={18} />
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="admin-btn admin-btn-blue"
                        >
                            <Edit size={18} />
                            Edit Information
                        </button>
                    )}
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="admin-card"
            >
                {fieldGroups.map((group, groupIndex) => (
                    <div key={group.title} style={{
                        marginBottom: groupIndex < fieldGroups.length - 1 ? '32px' : '0',
                        paddingBottom: groupIndex < fieldGroups.length - 1 ? '24px' : '0',
                        borderBottom: groupIndex < fieldGroups.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                    }}>
                        <h3 style={{
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            color: '#9ca3af',
                            marginBottom: '16px',
                            letterSpacing: '0.05em',
                            fontWeight: '600'
                        }}>
                            {group.title}
                        </h3>
                        <div className="admin-form-grid">
                            {group.fields.map(field => renderField(field))}
                        </div>
                    </div>
                ))}
            </motion.div>
            {/* Delete CV Confirmation Modal */}
            <ConfirmDialog
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                title="Delete Curriculum Vitae"
                message="Are you sure you want to delete the CV? This will remove the uploaded resume from your portfolio."
                confirmText="Delete CV"
                cancelText="Cancel"
                onConfirm={confirmDeleteResume}
                type="delete"
            />
        </div>
    )
}

export default PersonalInfoTab
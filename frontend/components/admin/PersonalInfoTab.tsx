'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Edit, Save, X, User, Mail, MapPin, Globe, Github, Linkedin, Twitter,
    Phone, Clock, Languages, Briefcase, FileText, FileUp, Loader2,
    CheckCircle2, Trash2, Eye, ExternalLink, Sparkles, AlertCircle
} from 'lucide-react'
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

    const fieldGroups = [
        {
            title: 'Basic Identity',
            icon: User,
            color: '#3b82f6',
            description: 'Public name, headline, and primary career role',
            fields: [
                { key: 'name', label: 'Full Name', icon: User, required: true },
                { key: 'title', label: 'Professional Title', icon: Briefcase, required: true },
                { key: 'role', label: 'Role Description', icon: User },
                { key: 'status', label: 'Availability Status', icon: Clock },
            ]
        },
        {
            title: 'Contact Details',
            icon: Mail,
            color: '#06f9f9',
            description: 'Direct inquiry email, phone, location, and timezone',
            fields: [
                { key: 'email', label: 'Email Address', icon: Mail, type: 'email', required: true },
                { key: 'phone', label: 'Phone Number', icon: Phone, type: 'tel' },
                { key: 'location', label: 'Base Location', icon: MapPin },
                { key: 'timezone', label: 'Work Timezone', icon: Clock },
            ]
        },
        {
            title: 'Professional Links & CV',
            icon: Globe,
            color: '#a855f7',
            description: 'Social presence, portfolio URL, and downloadable CV',
            fields: [
                { key: 'github', label: 'GitHub Profile', icon: Github, type: 'url' },
                { key: 'linkedin', label: 'LinkedIn Profile', icon: Linkedin, type: 'url' },
                { key: 'twitter', label: 'Twitter / X Profile', icon: Twitter, type: 'url' },
                { key: 'website', label: 'Primary Website', icon: Globe, type: 'url' },
                { key: 'portfolio', label: 'Secondary Portfolio', icon: Globe, type: 'url' },
                { key: 'resume', label: 'Curriculum Vitae (PDF)', icon: FileText, isResume: true },
            ]
        },
        {
            title: 'Background & Profile',
            icon: Sparkles,
            color: '#10b981',
            description: 'Bio summary, years in industry, and spoken languages',
            fields: [
                { key: 'bio', label: 'Short Biography', icon: User, multiline: true },
                { key: 'experience', label: 'Total Years Experience', icon: Briefcase },
                { key: 'availability', label: 'Contract Availability', icon: Clock },
                { key: 'languages', label: 'Languages (comma separated)', icon: Languages, isArray: true },
            ]
        }
    ]

    return (
        <div className="admin-personal-info-container">
            {/* Top Section Header */}
            <div className="admin-section-header">
                <div className="admin-section-title-wrapper">
                    <div
                        className="admin-section-icon-badge"
                        style={{
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 249, 249, 0.15))',
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.3)'
                        }}
                    >
                        <User size={22} />
                    </div>
                    <div>
                        <h2 className="admin-section-title">Personal Information</h2>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                            Manage your personal profile, contact information, social links, and executive CV.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="admin-btn admin-btn-green"
                            >
                                <Save size={16} />
                                {loading ? 'Saving Changes...' : 'Save Profile'}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="admin-btn admin-btn-gray"
                            >
                                <X size={16} /> Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="admin-btn admin-btn-blue"
                        >
                            <Edit size={16} /> Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Unsaved Changes Banner */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                            background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.12), rgba(6, 249, 249, 0.08))',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '12px',
                            padding: '12px 18px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            color: '#93c5fd',
                            fontSize: '13px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <AlertCircle size={18} style={{ color: '#38bdf8' }} />
                            <span>You are currently in editing mode. Changes will apply to your public portfolio upon saving.</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={handleSave} disabled={loading} className="admin-btn admin-btn-green" style={{ padding: '6px 14px', fontSize: '12px' }}>
                                <Save size={14} /> Save
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Two-Column Groups Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px' }}>
                {fieldGroups.map((group) => {
                    const GroupIcon = group.icon
                    return (
                        <motion.div
                            key={group.title}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="admin-card"
                            style={{ position: 'relative', overflow: 'hidden' }}
                        >
                            {/* Group Card Header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <div
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '10px',
                                        background: `${group.color}15`,
                                        border: `1px solid ${group.color}35`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: group.color
                                    }}
                                >
                                    <GroupIcon size={18} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                                        {group.title}
                                    </h3>
                                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                                        {group.description}
                                    </p>
                                </div>
                            </div>

                            {/* Fields Inside Group */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {group.fields.map((field: any) => {
                                    const { key, label, icon: Icon, type = 'text', multiline = false, isArray = false, required = false, isResume = false } = field
                                    const rawValue = editData[key] || ''
                                    const displayValue = isArray && Array.isArray(rawValue) ? rawValue.join(', ') : rawValue

                                    // Special CV Upload Card
                                    if (isResume) {
                                        return (
                                            <div key={key} style={{ marginTop: '8px' }}>
                                                <label className="admin-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {Icon && <Icon size={14} style={{ opacity: 0.7 }} />}
                                                    {label}
                                                </label>
                                                <div
                                                    style={{
                                                        background: 'rgba(15, 23, 42, 0.75)',
                                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                                        borderRadius: '14px',
                                                        padding: '18px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '14px'
                                                    }}
                                                >
                                                    {rawValue ? (
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                background: 'rgba(6, 249, 249, 0.06)',
                                                                padding: '12px 16px',
                                                                borderRadius: '10px',
                                                                border: '1px solid rgba(6, 249, 249, 0.2)'
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                                                <div style={{ background: '#06f9f9', color: '#000', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                    <CheckCircle2 size={16} />
                                                                </div>
                                                                <div style={{ overflow: 'hidden' }}>
                                                                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                                                                        Executive CV Active
                                                                    </p>
                                                                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                                        {rawValue}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setIsPreviewOpen(true)}
                                                                    className="admin-btn admin-btn-gray"
                                                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                                                >
                                                                    <Eye size={13} /> Preview
                                                                </button>
                                                                {isEditing && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleDeleteResume}
                                                                        className="admin-btn admin-btn-red"
                                                                        style={{ padding: '6px 12px', fontSize: '12px' }}
                                                                    >
                                                                        <Trash2 size={13} /> Delete
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                                                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>No CV / Resume uploaded yet.</p>
                                                        </div>
                                                    )}

                                                    {isEditing && (
                                                        <div style={{ position: 'relative' }}>
                                                            <input
                                                                type="file"
                                                                accept=".pdf"
                                                                onChange={handleResumeUpload}
                                                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }}
                                                                disabled={uploadingResume}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="admin-btn admin-btn-blue"
                                                                disabled={uploadingResume}
                                                                style={{ width: '100%', justifyContent: 'center' }}
                                                            >
                                                                {uploadingResume ? <Loader2 className="animate-spin" size={16} /> : <FileUp size={16} />}
                                                                {uploadingResume ? 'Uploading Document...' : 'Upload New CV Document (PDF)'}
                                                            </button>
                                                        </div>
                                                    )}

                                                    <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b' }}>
                                                        PDF format supported. Will be linked in the hero section and resume preview modal.
                                                    </p>
                                                </div>

                                                <ResumeModal
                                                    isOpen={isPreviewOpen}
                                                    onClose={() => setIsPreviewOpen(false)}
                                                    resumeUrl={rawValue}
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
                                                <div
                                                    style={{
                                                        padding: '11px 14px',
                                                        background: 'rgba(255, 255, 255, 0.03)',
                                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                                        borderRadius: '10px',
                                                        fontSize: '13.5px',
                                                        color: rawValue ? '#f1f5f9' : '#64748b',
                                                        minHeight: multiline ? '72px' : 'auto',
                                                        whiteSpace: multiline ? 'pre-wrap' : 'normal',
                                                        wordBreak: 'break-word',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between'
                                                    }}
                                                >
                                                    <span>{displayValue || <em style={{ color: '#475569' }}>Not configured</em>}</span>
                                                    {type === 'url' && rawValue && (
                                                        <a
                                                            href={rawValue}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontSize: '12px' }}
                                                            title="Visit link"
                                                        >
                                                            <ExternalLink size={13} />
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Delete CV Confirmation Modal */}
            <ConfirmDialog
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                title="Delete Curriculum Vitae"
                message="Are you sure you want to delete the CV? This will remove the uploaded resume from your portfolio website."
                confirmText="Delete CV"
                cancelText="Cancel"
                onConfirm={confirmDeleteResume}
                type="delete"
            />
        </div>
    )
}

export default PersonalInfoTab

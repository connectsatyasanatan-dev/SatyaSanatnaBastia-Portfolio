'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Edit, Save, X, Plus, Trash2, Calendar, Award, Upload,
    Loader2, ExternalLink, ShieldCheck, CheckCircle2
} from 'lucide-react'
import type { Certification } from '@/lib/admin-types'
import { adminApiClient } from '@/lib/admin-api'
import ErrorAlert from './ErrorAlert'
import ConfirmDialog from './ConfirmDialog'

interface CertificationsTabProps {
    certifications: Certification[]
    onAddCertification: (certification: Omit<Certification, 'id'>) => Promise<void>
    onUpdateCertification: (id: number, certification: Partial<Certification>) => Promise<void>
    onDeleteCertification: (id: number) => Promise<void>
}

const CertificationsTab = ({
    certifications,
    onAddCertification,
    onUpdateCertification,
    onDeleteCertification
}: CertificationsTabProps) => {
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editData, setEditData] = useState<Partial<Certification> | null>(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [newCertification, setNewCertification] = useState<Omit<Certification, 'id'>>({
        name: '',
        issuer: '',
        date: '',
        credential: '',
        validity: '',
        badge: '',
        verify_url: ''
    })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({
        isOpen: false,
        id: null
    })
    const [uploading, setUploading] = useState<string | null>(null)

    const handleEdit = (cert: Certification) => {
        setEditingId(cert.id ?? null)
        setEditData({ ...cert })
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (PNG, JPG, or SVG)')
            return
        }

        setUploading(isEdit ? 'edit' : 'new')
        setError(null)

        try {
            const data = await adminApiClient.uploadFile(file)
            if (data.success) {
                if (isEdit) {
                    setEditData(prev => ({ ...prev, badge: data.url }))
                } else {
                    setNewCertification(prev => ({ ...prev, badge: data.url }))
                }
            } else {
                throw new Error('Upload failed')
            }
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to upload badge image')
        } finally {
            setUploading(null)
        }
    }

    const handleSave = async () => {
        const id = editingId ?? editData?.id
        if (id == null || !editData) {
            setError('Cannot save: missing certification id')
            return
        }

        if (!editData.name?.trim() || !editData.issuer?.trim()) {
            setError('Certification name and issuing organization are required')
            return
        }

        setLoading(true)
        setError(null)
        try {
            const payload = {
                name: editData.name.trim(),
                issuer: editData.issuer.trim(),
                date: (editData.date ?? '').trim(),
                credential: (editData.credential ?? '').trim() || undefined,
                validity: (editData.validity ?? '').trim() || undefined,
                badge: (editData.badge ?? '').trim() || undefined,
                verify_url: (editData.verify_url ?? '').trim() || undefined
            }
            await onUpdateCertification(Number(id), payload)
            setEditingId(null)
            setEditData(null)
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to update certification')
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
        if (!newCertification.name.trim() || !newCertification.issuer.trim()) {
            setError('Certification name and issuing organization are required')
            return
        }

        setLoading(true)
        try {
            await onAddCertification(newCertification)
            setNewCertification({
                name: '',
                issuer: '',
                date: '',
                credential: '',
                validity: '',
                badge: '',
                verify_url: ''
            })
            setShowAddForm(false)
            setError(null)
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to add certification')
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
                await onDeleteCertification(deleteConfirm.id)
                setDeleteConfirm({ isOpen: false, id: null })
            } catch (err: unknown) {
                setError((err as Error).message || 'Failed to delete certification')
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <div className="admin-certifications-container">
            {/* Header */}
            <div className="admin-section-header">
                <div className="admin-section-title-wrapper">
                    <div
                        className="admin-section-icon-badge"
                        style={{
                            background: 'linear-gradient(135deg, rgba(6, 249, 249, 0.2), rgba(20, 184, 166, 0.15))',
                            color: '#06f9f9',
                            border: '1px solid rgba(6, 249, 249, 0.3)'
                        }}
                    >
                        <Award size={22} />
                    </div>
                    <div>
                        <h2 className="admin-section-title">Certifications &amp; Licenses</h2>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                            Industry credentials, professional badges, and verified technical licenses ({certifications.length}).
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowAddForm(true)}
                    className="admin-btn admin-btn-green"
                >
                    <Plus size={16} /> Add Certification
                </button>
            </div>

            {error && (
                <ErrorAlert
                    message={error}
                    type="error"
                    onDismiss={() => setError(null)}
                />
            )}

            {/* Add Certification Form */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="admin-card"
                        style={{
                            marginBottom: '28px',
                            borderLeft: '4px solid #06f9f9',
                            background: 'rgba(15, 23, 42, 0.95)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                            <h3 className="admin-card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ShieldCheck size={18} style={{ color: '#06f9f9' }} /> Add Professional Certification
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
                                <label className="admin-form-label">Certification Name *</label>
                                <input
                                    type="text"
                                    value={newCertification.name}
                                    onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="e.g. Oracle Certified Associate (OCA)"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Issuing Body / Organization *</label>
                                <input
                                    type="text"
                                    value={newCertification.issuer}
                                    onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="e.g. Oracle, AWS, Google Cloud, Meta"
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Date Issued</label>
                                <input
                                    type="text"
                                    value={newCertification.date}
                                    onChange={(e) => setNewCertification({ ...newCertification, date: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="e.g. October 2024"
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Credential ID / Number</label>
                                <input
                                    type="text"
                                    value={newCertification.credential}
                                    onChange={(e) => setNewCertification({ ...newCertification, credential: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="e.g. OCI-2024-89104"
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Validity / Expiry</label>
                                <input
                                    type="text"
                                    value={newCertification.validity}
                                    onChange={(e) => setNewCertification({ ...newCertification, validity: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="e.g. Lifetime or Valid until 2027"
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Verification / Credential URL</label>
                                <input
                                    type="text"
                                    value={newCertification.verify_url}
                                    onChange={(e) => setNewCertification({ ...newCertification, verify_url: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="https://www.credly.com/badges/..."
                                />
                            </div>

                            {/* Badge Image Upload */}
                            <div className="admin-form-group admin-form-group-full">
                                <label className="admin-form-label">Badge Logo Image</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <input
                                        type="text"
                                        value={newCertification.badge}
                                        onChange={(e) => setNewCertification({ ...newCertification, badge: e.target.value })}
                                        className="admin-form-input"
                                        style={{ flex: '1 1 240px' }}
                                        placeholder="Image path or upload image below..."
                                    />
                                    <label
                                        className="admin-btn admin-btn-blue"
                                        style={{ margin: 0, padding: '9px 16px', cursor: 'pointer' }}
                                    >
                                        {uploading === 'new' ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                        Upload Logo
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, false)}
                                            disabled={!!uploading}
                                        />
                                    </label>
                                    {newCertification.badge && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '8px' }}>
                                            <img src={newCertification.badge} alt="Preview" style={{ height: '24px', maxWidth: '36px', objectFit: 'contain' }} />
                                            <span style={{ fontSize: '11px', color: '#10b981' }}>Logo loaded</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={handleAdd}
                                disabled={loading || !newCertification.name.trim() || !newCertification.issuer.trim()}
                                className="admin-btn admin-btn-green"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                Save Certification
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

            {/* Certifications List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {certifications.map((cert, index) => {
                    const isEditing = editingId === cert.id

                    return (
                        <motion.div
                            key={cert.id ?? index}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className="admin-card"
                            style={{
                                borderLeft: '4px solid #06f9f9',
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
                                            background: 'rgba(6, 249, 249, 0.1)',
                                            border: '1px solid rgba(6, 249, 249, 0.25)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#06f9f9',
                                            flexShrink: 0,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {cert.badge ? (
                                            <img src={cert.badge} alt={cert.issuer} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                        ) : (
                                            <Award size={22} />
                                        )}
                                    </div>

                                    <div>
                                        <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                                            {cert.name}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                                            <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 500 }}>
                                                {cert.issuer}
                                            </span>
                                            {cert.date && (
                                                <span style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={12} /> {cert.date}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {cert.verify_url && (
                                        <a
                                            href={cert.verify_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="admin-btn admin-btn-gray"
                                            style={{ padding: '6px 12px', fontSize: '12px' }}
                                            title="Verify credential link"
                                        >
                                            <ExternalLink size={13} /> Verify
                                        </a>
                                    )}

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
                                                onClick={() => handleEdit(cert)}
                                                className="admin-btn-icon edit"
                                                title="Edit Certification"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => cert.id != null && handleDelete(cert.id)}
                                                className="admin-btn-icon delete"
                                                title="Delete Certification"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Details Row */}
                            {!isEditing && (cert.credential || cert.validity) && (
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    {cert.credential && (
                                        <span style={{ fontSize: '12px', color: '#94a3b8', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '3px 9px', borderRadius: '6px', fontFamily: 'monospace' }}>
                                            ID: {cert.credential}
                                        </span>
                                    )}
                                    {cert.validity && (
                                        <span style={{ fontSize: '12px', color: '#10b981', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '3px 9px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <CheckCircle2 size={12} /> {cert.validity}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Inline Edit Form */}
                            {isEditing && editData && (
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', marginTop: '16px' }}>
                                    <div className="admin-form-grid" style={{ marginBottom: '14px' }}>
                                        <div className="admin-form-group">
                                            <label className="admin-form-label">Certification Name</label>
                                            <input
                                                type="text"
                                                value={editData.name ?? ''}
                                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                className="admin-form-input"
                                            />
                                        </div>
                                        <div className="admin-form-group">
                                            <label className="admin-form-label">Issuer</label>
                                            <input
                                                type="text"
                                                value={editData.issuer ?? ''}
                                                onChange={(e) => setEditData({ ...editData, issuer: e.target.value })}
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
                                        <div className="admin-form-group">
                                            <label className="admin-form-label">Credential ID</label>
                                            <input
                                                type="text"
                                                value={editData.credential ?? ''}
                                                onChange={(e) => setEditData({ ...editData, credential: e.target.value })}
                                                className="admin-form-input"
                                            />
                                        </div>
                                        <div className="admin-form-group">
                                            <label className="admin-form-label">Validity</label>
                                            <input
                                                type="text"
                                                value={editData.validity ?? ''}
                                                onChange={(e) => setEditData({ ...editData, validity: e.target.value })}
                                                className="admin-form-input"
                                            />
                                        </div>
                                        <div className="admin-form-group">
                                            <label className="admin-form-label">Verify URL</label>
                                            <input
                                                type="text"
                                                value={editData.verify_url ?? ''}
                                                onChange={(e) => setEditData({ ...editData, verify_url: e.target.value })}
                                                className="admin-form-input"
                                            />
                                        </div>
                                        <div className="admin-form-group admin-form-group-full">
                                            <label className="admin-form-label">Badge Image</label>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <input
                                                    type="text"
                                                    value={editData.badge ?? ''}
                                                    onChange={(e) => setEditData({ ...editData, badge: e.target.value })}
                                                    className="admin-form-input"
                                                    style={{ flex: 1 }}
                                                />
                                                <label className="admin-btn admin-btn-blue" style={{ margin: 0, padding: '9px 14px', cursor: 'pointer' }}>
                                                    {uploading === 'edit' ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                                    <input
                                                        type="file"
                                                        hidden
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload(e, true)}
                                                        disabled={!!uploading}
                                                    />
                                                </label>
                                            </div>
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
            {certifications.length === 0 && !showAddForm && (
                <div className="admin-empty-state" style={{ padding: '80px 20px' }}>
                    <div
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: 'rgba(6, 249, 249, 0.1)',
                            border: '1px solid rgba(6, 249, 249, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#06f9f9',
                            margin: '0 auto 16px'
                        }}
                    >
                        <Award size={30} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: '0 0 6px' }}>
                        No certifications listed yet
                    </h3>
                    <p style={{ margin: '0 0 20px', fontSize: '13.5px', color: '#64748b', maxWidth: '380px' }}>
                        Showcase your official cloud certifications, programming licenses, or accredited training credentials.
                    </p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="admin-btn admin-btn-blue"
                    >
                        <Plus size={16} /> Add First Certification
                    </button>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
                title="Delete Certification"
                message="Are you sure you want to delete this certification? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                type="delete"
            />
        </div>
    )
}

export default CertificationsTab

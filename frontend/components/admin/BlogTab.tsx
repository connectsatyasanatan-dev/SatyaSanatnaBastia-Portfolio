'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Save, X, FileText, Calendar, Clock, Tag, Star } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'

interface BlogPost {
    id: number
    title: string
    excerpt: string
    date: string
    readTime: string
    tags: string[]
    featured: boolean
}

interface BlogTabProps {
    blogPosts: BlogPost[]
    onAddBlogPost: (post: Omit<BlogPost, 'id'>) => Promise<void>
    onUpdateBlogPost: (id: number, post: Partial<BlogPost>) => Promise<void>
    onDeleteBlogPost: (id: number) => Promise<void>
}

const BlogTab = ({ blogPosts, onAddBlogPost, onUpdateBlogPost, onDeleteBlogPost }: BlogTabProps) => {
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({
        isOpen: false,
        id: null
    })
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        date: new Date().toISOString().split('T')[0],
        readTime: '5 min read',
        tags: '',
        featured: false
    })

    const resetForm = () => {
        setFormData({
            title: '',
            excerpt: '',
            date: new Date().toISOString().split('T')[0],
            readTime: '5 min read',
            tags: '',
            featured: false
        })
    }

    const handleAdd = async () => {
        const postData = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        }
        try {
            await onAddBlogPost(postData)
            resetForm()
            setShowAddForm(false)
        } catch (error) {
            // Error is handled by parent component via toast
        }
    }

    const handleEdit = (post: BlogPost) => {
        setEditingPost(post)
        setFormData({
            title: post.title,
            excerpt: post.excerpt,
            date: post.date,
            readTime: post.readTime,
            tags: post.tags.join(', '),
            featured: post.featured
        })
    }

    const handleUpdate = async () => {
        if (editingPost) {
            const postData = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            }
            try {
                await onUpdateBlogPost(editingPost.id, postData)
                setEditingPost(null)
                resetForm()
            } catch (error) {
                // Error is handled by parent component via toast
            }
        }
    }

    const handleCancel = () => {
        setEditingPost(null)
        setShowAddForm(false)
        resetForm()
    }

    const handleDelete = (id: number) => {
        setDeleteConfirm({ isOpen: true, id })
    }

    const confirmDelete = async () => {
        if (deleteConfirm.id !== null) {
            try {
                await onDeleteBlogPost(deleteConfirm.id)
                setDeleteConfirm({ isOpen: false, id: null })
            } catch (error) {
                // Error is handled by parent component via toast
            }
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const showForm = showAddForm || !!editingPost

    return (
        <div>
            {/* ── Section Header ── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '28px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Purple-pink icon badge */}
                    <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 0 20px rgba(168,85,247,0.4)',
                    }}>
                        <FileText style={{ width: '20px', height: '20px', color: '#fff' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc', margin: 0, lineHeight: 1.2 }}>
                            Blog Posts
                        </h2>
                        <p style={{ fontSize: '14px', color: '#94a3b8', margin: '4px 0 0' }}>
                            Publish and manage your tech articles and insights.
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
                        background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                        boxShadow: '0 4px 15px rgba(168,85,247,0.45)',
                    }}
                >
                    <Plus style={{ width: '16px', height: '16px' }} />
                    New Post
                </motion.button>
            </div>

            {/* ── Add / Edit Form ── */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25 }}
                        style={{
                            background: 'rgba(15,22,40,0.88)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderLeft: '4px solid rgba(168,85,247,0.6)',
                            borderRadius: '16px',
                            padding: '28px',
                            marginBottom: '28px',
                            backdropFilter: 'blur(14px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(168,85,247,0.1)',
                        }}
                    >
                        {/* Form header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                                {editingPost ? 'Edit Post' : 'New Blog Post'}
                            </h3>
                            <button
                                onClick={handleCancel}
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

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Title – full width */}
                            <div className="admin-form-group">
                                <label className="admin-form-label">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="Enter blog post title"
                                />
                            </div>

                            {/* Excerpt – full width */}
                            <div className="admin-form-group">
                                <label className="admin-form-label">Excerpt *</label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    className="admin-textarea"
                                    rows={3}
                                    placeholder="Brief description of the blog post"
                                />
                            </div>

                            {/* 3-column grid: Date | ReadTime | Featured */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                                gap: '16px',
                            }}>
                                <div className="admin-form-group">
                                    <label className="admin-form-label">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="admin-form-input"
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label">Read Time</label>
                                    <input
                                        type="text"
                                        value={formData.readTime}
                                        onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                                        className="admin-form-input"
                                        placeholder="5 min read"
                                    />
                                </div>

                                <div className="admin-form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        cursor: 'pointer',
                                        padding: '10px 14px',
                                        borderRadius: '10px',
                                        border: `1px solid ${formData.featured ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`,
                                        background: formData.featured ? 'rgba(245,158,11,0.08)' : 'transparent',
                                        transition: 'all 0.2s',
                                        width: '100%',
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.featured}
                                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                            className="admin-checkbox"
                                        />
                                        <Star style={{
                                            width: '15px',
                                            height: '15px',
                                            color: formData.featured ? '#f59e0b' : '#64748b',
                                            fill: formData.featured ? '#f59e0b' : 'none',
                                            transition: 'all 0.2s',
                                        }} />
                                        <span style={{
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: formData.featured ? '#f59e0b' : '#94a3b8',
                                        }}>
                                            Featured
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Tags – full width */}
                            <div className="admin-form-group">
                                <label className="admin-form-label">Tags</label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="React, JavaScript, Web Development"
                                />
                                <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0 0' }}>
                                    Separate with commas
                                </p>
                            </div>
                        </div>

                        {/* Form actions */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={editingPost ? handleUpdate : handleAdd}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 22px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#fff',
                                    background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                                    boxShadow: '0 4px 12px rgba(168,85,247,0.4)',
                                }}
                            >
                                <Save style={{ width: '16px', height: '16px' }} />
                                {editingPost ? 'Update Post' : 'Publish Post'}
                            </motion.button>
                            <button
                                onClick={handleCancel}
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

            {/* ── Blog Posts List ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {blogPosts.map((post, index) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 }}
                        whileHover={{ borderLeftColor: 'rgba(168,85,247,0.6)' }}
                        style={{
                            position: 'relative',
                            background: 'rgba(15,22,40,0.85)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderLeft: '3px solid transparent',
                            borderRadius: '16px',
                            padding: '22px 24px',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            transition: 'border-left-color 0.25s, box-shadow 0.25s',
                        }}
                    >
                        {/* Top-right: Featured badge + action buttons */}
                        <div style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                            {post.featured && (
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '3px 10px',
                                    borderRadius: '999px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: '#f59e0b',
                                    background: 'rgba(245,158,11,0.12)',
                                    border: '1px solid rgba(245,158,11,0.3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}>
                                    <Star style={{ width: '11px', height: '11px', fill: '#f59e0b' }} />
                                    Featured
                                </span>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEdit(post)}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(59,130,246,0.4)',
                                    cursor: 'pointer',
                                    color: '#3b82f6',
                                    background: 'rgba(59,130,246,0.08)',
                                }}
                            >
                                <Edit style={{ width: '14px', height: '14px' }} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(post.id)}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(239,68,68,0.4)',
                                    cursor: 'pointer',
                                    color: '#ef4444',
                                    background: 'rgba(239,68,68,0.08)',
                                }}
                            >
                                <Trash2 style={{ width: '14px', height: '14px' }} />
                            </motion.button>
                        </div>

                        {/* Card body */}
                        <div style={{ paddingRight: post.featured ? '180px' : '90px' }}>
                            {/* Title */}
                            <h3 style={{
                                fontSize: '17px',
                                fontWeight: '700',
                                color: '#f8fafc',
                                margin: '0 0 8px',
                                lineHeight: 1.4,
                            }}>
                                {post.title}
                            </h3>

                            {/* Excerpt */}
                            <p style={{
                                fontSize: '14px',
                                color: '#64748b',
                                lineHeight: 1.65,
                                margin: '0 0 14px',
                            }}>
                                {post.excerpt}
                            </p>

                            {/* Meta row */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                fontSize: '13px',
                                color: '#94a3b8',
                                marginBottom: post.tags.length > 0 ? '14px' : 0,
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Calendar style={{ width: '13px', height: '13px', color: '#64748b' }} />
                                    {formatDate(post.date)}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Clock style={{ width: '13px', height: '13px', color: '#64748b' }} />
                                    {post.readTime}
                                </span>
                            </div>

                            {/* Tag pills */}
                            {post.tags.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {post.tags.map((tag, tagIndex) => (
                                        <span
                                            key={tagIndex}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '3px 10px',
                                                borderRadius: '999px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                color: '#a855f7',
                                                background: 'rgba(168,85,247,0.1)',
                                                border: '1px solid rgba(168,85,247,0.2)',
                                            }}
                                        >
                                            <Tag style={{ width: '11px', height: '11px' }} />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Empty State ── */}
            {blogPosts.length === 0 && !showAddForm && (
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
                        background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(236,72,153,0.12) 100%)',
                        border: '1px solid rgba(168,85,247,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                    }}>
                        <FileText style={{ width: '28px', height: '28px', color: '#a855f7' }} />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc', margin: '0 0 8px' }}>
                        No posts yet
                    </h3>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px' }}>
                        Start sharing your knowledge and insights with the world.
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
                            background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                            boxShadow: '0 4px 15px rgba(168,85,247,0.45)',
                        }}
                    >
                        <Plus style={{ width: '16px', height: '16px' }} />
                        Write Your First Post
                    </motion.button>
                </motion.div>
            )}

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
                title="Delete Blog Post"
                message="Are you sure you want to delete this blog post? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                type="delete"
            />
        </div>
    )
}

export default BlogTab

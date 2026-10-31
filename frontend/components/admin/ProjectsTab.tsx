'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Edit, Save, X, Plus, Trash2, ExternalLink, Github, Star,
    GitFork, FolderOpen, Code2, Package, Download, CheckCircle2,
    Archive, Clock, Zap
} from 'lucide-react'
import type { Project } from '@/lib/admin-types'
import { validateProject } from '@/lib/validation'
import ErrorAlert from './ErrorAlert'
import ConfirmDialog from './ConfirmDialog'
import TagListField from './TagListField'

interface ProjectsTabProps {
    projects: Project[]
    onAddProject: (project: Omit<Project, 'id'>) => Promise<void>
    onUpdateProject: (id: number, project: Partial<Project>) => Promise<void>
    onDeleteProject: (id: number) => Promise<void>
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
    active: { label: 'Active', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', icon: CheckCircle2 },
    'in-progress': { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', icon: Clock },
    archived: { label: 'Archived', color: '#64748b', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.35)', icon: Archive },
    'coming-soon': { label: 'Coming Soon', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.35)', icon: Zap },
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(15,22,40,0.8)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#f8fafc',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
}

const ProjectsTab = ({ projects, onAddProject, onUpdateProject, onDeleteProject }: ProjectsTabProps) => {
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editData, setEditData] = useState<Partial<Project> | null>(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({
        name: '',
        filename: '',
        version: 'v1.0.0',
        downloads: '0/wk',
        description: '',
        technologies: [],
        features: [],
        stars: 0,
        forks: 0,
        demoUrl: '',
        githubUrl: '',
        status: 'active',
        featured: false
    })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({
        isOpen: false,
        id: null
    })

    const handleEdit = (project: Project) => {
        setEditingId(project.id)
        setEditData({
            ...project,
            technologies: project.technologies || [],
            features: project.features || []
        })
    }

    const handleSave = async () => {
        if (!editingId || !editData) return

        const validation = validateProject(editData)
        if (!validation.isValid) {
            setError(validation.errors.map(e => e.message).join(', '))
            return
        }

        setLoading(true)
        try {
            await onUpdateProject(editingId, editData)
            setEditingId(null)
            setEditData(null)
            setError(null)
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to update project')
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
        const validation = validateProject(newProject)
        if (!validation.isValid) {
            setError(validation.errors.map(e => e.message).join(', '))
            return
        }

        setLoading(true)
        try {
            await onAddProject(newProject)
            setNewProject({
                name: '',
                filename: '',
                version: 'v1.0.0',
                downloads: '0/wk',
                description: '',
                technologies: [],
                features: [],
                stars: 0,
                forks: 0,
                demoUrl: '',
                githubUrl: '',
                status: 'active',
                featured: false
            })
            setShowAddForm(false)
            setError(null)
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to add project')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = (id: number) => {
        setDeleteConfirm({ isOpen: true, id })
    }

    const confirmDelete = async () => {
        if (deleteConfirm.id === null) return

        setLoading(true)
        try {
            await onDeleteProject(deleteConfirm.id)
            setDeleteConfirm({ isOpen: false, id: null })
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to delete project')
        } finally {
            setLoading(false)
        }
    }

    const featuredCount = projects.filter(p => p.featured).length

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* ── Section Header ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        width: '46px', height: '46px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(59,130,246,0.08))',
                        border: '1px solid rgba(59,130,246,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#3b82f6',
                        boxShadow: '0 0 20px rgba(59,130,246,0.15)',
                    }}>
                        <Code2 size={22} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
                            Projects Portfolio
                        </h2>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0' }}>
                            {projects.length} projects
                            <span style={{ margin: '0 6px', color: '#334155' }}>·</span>
                            <span style={{ color: '#f59e0b' }}>⭐ {featuredCount} featured</span>
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: '#fff', fontSize: '14px', fontWeight: 600,
                        boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
                        transition: 'all 0.2s',
                    }}
                >
                    <Plus size={17} />
                    Add New Project
                </button>
            </div>

            {/* ── Error Alert ── */}
            {error && (
                <ErrorAlert
                    message={error}
                    type="error"
                    onDismiss={() => setError(null)}
                />
            )}

            {/* ── Add New Project Form ── */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.25 }}
                        style={{
                            background: 'rgba(15,22,40,0.85)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderLeft: '4px solid #3b82f6',
                            borderRadius: '14px',
                            padding: '24px',
                            backdropFilter: 'blur(12px)',
                        }}
                    >
                        {/* Form header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '34px', height: '34px', borderRadius: '8px',
                                    background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6'
                                }}>
                                    <FolderOpen size={17} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>New Project</h3>
                                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Fill in the details below</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddForm(false)}
                                style={{
                                    width: '32px', height: '32px', borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                                    color: '#94a3b8', cursor: 'pointer', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Two-column grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {/* Row 1 */}
                            <div>
                                <label style={labelStyle}>Project Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    type="text"
                                    value={newProject.name}
                                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                    style={inputStyle}
                                    placeholder="My Awesome Project"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>NPM Package Filename</label>
                                <input
                                    type="text"
                                    value={newProject.filename}
                                    onChange={(e) => setNewProject({ ...newProject, filename: e.target.value })}
                                    style={{ ...inputStyle, fontFamily: 'monospace' }}
                                    placeholder="package-name"
                                />
                            </div>
                            {/* Row 2 */}
                            <div>
                                <label style={labelStyle}>Version</label>
                                <input
                                    type="text"
                                    value={newProject.version}
                                    onChange={(e) => setNewProject({ ...newProject, version: e.target.value })}
                                    style={inputStyle}
                                    placeholder="v1.0.0"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Downloads / Week</label>
                                <input
                                    type="text"
                                    value={newProject.downloads}
                                    onChange={(e) => setNewProject({ ...newProject, downloads: e.target.value })}
                                    style={inputStyle}
                                    placeholder="1.2k/wk"
                                />
                            </div>
                            {/* Row 3 */}
                            <div>
                                <label style={labelStyle}>GitHub URL</label>
                                <input
                                    type="url"
                                    value={newProject.githubUrl || ''}
                                    onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                                    style={inputStyle}
                                    placeholder="https://github.com/user/repo"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Demo URL</label>
                                <input
                                    type="url"
                                    value={newProject.demoUrl || ''}
                                    onChange={(e) => setNewProject({ ...newProject, demoUrl: e.target.value })}
                                    style={inputStyle}
                                    placeholder="https://demo.example.com"
                                />
                            </div>
                            {/* Row 4 */}
                            <div>
                                <label style={labelStyle}>Status</label>
                                <select
                                    value={newProject.status}
                                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value as "active" | "in-progress" | "archived" })}
                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                >
                                    <option value="active">Active</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="archived">Archived</option>
                                    <option value="coming-soon">Coming Soon</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Stars &amp; Forks</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <input
                                        type="number"
                                        value={newProject.stars}
                                        onChange={(e) => setNewProject({ ...newProject, stars: parseInt(e.target.value) || 0 })}
                                        style={inputStyle}
                                        placeholder="Stars"
                                    />
                                    <input
                                        type="number"
                                        value={newProject.forks}
                                        onChange={(e) => setNewProject({ ...newProject, forks: parseInt(e.target.value) || 0 })}
                                        style={inputStyle}
                                        placeholder="Forks"
                                    />
                                </div>
                            </div>
                            {/* Row 5 — Featured checkbox full width */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{
                                    display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                                    padding: '12px 16px', borderRadius: '8px',
                                    background: newProject.featured ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${newProject.featured ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.08)'}`,
                                    transition: 'all 0.2s',
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={newProject.featured}
                                        onChange={(e) => setNewProject({ ...newProject, featured: e.target.checked })}
                                        style={{ width: '16px', height: '16px', accentColor: '#f59e0b', cursor: 'pointer' }}
                                    />
                                    <div>
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: newProject.featured ? '#f59e0b' : '#f8fafc' }}>
                                            ⭐ Featured Project
                                        </span>
                                        <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>
                                            Highlighted in portfolio showcase
                                        </span>
                                    </div>
                                </label>
                            </div>
                            {/* Description — full width */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Description <span style={{ color: '#ef4444' }}>*</span></label>
                                <textarea
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                    rows={3}
                                    style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                                    placeholder="Describe your project..."
                                />
                            </div>
                            {/* Technologies — full width */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <TagListField
                                    label="Technologies"
                                    hint=" Add technologies used"
                                    value={newProject.technologies}
                                    onChange={(items) => setNewProject({ ...newProject, technologies: items })}
                                    placeholder="e.g. React, Node.js"
                                />
                            </div>
                            {/* Features — full width */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <TagListField
                                    label="Key Features"
                                    hint=" Add key features"
                                    value={newProject.features}
                                    onChange={(items) => setNewProject({ ...newProject, features: items })}
                                    placeholder="e.g. Responsive Design"
                                />
                            </div>
                        </div>

                        {/* Form actions */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <button
                                onClick={handleAdd}
                                disabled={loading}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '10px 22px', borderRadius: '9px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                    background: loading ? 'rgba(59,130,246,0.4)' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
                                    color: '#fff', fontSize: '14px', fontWeight: 600,
                                    boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
                                    opacity: loading ? 0.7 : 1,
                                }}
                            >
                                <Save size={16} />
                                {loading ? 'Saving...' : 'Save Project'}
                            </button>
                            <button
                                onClick={() => setShowAddForm(false)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '10px 18px', borderRadius: '9px',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                                    color: '#94a3b8', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                                }}
                            >
                                <X size={16} />
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Empty State ── */}
            {projects.length === 0 && !showAddForm && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: '80px 20px', textAlign: 'center',
                        background: 'rgba(15,22,40,0.6)', border: '1px dashed rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                    }}
                >
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '20px',
                        background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '20px', color: '#3b82f6',
                    }}>
                        <FolderOpen size={32} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: '0 0 8px' }}>No projects yet</h3>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px' }}>
                        Add your first project to showcase your work!
                    </p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
                            color: '#fff', fontSize: '14px', fontWeight: 600,
                        }}
                    >
                        <Plus size={17} />
                        Add Project
                    </button>
                </motion.div>
            )}

            {/* ── Project Cards ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {projects.map((project, idx) => {
                    const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.active
                    const StatusIcon = statusCfg.icon
                    const isEditing = editingId === project.id

                    return (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            style={{
                                background: 'rgba(15,22,40,0.85)',
                                border: isEditing
                                    ? '1px solid rgba(59,130,246,0.5)'
                                    : '1px solid rgba(255,255,255,0.08)',
                                borderLeft: isEditing ? '4px solid #3b82f6' : '4px solid rgba(59,130,246,0.3)',
                                borderRadius: '14px',
                                padding: '24px',
                                backdropFilter: 'blur(12px)',
                                boxShadow: isEditing
                                    ? '0 0 30px rgba(59,130,246,0.12), 0 8px 32px rgba(0,0,0,0.3)'
                                    : '0 4px 24px rgba(0,0,0,0.2)',
                                transition: 'box-shadow 0.3s, border-color 0.3s',
                                position: 'relative',
                            }}
                        >
                            {/* ── TOP ROW: name + badges + actions ── */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {/* Name + featured badge */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.01em' }}>
                                            {project.name}
                                        </h3>
                                        {/* Status badge */}
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                                            color: statusCfg.color, background: statusCfg.bg,
                                            border: `1px solid ${statusCfg.border}`,
                                        }}>
                                            <StatusIcon size={11} />
                                            {statusCfg.label}
                                        </span>
                                        {/* Featured badge */}
                                        {project.featured && (
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                                                color: '#f59e0b', background: 'rgba(245,158,11,0.12)',
                                                border: '1px solid rgba(245,158,11,0.3)',
                                            }}>
                                                <Star size={11} fill="#f59e0b" />
                                                Featured
                                            </span>
                                        )}
                                    </div>
                                    {/* META ROW: package + version + downloads */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        {project.filename && (
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
                                                fontFamily: 'monospace', color: '#94a3b8',
                                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                                            }}>
                                                <Package size={11} />
                                                {project.filename}
                                            </span>
                                        )}
                                        {project.version && (
                                            <span style={{
                                                padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                                                color: '#3b82f6', background: 'rgba(59,130,246,0.1)',
                                                border: '1px solid rgba(59,130,246,0.25)',
                                            }}>
                                                {project.version}
                                            </span>
                                        )}
                                        {project.downloads && (
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                fontSize: '12px', color: '#64748b',
                                            }}>
                                                <Download size={11} />
                                                {project.downloads}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={handleSave}
                                                disabled={loading}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                    padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                                    background: 'linear-gradient(135deg,#10b981,#059669)',
                                                    color: '#fff', fontSize: '13px', fontWeight: 600,
                                                }}
                                            >
                                                <Save size={14} />
                                                {loading ? 'Saving…' : 'Save'}
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                    padding: '8px 14px', borderRadius: '8px',
                                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                    color: '#94a3b8', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                                                }}
                                            >
                                                <X size={14} />
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleEdit(project)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                    padding: '8px 14px', borderRadius: '8px',
                                                    background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
                                                    color: '#3b82f6', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                <Edit size={14} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(project.id)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                    padding: '8px 14px', borderRadius: '8px',
                                                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                                                    color: '#ef4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* ── EDIT FORM or VIEW ── */}
                            {isEditing && editData ? (
                                <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        {/* Row 1 */}
                                        <div>
                                            <label style={labelStyle}>Project Name <span style={{ color: '#ef4444' }}>*</span></label>
                                            <input type="text" value={editData.name || ''} onChange={(e) => setEditData({ ...editData, name: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>NPM Package Filename</label>
                                            <input type="text" value={editData.filename || ''} onChange={(e) => setEditData({ ...editData, filename: e.target.value })} style={{ ...inputStyle, fontFamily: 'monospace' }} />
                                        </div>
                                        {/* Row 2 */}
                                        <div>
                                            <label style={labelStyle}>Version</label>
                                            <input type="text" value={editData.version || ''} onChange={(e) => setEditData({ ...editData, version: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Downloads / Week</label>
                                            <input type="text" value={editData.downloads || ''} onChange={(e) => setEditData({ ...editData, downloads: e.target.value })} style={inputStyle} />
                                        </div>
                                        {/* Row 3 */}
                                        <div>
                                            <label style={labelStyle}>GitHub URL</label>
                                            <input type="url" value={editData.githubUrl || ''} onChange={(e) => setEditData({ ...editData, githubUrl: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Demo URL</label>
                                            <input type="url" value={editData.demoUrl || ''} onChange={(e) => setEditData({ ...editData, demoUrl: e.target.value })} style={inputStyle} />
                                        </div>
                                        {/* Row 4 */}
                                        <div>
                                            <label style={labelStyle}>Status</label>
                                            <select value={editData.status || 'active'} onChange={(e) => setEditData({ ...editData, status: e.target.value as "active" | "in-progress" | "archived" })} style={{ ...inputStyle, cursor: 'pointer' }}>
                                                <option value="active">Active</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="archived">Archived</option>
                                                <option value="coming-soon">Coming Soon</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Stars &amp; Forks</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                <input type="number" value={editData.stars || 0} onChange={(e) => setEditData({ ...editData, stars: parseInt(e.target.value) || 0 })} style={inputStyle} placeholder="Stars" />
                                                <input type="number" value={editData.forks || 0} onChange={(e) => setEditData({ ...editData, forks: parseInt(e.target.value) || 0 })} style={inputStyle} placeholder="Forks" />
                                            </div>
                                        </div>
                                        {/* Featured */}
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{
                                                display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                                                padding: '12px 16px', borderRadius: '8px',
                                                background: editData.featured ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${editData.featured ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.08)'}`,
                                            }}>
                                                <input type="checkbox" checked={editData.featured || false} onChange={(e) => setEditData({ ...editData, featured: e.target.checked })} style={{ width: '16px', height: '16px', accentColor: '#f59e0b', cursor: 'pointer' }} />
                                                <span style={{ fontSize: '14px', fontWeight: 600, color: editData.featured ? '#f59e0b' : '#f8fafc' }}>⭐ Featured Project</span>
                                            </label>
                                        </div>
                                        {/* Description */}
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={labelStyle}>Description <span style={{ color: '#ef4444' }}>*</span></label>
                                            <textarea value={editData.description || ''} onChange={(e) => setEditData({ ...editData, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} />
                                        </div>
                                        {/* Technologies */}
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <TagListField
                                                label="Technologies"
                                                hint=" Add technologies used"
                                                value={editData.technologies || []}
                                                onChange={(items) => setEditData({ ...editData, technologies: items })}
                                                placeholder="e.g. React, Node.js"
                                            />
                                        </div>
                                        {/* Features */}
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <TagListField
                                                label="Key Features"
                                                hint=" Add key features"
                                                value={editData.features || []}
                                                onChange={(items) => setEditData({ ...editData, features: items })}
                                                placeholder="e.g. Responsive Design"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* ── Description ── */}
                                    <p style={{
                                        fontSize: '14px', color: '#94a3b8', lineHeight: '1.6',
                                        margin: '0 0 16px',
                                        overflow: 'hidden',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                    }}>
                                        {project.description}
                                    </p>

                                    {/* ── Tech stack ── */}
                                    {project.technologies && project.technologies.length > 0 && (
                                        <div style={{ marginBottom: '14px' }}>
                                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
                                                Tech Stack
                                            </p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {project.technologies.map((tech, i) => (
                                                    <span key={i} style={{
                                                        padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                                                        color: '#06f9f9', background: 'rgba(6,249,249,0.08)',
                                                        border: '1px solid rgba(6,249,249,0.2)',
                                                    }}>
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Key Features ── */}
                                    {project.features && project.features.length > 0 && (
                                        <div style={{ marginBottom: '16px' }}>
                                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
                                                Key Features
                                            </p>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                                                {project.features.map((feat, i) => (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: '#cbd5e1' }}>
                                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#06f9f9', flexShrink: 0, boxShadow: '0 0 6px #06f9f9' }} />
                                                        {feat}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Links + Stats row ── */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        flexWrap: 'wrap', gap: '12px',
                                        paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)',
                                    }}>
                                        {/* Links */}
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {project.githubUrl && (
                                                <a
                                                    href={project.githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                        padding: '7px 14px', borderRadius: '8px', textDecoration: 'none',
                                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                        color: '#cbd5e1', fontSize: '13px', fontWeight: 500,
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    <Github size={14} />
                                                    GitHub
                                                </a>
                                            )}
                                            {project.demoUrl && (
                                                <a
                                                    href={project.demoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                        padding: '7px 14px', borderRadius: '8px', textDecoration: 'none',
                                                        background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
                                                        color: '#3b82f6', fontSize: '13px', fontWeight: 600,
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    <ExternalLink size={14} />
                                                    Live Demo
                                                </a>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        <div style={{ display: 'flex', gap: '14px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#94a3b8' }}>
                                                <Star size={13} fill="#f59e0b" color="#f59e0b" />
                                                {project.stars}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#94a3b8' }}>
                                                <GitFork size={13} color="#64748b" />
                                                {project.forks}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )
                })}
            </div>

            {/* ── Confirm Delete Dialog ── */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
                title="Delete Project"
                message="Are you sure you want to delete this project? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                type="delete"
            />
        </div>
    )
}

export default ProjectsTab

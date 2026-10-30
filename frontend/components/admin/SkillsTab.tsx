'use client'

import React, { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Code2,
    Database,
    Cloud,
    Wrench,
    Plus,
    Trash2,
    Edit,
    Save,
    X,
    Sparkles,
    Check,
    Layers,
    ChevronRight,
    Sliders,
    Eye
} from 'lucide-react'

export interface Skill {
    name: string
    level: number
    years: number
}

export interface SkillCategory {
    title: string
    skills: Skill[]
}

interface SkillsTabProps {
    skills: Record<string, SkillCategory>
    onUpdateCategory: (category: string, data: SkillCategory) => void
    onAddSkill: (category: string, skill: Skill) => void
}

// 5 Core categories exactly matching the main portfolio page (SkillsSection.tsx)
const CORE_CATEGORIES = [
    {
        key: 'frontend',
        icon: Code2,
        color: '#06f9f9',
        defaultTitle: 'Frontend Development',
        description: 'User Interface & Experience'
    },
    {
        key: 'backend',
        icon: Database,
        color: '#ff00ff',
        defaultTitle: 'Backend Development',
        description: 'Server & API Development'
    },
    {
        key: 'database',
        icon: Database,
        color: '#2de2e6',
        defaultTitle: 'Database Management',
        description: 'Data Storage & Management'
    },
    {
        key: 'cloud',
        icon: Cloud,
        color: '#00ff88',
        defaultTitle: 'Cloud & DevOps',
        description: 'Infrastructure & Deployment'
    },
    {
        key: 'tools',
        icon: Wrench,
        color: '#ffaa00',
        defaultTitle: 'Tools & Others',
        description: 'Development Tools & Utilities'
    }
]

// Level mapping matching the main portfolio page (SkillsSection.tsx)
const getSkillLevel = (level: number) => {
    if (level >= 90) return { label: 'Expert', color: '#00ff88', bg: 'rgba(0, 255, 136, 0.15)', border: 'rgba(0, 255, 136, 0.4)' }
    if (level >= 80) return { label: 'Advanced', color: '#06f9f9', bg: 'rgba(6, 249, 249, 0.15)', border: 'rgba(6, 249, 249, 0.4)' }
    if (level >= 70) return { label: 'Intermediate', color: '#ffaa00', bg: 'rgba(255, 170, 0, 0.15)', border: 'rgba(255, 170, 0, 0.4)' }
    return { label: 'Beginner', color: '#ff00ff', bg: 'rgba(255, 0, 255, 0.15)', border: 'rgba(255, 0, 255, 0.4)' }
}

const SkillsTab = ({ skills = {}, onUpdateCategory, onAddSkill }: SkillsTabProps) => {
    // Current active category (default to frontend)
    const [activeCategory, setActiveCategory] = useState<string>('frontend')

    // Editing category title state
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [editedCategoryTitle, setEditedCategoryTitle] = useState('')

    // Inline skill editing
    const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(null)
    const [editingSkillData, setEditingSkillData] = useState<Skill | null>(null)

    // New Skill Form State
    const [newSkill, setNewSkill] = useState<Skill>({
        name: '',
        level: 85,
        years: 2
    })
    const [showAddForm, setShowAddForm] = useState(false)

    // Add Custom Category Form State
    const [showAddCategory, setShowAddCategory] = useState(false)
    const [newCategoryKey, setNewCategoryKey] = useState('')
    const [newCategoryTitle, setNewCategoryTitle] = useState('')

    // Delete Confirmation
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean
        category: string | null
        index: number | null
        skillName?: string
    }>({ isOpen: false, category: null, index: null })

    // Merge core categories with any custom categories present in skills
    const existingKeys = Object.keys(skills)
    const allCategoryKeys = Array.from(new Set([...CORE_CATEGORIES.map(c => c.key), ...existingKeys]))

    const getCategoryMeta = (key: string) => {
        const found = CORE_CATEGORIES.find(c => c.key === key)
        if (found) return found
        return {
            key,
            icon: Layers,
            color: '#a855f7',
            defaultTitle: key.charAt(0).toUpperCase() + key.slice(1),
            description: 'Custom Technical Skills'
        }
    }

    const currentMeta = getCategoryMeta(activeCategory)
    const currentCategoryData = skills[activeCategory] || {
        title: currentMeta.defaultTitle,
        skills: []
    }

    // Handlers
    const handleSelectCategory = (key: string) => {
        setActiveCategory(key)
        setIsEditingTitle(false)
        setEditingSkillIndex(null)
        setShowAddForm(false)
    }

    const handleInitializeCategory = (key: string) => {
        const meta = getCategoryMeta(key)
        onUpdateCategory(key, {
            title: meta.defaultTitle,
            skills: []
        })
    }

    const handleSaveTitle = () => {
        if (!editedCategoryTitle.trim()) return
        const updated = {
            ...currentCategoryData,
            title: editedCategoryTitle.trim()
        }
        onUpdateCategory(activeCategory, updated)
        setIsEditingTitle(false)
    }

    const handleCreateCustomCategory = () => {
        const key = newCategoryKey.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
        const title = newCategoryTitle.trim()
        if (key && title) {
            onUpdateCategory(key, { title, skills: [] })
            setActiveCategory(key)
            setNewCategoryKey('')
            setNewCategoryTitle('')
            setShowAddCategory(false)
        }
    }

    const handleAddNewSkill = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newSkill.name.trim()) return

        onAddSkill(activeCategory, {
            name: newSkill.name.trim(),
            level: Number(newSkill.level) || 50,
            years: Number(newSkill.years) || 1
        })

        setNewSkill({ name: '', level: 85, years: 2 })
        setShowAddForm(false)
    }

    const handleStartEditSkill = (index: number) => {
        setEditingSkillIndex(index)
        setEditingSkillData({ ...currentCategoryData.skills[index] })
    }

    const handleSaveEditSkill = () => {
        if (editingSkillIndex === null || !editingSkillData) return
        const updatedSkills = [...currentCategoryData.skills]
        updatedSkills[editingSkillIndex] = {
            name: editingSkillData.name.trim(),
            level: Number(editingSkillData.level) || 50,
            years: Number(editingSkillData.years) || 1
        }
        onUpdateCategory(activeCategory, {
            ...currentCategoryData,
            skills: updatedSkills
        })
        setEditingSkillIndex(null)
        setEditingSkillData(null)
    }

    const handleDeleteSkill = (index: number, skillName: string) => {
        setDeleteConfirm({
            isOpen: true,
            category: activeCategory,
            index,
            skillName
        })
    }

    const confirmDeleteSkill = () => {
        const { category, index } = deleteConfirm
        if (!category || index === null || index === undefined) return
        const targetCategory = skills[category]
        if (!targetCategory) return

        const updatedSkills = targetCategory.skills.filter((_, i) => i !== index)
        onUpdateCategory(category, {
            ...targetCategory,
            skills: updatedSkills
        })
        setDeleteConfirm({ isOpen: false, category: null, index: null })
    }

    const newSkillLevelMeta = getSkillLevel(newSkill.level)
    const editingLevelMeta = editingSkillData ? getSkillLevel(editingSkillData.level) : null

    return (
        <div className="admin-skills-manager">
            {/* Top Header */}
            <div className="admin-section-header">
                <div className="admin-section-title-wrapper">
                    <Sliders className="text-primary" />
                    <div>
                        <h2 className="admin-section-title">Skills &amp; Technical Expertise</h2>
                        <p style={{ color: '#94a3b8', fontSize: '13px', margin: '2px 0 0' }}>
                            Configure skills exactly as they appear in the main portfolio&apos;s interactive explorer.
                        </p>
                    </div>
                </div>
                <div className="admin-section-actions">
                    <button
                        onClick={() => setShowAddCategory(!showAddCategory)}
                        className="admin-btn admin-btn-gray"
                    >
                        <Plus size={16} />
                        New Category
                    </button>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="admin-btn admin-btn-green"
                    >
                        <Plus size={16} />
                        Add Skill to {currentMeta.defaultTitle.split(' ')[0]}
                    </button>
                </div>
            </div>

            {/* Custom Category Creator Drawer */}
            <AnimatePresence>
                {showAddCategory && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="admin-card"
                        style={{ marginBottom: '20px', border: '1px solid rgba(168, 85, 247, 0.4)' }}
                    >
                        <h3 className="admin-card-title" style={{ color: '#c084fc' }}>Create Custom Skill Category</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label className="admin-form-label">Category Key (URL slug e.g. &quot;ai-ml&quot;)</label>
                                <input
                                    type="text"
                                    value={newCategoryKey}
                                    onChange={(e) => setNewCategoryKey(e.target.value)}
                                    placeholder="e.g. mobile, ai-ml"
                                    className="admin-form-input"
                                />
                            </div>
                            <div>
                                <label className="admin-form-label">Display Title</label>
                                <input
                                    type="text"
                                    value={newCategoryTitle}
                                    onChange={(e) => setNewCategoryTitle(e.target.value)}
                                    placeholder="e.g. AI &amp; Machine Learning"
                                    className="admin-form-input"
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={handleCreateCustomCategory}
                                disabled={!newCategoryKey || !newCategoryTitle}
                                className="admin-btn admin-btn-green"
                            >
                                <Check size={16} /> Save Category
                            </button>
                            <button
                                onClick={() => setShowAddCategory(false)}
                                className="admin-btn admin-btn-gray"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Portfolio Matching Category Tabs */}
            <div className="admin-skills-category-tabs">
                {allCategoryKeys.map((key) => {
                    const meta = getCategoryMeta(key)
                    const Icon = meta.icon
                    const isActive = activeCategory === key
                    const count = skills[key]?.skills?.length || 0
                    const exists = Boolean(skills[key])

                    return (
                        <button
                            key={key}
                            onClick={() => handleSelectCategory(key)}
                            className={`admin-skill-tab-btn ${isActive ? 'active' : ''}`}
                            style={{
                                '--cat-color': meta.color,
                            } as React.CSSProperties}
                        >
                            <div className="admin-skill-tab-icon" style={{ color: meta.color }}>
                                <Icon size={18} />
                            </div>
                            <div className="admin-skill-tab-info">
                                <span className="admin-skill-tab-title">{meta.defaultTitle}</span>
                                <span className="admin-skill-tab-sub">
                                    {exists ? `${count} skills` : 'Not initialized'}
                                </span>
                            </div>
                            <span className="admin-skill-tab-badge" style={{ backgroundColor: `${meta.color}20`, color: meta.color }}>
                                {count}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Active Category Header Bar */}
            <div className="admin-card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '10px',
                                background: `${currentMeta.color}15`,
                                border: `1px solid ${currentMeta.color}40`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: currentMeta.color
                            }}
                        >
                            <currentMeta.icon size={22} />
                        </div>
                        <div>
                            {isEditingTitle ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                        type="text"
                                        value={editedCategoryTitle}
                                        onChange={(e) => setEditedCategoryTitle(e.target.value)}
                                        className="admin-form-input"
                                        style={{ height: '36px', width: '280px' }}
                                    />
                                    <button onClick={handleSaveTitle} className="admin-btn-icon edit" title="Save Title">
                                        <Save size={16} />
                                    </button>
                                    <button onClick={() => setIsEditingTitle(false)} className="admin-btn-icon delete" title="Cancel">
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                                        {currentCategoryData.title || currentMeta.defaultTitle}
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setEditedCategoryTitle(currentCategoryData.title || currentMeta.defaultTitle)
                                            setIsEditingTitle(true)
                                        }}
                                        className="admin-btn-icon edit"
                                        title="Rename Category Title"
                                    >
                                        <Edit size={14} />
                                    </button>
                                </div>
                            )}
                            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '12px' }}>
                                Category key: <code style={{ color: currentMeta.color }}>{activeCategory}</code> &bull; {currentMeta.description}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        {!skills[activeCategory] && (
                            <button
                                onClick={() => handleInitializeCategory(activeCategory)}
                                className="admin-btn admin-btn-blue"
                            >
                                <Sparkles size={16} /> Initialize Category in DB
                            </button>
                        )}
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="admin-btn admin-btn-green"
                        >
                            <Plus size={16} /> Add Skill
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Skill Form Modal / Panel */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="admin-card"
                        style={{
                            marginBottom: '24px',
                            border: `1px solid ${currentMeta.color}50`,
                            background: 'rgba(15, 23, 42, 0.95)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Sparkles size={18} style={{ color: currentMeta.color }} />
                                <h3 className="admin-card-title" style={{ margin: 0 }}>
                                    Add New Skill to {currentCategoryData.title || currentMeta.defaultTitle}
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="admin-btn-icon delete"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleAddNewSkill}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '18px' }}>
                                <div>
                                    <label className="admin-form-label">
                                        Skill Name * (e.g. React 19, Python, PostgreSQL, Docker)
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newSkill.name}
                                        onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                                        placeholder="e.g. Next.js App Router"
                                        className="admin-form-input"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="admin-form-label">Years of Experience</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="30"
                                        value={newSkill.years}
                                        onChange={(e) => setNewSkill({ ...newSkill, years: Number(e.target.value) })}
                                        className="admin-form-input"
                                    />
                                </div>
                            </div>

                            {/* Level selector matching the main page badges */}
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label className="admin-form-label" style={{ margin: 0 }}>
                                        Proficiency Level: <strong>{newSkill.level}%</strong> &mdash; Main Page Badge:
                                        <span
                                            style={{
                                                marginLeft: '8px',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                color: newSkillLevelMeta.color,
                                                backgroundColor: newSkillLevelMeta.bg,
                                                border: `1px solid ${newSkillLevelMeta.border}`
                                            }}
                                        >
                                            {newSkillLevelMeta.label}
                                        </span>
                                    </label>
                                </div>

                                <input
                                    type="range"
                                    min="20"
                                    max="100"
                                    value={newSkill.level}
                                    onChange={(e) => setNewSkill({ ...newSkill, level: Number(e.target.value) })}
                                    style={{ width: '100%', accentColor: newSkillLevelMeta.color, cursor: 'pointer' }}
                                />

                                {/* Level presets */}
                                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                                    {[
                                        { label: 'Beginner (60%)', val: 60, color: '#ff00ff' },
                                        { label: 'Intermediate (75%)', val: 75, color: '#ffaa00' },
                                        { label: 'Advanced (85%)', val: 85, color: '#06f9f9' },
                                        { label: 'Expert (95%)', val: 95, color: '#00ff88' },
                                    ].map((preset) => (
                                        <button
                                            type="button"
                                            key={preset.val}
                                            onClick={() => setNewSkill({ ...newSkill, level: preset.val })}
                                            style={{
                                                background: newSkill.level === preset.val ? `${preset.color}30` : 'rgba(30, 41, 59, 0.7)',
                                                border: `1px solid ${newSkill.level === preset.val ? preset.color : '#334155'}`,
                                                color: newSkill.level === preset.val ? preset.color : '#94a3b8',
                                                borderRadius: '6px',
                                                padding: '4px 10px',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Live Card Preview (matches main page SkillsSection.tsx) */}
                            <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(2, 6, 23, 0.6)', borderRadius: '10px', border: '1px dashed #334155' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '12px', marginBottom: '10px' }}>
                                    <Eye size={14} /> Main Page Live Card Preview:
                                </div>
                                <div
                                    style={{
                                        maxWidth: '320px',
                                        background: 'rgba(15, 23, 42, 0.9)',
                                        border: `1px solid ${newSkillLevelMeta.border}`,
                                        borderRadius: '10px',
                                        padding: '14px 18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        boxShadow: `0 0 15px ${newSkillLevelMeta.color}15`
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span
                                            style={{
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                backgroundColor: newSkillLevelMeta.color,
                                                boxShadow: `0 0 8px ${newSkillLevelMeta.color}`
                                            }}
                                        />
                                        <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '14px' }}>
                                            {newSkill.name || 'Skill Name'}
                                        </span>
                                    </div>
                                    <span
                                        style={{
                                            color: newSkillLevelMeta.color,
                                            backgroundColor: newSkillLevelMeta.bg,
                                            border: `1px solid ${newSkillLevelMeta.border}`,
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: 700
                                        }}
                                    >
                                        {newSkillLevelMeta.label}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="admin-btn admin-btn-green" disabled={!newSkill.name.trim()}>
                                    <Plus size={16} /> Save Skill to {currentMeta.defaultTitle.split(' ')[0]}
                                </button>
                                <button type="button" onClick={() => setShowAddForm(false)} className="admin-btn admin-btn-gray">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Current Category Skills List */}
            <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className="admin-card-title" style={{ margin: 0 }}>
                        {currentCategoryData.title || currentMeta.defaultTitle} Skills ({currentCategoryData.skills?.length || 0})
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                        Click any skill to edit or delete
                    </span>
                </div>

                {(!currentCategoryData.skills || currentCategoryData.skills.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                        <currentMeta.icon size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                        <p style={{ margin: '0 0 12px' }}>No skills added in this category yet.</p>
                        <button onClick={() => setShowAddForm(true)} className="admin-btn admin-btn-green">
                            <Plus size={16} /> Add First Skill
                        </button>
                    </div>
                ) : (
                    <div className="admin-skills-display-grid">
                        {currentCategoryData.skills.map((skill, index) => {
                            const isEditing = editingSkillIndex === index
                            const levelMeta = getSkillLevel(skill.level)

                            if (isEditing && editingSkillData) {
                                return (
                                    <div
                                        key={index}
                                        style={{
                                            gridColumn: '1 / -1',
                                            background: 'rgba(30, 41, 59, 0.9)',
                                            border: '1px solid rgba(56, 189, 248, 0.5)',
                                            borderRadius: '10px',
                                            padding: '16px'
                                        }}
                                    >
                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                            <div>
                                                <label className="admin-form-label">Skill Name</label>
                                                <input
                                                    type="text"
                                                    value={editingSkillData.name}
                                                    onChange={(e) => setEditingSkillData({ ...editingSkillData, name: e.target.value })}
                                                    className="admin-form-input"
                                                />
                                            </div>
                                            <div>
                                                <label className="admin-form-label">
                                                    Level ({editingSkillData.level}%) &mdash; {editingLevelMeta?.label}
                                                </label>
                                                <input
                                                    type="range"
                                                    min="20"
                                                    max="100"
                                                    value={editingSkillData.level}
                                                    onChange={(e) => setEditingSkillData({ ...editingSkillData, level: Number(e.target.value) })}
                                                    style={{ width: '100%', accentColor: editingLevelMeta?.color || '#06f9f9', marginTop: '8px' }}
                                                />
                                            </div>
                                            <div>
                                                <label className="admin-form-label">Years</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={editingSkillData.years}
                                                    onChange={(e) => setEditingSkillData({ ...editingSkillData, years: Number(e.target.value) })}
                                                    className="admin-form-input"
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={handleSaveEditSkill} className="admin-btn admin-btn-green">
                                                <Save size={14} /> Save
                                            </button>
                                            <button onClick={() => setEditingSkillIndex(null)} className="admin-btn admin-btn-gray">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )
                            }

                            return (
                                <div
                                    key={index}
                                    className="admin-skill-card-item"
                                    style={{
                                        '--badge-color': levelMeta.color,
                                    } as React.CSSProperties}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span
                                                style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    backgroundColor: levelMeta.color,
                                                    boxShadow: `0 0 6px ${levelMeta.color}`
                                                }}
                                            />
                                            <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '14px' }}>
                                                {skill.name}
                                            </span>
                                        </div>
                                        <span
                                            style={{
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                color: levelMeta.color,
                                                backgroundColor: levelMeta.bg,
                                                border: `1px solid ${levelMeta.border}`,
                                                padding: '2px 6px',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            {levelMeta.label}
                                        </span>
                                    </div>

                                    {/* Progress bar */}
                                    <div style={{ width: '100%', height: '5px', background: 'rgba(51, 65, 85, 0.6)', borderRadius: '3px', overflow: 'hidden', margin: '8px 0' }}>
                                        <div
                                            style={{
                                                width: `${skill.level}%`,
                                                height: '100%',
                                                backgroundColor: levelMeta.color,
                                                borderRadius: '3px'
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                            {skill.years} {skill.years === 1 ? 'year' : 'years'} &bull; {skill.level}%
                                        </span>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button
                                                onClick={() => handleStartEditSkill(index)}
                                                className="admin-btn-icon edit"
                                                title="Edit Skill"
                                            >
                                                <Edit size={13} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSkill(index, skill.name)}
                                                className="admin-btn-icon delete"
                                                title="Delete Skill"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, category: null, index: null })}
                title="Delete Skill"
                message={`Are you sure you want to remove "${deleteConfirm.skillName || 'this skill'}" from ${currentCategoryData.title || currentMeta.defaultTitle}? This will update the main portfolio immediately.`}
                confirmText="Delete Skill"
                cancelText="Cancel"
                onConfirm={confirmDeleteSkill}
                type="delete"
            />
        </div>
    )
}

export default SkillsTab

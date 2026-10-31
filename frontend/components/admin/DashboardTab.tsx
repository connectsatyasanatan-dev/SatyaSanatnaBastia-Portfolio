'use client'

import { motion } from 'framer-motion'
import {
    BarChart3, Users, FileText, Star, MessageSquare, Briefcase, Mail, Sparkles,
    ArrowUpRight, Plus, CheckCircle2, ShieldAlert, Activity
} from 'lucide-react'

interface DashboardTabProps {
    stats: {
        projects: number
        featured_projects: number
        experience_entries: number
        testimonials: number
        blog_posts: number
        skills_categories: number
        total_skills: number
        contact_messages?: number
        ai_leads?: number
    }
    onNavigateTab?: (tab: string) => void
}

const DashboardTab = ({ stats, onNavigateTab }: DashboardTabProps) => {
    const statCards = [
        {
            title: 'Total Projects',
            value: stats.projects,
            icon: FileText,
            colorClass: 'blue',
            accentColor: '#3b82f6',
            targetTab: 'projects',
            description: `${stats.featured_projects} featured in hero`
        },
        {
            title: 'Experience Entries',
            value: stats.experience_entries,
            icon: Briefcase,
            colorClass: 'green',
            accentColor: '#10b981',
            targetTab: 'experience',
            description: 'Career positions'
        },
        {
            title: 'Skills & Tech',
            value: stats.total_skills,
            icon: Star,
            colorClass: 'purple',
            accentColor: '#a855f7',
            targetTab: 'skills',
            description: `${stats.skills_categories} categories active`
        },
        {
            title: 'Testimonials',
            value: stats.testimonials,
            icon: MessageSquare,
            colorClass: 'yellow',
            accentColor: '#f59e0b',
            targetTab: 'testimonials',
            description: 'Endorsements & reviews'
        },
        {
            title: 'Blog Posts',
            value: stats.blog_posts,
            icon: Users,
            colorClass: 'red',
            accentColor: '#ef4444',
            targetTab: 'blog',
            description: 'Articles published'
        },
        ...(typeof stats.contact_messages === 'number' ? [{
            title: 'Contact Messages',
            value: stats.contact_messages,
            icon: Mail,
            colorClass: 'teal',
            accentColor: '#06f9f9',
            targetTab: 'messages',
            description: 'Inbound inquiries'
        }] : []),
        ...(typeof stats.ai_leads === 'number' ? [{
            title: 'AI Leads Captured',
            value: stats.ai_leads,
            icon: Sparkles,
            colorClass: 'purple',
            accentColor: '#ec4899',
            targetTab: 'messages',
            description: 'Zentara AI chat leads'
        }] : [])
    ]

    return (
        <div className="admin-dashboard-container">
            {/* Top Section Header */}
            <div className="admin-section-header">
                <div className="admin-section-title-wrapper">
                    <div className="admin-section-icon-badge" style={{ background: 'linear-gradient(135deg, rgba(6, 249, 249, 0.15), rgba(59, 130, 246, 0.15))', color: '#06f9f9' }}>
                        <Activity size={22} />
                    </div>
                    <div>
                        <h2 className="admin-section-title">Dashboard Overview</h2>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                            Real-time metrics, content status, and quick management controls.
                        </p>
                    </div>
                </div>
            </div>

            {/* Metrics Cards Grid */}
            <div className="admin-stats-grid">
                {statCards.map((card, index) => {
                    const IconComponent = card.icon
                    return (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => onNavigateTab && card.targetTab && onNavigateTab(card.targetTab)}
                            className="admin-stat-card"
                            style={{ cursor: onNavigateTab ? 'pointer' : 'default' }}
                        >
                            <div className="admin-stat-header">
                                <div className={`admin-stat-icon ${card.colorClass}`}>
                                    <IconComponent size={22} />
                                </div>
                                <div className="admin-stat-value-wrapper">
                                    <p className="admin-stat-value">{card.value}</p>
                                    <p className="admin-stat-description">{card.description}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                                <h3 className="admin-stat-title">{card.title}</h3>
                                {onNavigateTab && (
                                    <span style={{ color: '#64748b', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}>
                                        <ArrowUpRight size={15} />
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Two Column Layout for Quick Actions & Portfolio Health */}
            <div className="admin-dashboard-widgets-grid">
                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="admin-card"
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3 className="admin-card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={18} className="text-primary" /> Quick Actions
                        </h3>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Shortcut navigation</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                            { title: 'Add New Project', desc: 'Publish a new repository or enterprise build', tab: 'projects', color: '#3b82f6' },
                            { title: 'Update Skills & Tech', desc: 'Adjust proficiency levels and badge categories', tab: 'skills', color: '#06f9f9' },
                            { title: 'Publish Blog Post', desc: 'Draft tech insights and engineering thoughts', tab: 'blog', color: '#a855f7' },
                            { title: 'Review Inbound Messages', desc: 'Inspect contact messages and captured AI leads', tab: 'messages', color: '#ec4899' }
                        ].map((action, i) => (
                            <button
                                key={i}
                                onClick={() => onNavigateTab && onNavigateTab(action.tab)}
                                className="admin-quick-action-btn"
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: action.color, boxShadow: `0 0 8px ${action.color}` }} />
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '14px' }}>{action.title}</div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{action.desc}</div>
                                    </div>
                                </div>
                                <ArrowUpRight size={16} style={{ color: '#64748b', flexShrink: 0 }} />
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Portfolio Health */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="admin-card"
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3 className="admin-card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle2 size={18} style={{ color: '#10b981' }} /> System Status &amp; Integrity
                        </h3>
                        <span style={{ fontSize: '12px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '999px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            Operational
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ color: '#d1d5db', fontSize: '13px', fontWeight: 500 }}>Profile Completeness</span>
                                <span style={{ color: '#10b981', fontWeight: 700, fontSize: '13px' }}>98%</span>
                            </div>
                            <div style={{ width: '100%', background: 'rgba(55, 65, 81, 0.4)', borderRadius: '999px', height: '7px', overflow: 'hidden' }}>
                                <div style={{ background: 'linear-gradient(90deg, #10b981, #06f9f9)', height: '100%', borderRadius: '999px', width: '98%' }} />
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ color: '#d1d5db', fontSize: '13px', fontWeight: 500 }}>AIO &amp; GEO Optimization Index</span>
                                <span style={{ color: '#06f9f9', fontWeight: 700, fontSize: '13px' }}>100% Verified</span>
                            </div>
                            <div style={{ width: '100%', background: 'rgba(55, 65, 81, 0.4)', borderRadius: '999px', height: '7px', overflow: 'hidden' }}>
                                <div style={{ background: 'linear-gradient(90deg, #06f9f9, #3b82f6)', height: '100%', borderRadius: '999px', width: '100%' }} />
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ color: '#d1d5db', fontSize: '13px', fontWeight: 500 }}>Content Freshness</span>
                                <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '13px' }}>High</span>
                            </div>
                            <div style={{ width: '100%', background: 'rgba(55, 65, 81, 0.4)', borderRadius: '999px', height: '7px', overflow: 'hidden' }}>
                                <div style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444)', height: '100%', borderRadius: '999px', width: '90%' }} />
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Database Engine</span>
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>PostgreSQL &bull; Production</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default DashboardTab

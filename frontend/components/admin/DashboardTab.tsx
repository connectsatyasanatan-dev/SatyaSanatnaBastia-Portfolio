'use client'

import { motion } from 'framer-motion'
import { BarChart3, Users, FileText, Star, MessageSquare, Briefcase, Mail, Sparkles } from 'lucide-react'

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
}

const DashboardTab = ({ stats }: DashboardTabProps) => {
    const statCards = [
        {
            title: 'Total Projects',
            value: stats.projects,
            icon: FileText,
            colorClass: 'blue',
            description: `${stats.featured_projects} featured`
        },
        {
            title: 'Experience Entries',
            value: stats.experience_entries,
            icon: Briefcase,
            colorClass: 'green',
            description: 'Work history'
        },
        {
            title: 'Skills',
            value: stats.total_skills,
            icon: Star,
            colorClass: 'purple',
            description: `${stats.skills_categories} categories`
        },
        {
            title: 'Testimonials',
            value: stats.testimonials,
            icon: MessageSquare,
            colorClass: 'yellow',
            description: 'Client reviews'
        },
        {
            title: 'Blog Posts',
            value: stats.blog_posts,
            icon: Users,
            colorClass: 'red',
            description: 'Published articles'
        },
        ...(typeof stats.contact_messages === 'number' ? [{
            title: 'Contact Messages',
            value: stats.contact_messages,
            icon: Mail,
            colorClass: 'teal',
            description: 'From portfolio form'
        }] : []),
        ...(typeof stats.ai_leads === 'number' ? [{
            title: 'AI Leads Captured',
            value: stats.ai_leads,
            icon: Sparkles,
            colorClass: 'purple',
            description: 'Recruiters & Clients from chat'
        }] : [])
    ]

    return (
        <div>
            <div className="admin-section-header">
                <div className="admin-section-title-wrapper">
                    <BarChart3 />
                    <h2 className="admin-section-title">Dashboard Overview</h2>
                </div>
            </div>

            <div className="admin-stats-grid">
                {statCards.map((card, index) => {
                    const IconComponent = card.icon
                    return (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="admin-stat-card"
                        >
                            <div className="admin-stat-header">
                                <div className={`admin-stat-icon ${card.colorClass}`}>
                                    <IconComponent />
                                </div>
                                <div className="admin-stat-value-wrapper">
                                    <p className="admin-stat-value">{card.value}</p>
                                    <p className="admin-stat-description">{card.description}</p>
                                </div>
                            </div>
                            <h3 className="admin-stat-title">{card.title}</h3>
                        </motion.div>
                    )
                })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="admin-card"
                >
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button style={{ width: '100%', textAlign: 'left', padding: '12px', background: 'rgba(55, 65, 81, 0.5)', borderRadius: '8px', border: 'none', color: '#e4e7eb', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <div style={{ fontWeight: '600' }}>Add New Project</div>
                            <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>Showcase your latest work</div>
                        </button>
                        <button style={{ width: '100%', textAlign: 'left', padding: '12px', background: 'rgba(55, 65, 81, 0.5)', borderRadius: '8px', border: 'none', color: '#e4e7eb', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <div style={{ fontWeight: '600' }}>Update Skills</div>
                            <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>Keep your expertise current</div>
                        </button>
                        <button style={{ width: '100%', textAlign: 'left', padding: '12px', background: 'rgba(55, 65, 81, 0.5)', borderRadius: '8px', border: 'none', color: '#e4e7eb', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <div style={{ fontWeight: '600' }}>Write Blog Post</div>
                            <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>Share your knowledge</div>
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="admin-card"
                >
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Portfolio Health</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ color: '#d1d5db' }}>Profile Completeness</span>
                                <span style={{ color: '#6ee7b7', fontWeight: '600' }}>95%</span>
                            </div>
                            <div style={{ width: '100%', background: 'rgba(55, 65, 81, 0.5)', borderRadius: '999px', height: '8px' }}>
                                <div style={{ background: '#10b981', height: '8px', borderRadius: '999px', width: '95%' }}></div>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ color: '#d1d5db' }}>Content Freshness</span>
                                <span style={{ color: '#fcd34d', fontWeight: '600' }}>Good</span>
                            </div>
                            <div style={{ width: '100%', background: 'rgba(55, 65, 81, 0.5)', borderRadius: '999px', height: '8px' }}>
                                <div style={{ background: '#f59e0b', height: '8px', borderRadius: '999px', width: '75%' }}></div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default DashboardTab
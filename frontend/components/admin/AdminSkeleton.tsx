'use client'

import React from 'react'
import Skeleton from '../Skeleton'

/* ─────────────────────────────────────────────────────────────
   1. Sidebar Skeleton
   ───────────────────────────────────────────────────────────── */
export const AdminSidebarSkeleton = () => {
    return (
        <div className="admin-sidebar-skeleton-wrapper" style={{ padding: '8px 12px' }}>
            {/* Header info skeleton */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 8px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Skeleton variant="circle" width={36} height={36} glow />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Skeleton variant="text" width="70%" height={12} />
                    <Skeleton variant="text" width="40%" height={10} />
                </div>
            </div>

            {/* Nav Groups */}
            {[
                { title: 'Overview', count: 2 },
                { title: 'Portfolio Work', count: 4 },
                { title: 'Engagement & Leads', count: 4 }
            ].map((group, gIdx) => (
                <div key={gIdx} style={{ marginBottom: '16px' }}>
                    <div style={{ padding: '0 8px 6px' }}>
                        <Skeleton variant="text" width="35%" height={10} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {Array.from({ length: group.count }).map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    border: '1px solid rgba(255, 255, 255, 0.03)'
                                }}
                            >
                                <Skeleton variant="circle" width={18} height={18} glow />
                                <Skeleton variant="text" width={`${55 + (i * 10) % 30}%`} height={12} />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────
   2. Dashboard Skeleton
   ───────────────────────────────────────────────────────────── */
export const DashboardSkeleton = () => {
    return (
        <div className="admin-skeleton-fade-in">
            {/* Section Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Skeleton variant="circle" width={32} height={32} glow />
                    <Skeleton variant="title" width={220} height={26} />
                </div>
                <Skeleton variant="rect" width={140} height={36} style={{ borderRadius: '8px' }} />
            </div>

            {/* Stat Cards Grid (7 cards) */}
            <div className="admin-stats-grid" style={{ marginBottom: '28px' }}>
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div
                        key={i}
                        className="admin-stat-card"
                        style={{
                            padding: '20px',
                            borderRadius: '14px',
                            background: 'rgba(30, 41, 59, 0.5)',
                            border: '1px solid rgba(255, 255, 255, 0.06)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                            <Skeleton variant="circle" width={42} height={42} glow />
                            <Skeleton variant="text" width={45} height={12} style={{ borderRadius: '999px' }} />
                        </div>
                        <Skeleton variant="text" width="60%" height={12} style={{ marginBottom: '8px' }} />
                        <Skeleton variant="title" width="45%" height={28} glow />
                    </div>
                ))}
            </div>

            {/* 2-Column Overview Widgets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '24px' }}>
                <div className="admin-card" style={{ padding: '24px', borderRadius: '14px' }}>
                    <Skeleton variant="title" width="40%" height={20} style={{ marginBottom: '20px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                <Skeleton variant="text" width="50%" height={14} style={{ marginBottom: '6px' }} />
                                <Skeleton variant="text" width="75%" height={11} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="admin-card" style={{ padding: '24px', borderRadius: '14px' }}>
                    <Skeleton variant="title" width="45%" height={20} style={{ marginBottom: '20px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <Skeleton variant="text" width="40%" height={12} />
                                    <Skeleton variant="text" width="15%" height={12} />
                                </div>
                                <Skeleton variant="rect" width="100%" height={8} style={{ borderRadius: '999px' }} glow />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────
   3. Analytics Skeleton
   ───────────────────────────────────────────────────────────── */
export const AnalyticsSkeleton = () => {
    return (
        <div className="admin-skeleton-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Skeleton variant="circle" width={32} height={32} glow />
                    <Skeleton variant="title" width={240} height={26} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Skeleton variant="rect" width={90} height={36} style={{ borderRadius: '8px' }} />
                    <Skeleton variant="rect" width={90} height={36} style={{ borderRadius: '8px' }} />
                </div>
            </div>

            {/* Metric counters */}
            <div className="admin-stats-grid" style={{ marginBottom: '28px' }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="admin-stat-card" style={{ padding: '20px', borderRadius: '14px' }}>
                        <Skeleton variant="text" width="50%" height={12} style={{ marginBottom: '10px' }} />
                        <Skeleton variant="title" width="60%" height={32} glow />
                    </div>
                ))}
            </div>

            {/* Big Chart Skeleton */}
            <div className="admin-card" style={{ padding: '24px', borderRadius: '14px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <Skeleton variant="title" width="30%" height={20} />
                    <Skeleton variant="rect" width={120} height={28} style={{ borderRadius: '6px' }} />
                </div>
                <div style={{ height: '260px', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '20px 0' }}>
                    {[40, 75, 55, 90, 65, 80, 45, 95, 70, 85, 60, 100].map((h, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '8px' }}>
                            <Skeleton variant="rect" width="100%" height={`${h}%`} style={{ borderRadius: '4px' }} glow />
                            <Skeleton variant="text" width="60%" height={10} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────
   4. Personal Info Form Skeleton
   ───────────────────────────────────────────────────────────── */
export const PersonalInfoSkeleton = () => {
    return (
        <div className="admin-skeleton-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Skeleton variant="circle" width={32} height={32} glow />
                    <Skeleton variant="title" width={220} height={26} />
                </div>
                <Skeleton variant="rect" width={130} height={38} style={{ borderRadius: '8px' }} glow />
            </div>

            <div className="admin-card" style={{ padding: '28px', borderRadius: '14px' }}>
                {/* Section 1 */}
                <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <Skeleton variant="title" width={160} height={16} style={{ marginBottom: '18px' }} />
                    <div className="admin-form-grid">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="admin-form-group">
                                <Skeleton variant="text" width="30%" height={12} style={{ marginBottom: '8px' }} />
                                <Skeleton variant="rect" width="100%" height={44} style={{ borderRadius: '8px' }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 2 */}
                <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <Skeleton variant="title" width={140} height={16} style={{ marginBottom: '18px' }} />
                    <div className="admin-form-grid">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="admin-form-group">
                                <Skeleton variant="text" width="30%" height={12} style={{ marginBottom: '8px' }} />
                                <Skeleton variant="rect" width="100%" height={44} style={{ borderRadius: '8px' }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resume Upload Card Skeleton */}
                <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                        <Skeleton variant="circle" width={36} height={36} glow />
                        <div style={{ flex: 1 }}>
                            <Skeleton variant="text" width="40%" height={14} style={{ marginBottom: '4px' }} />
                            <Skeleton variant="text" width="25%" height={11} />
                        </div>
                    </div>
                    <Skeleton variant="rect" width="100%" height={40} style={{ borderRadius: '8px' }} />
                </div>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────
   5. Skills Admin Skeleton (Matching 5 Core Categories)
   ───────────────────────────────────────────────────────────── */
export const SkillsAdminSkeleton = () => {
    return (
        <div className="admin-skeleton-fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Skeleton variant="circle" width={32} height={32} glow />
                    <Skeleton variant="title" width={260} height={26} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Skeleton variant="rect" width={120} height={38} style={{ borderRadius: '8px' }} />
                    <Skeleton variant="rect" width={140} height={38} style={{ borderRadius: '8px' }} glow />
                </div>
            </div>

            {/* Category Tab Pills (5 core categories) */}
            <div className="admin-skills-category-tabs" style={{ marginBottom: '24px' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="admin-skill-tab-btn"
                        style={{
                            padding: '14px 16px',
                            background: 'rgba(30, 41, 59, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}
                    >
                        <Skeleton variant="circle" width={36} height={36} glow />
                        <div style={{ flex: 1 }}>
                            <Skeleton variant="text" width="70%" height={14} style={{ marginBottom: '4px' }} />
                            <Skeleton variant="text" width="40%" height={11} />
                        </div>
                        <Skeleton variant="text" width={24} height={16} style={{ borderRadius: '999px' }} />
                    </div>
                ))}
            </div>

            {/* Skills Display Card */}
            <div className="admin-card" style={{ padding: '24px', borderRadius: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <Skeleton variant="title" width={200} height={20} />
                    <Skeleton variant="text" width={140} height={12} />
                </div>

                <div className="admin-skills-display-grid">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="admin-skill-card-item"
                            style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.6)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                    <Skeleton variant="circle" width={8} height={8} glow />
                                    <Skeleton variant="text" width="60%" height={14} />
                                </div>
                                <Skeleton variant="text" width={60} height={18} style={{ borderRadius: '4px' }} />
                            </div>
                            <Skeleton variant="rect" width="100%" height={6} style={{ borderRadius: '3px', margin: '10px 0' }} glow />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Skeleton variant="text" width="40%" height={11} />
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <Skeleton variant="circle" width={24} height={24} />
                                    <Skeleton variant="circle" width={24} height={24} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────
   6. Projects Card Grid Skeleton
   ───────────────────────────────────────────────────────────── */
export const ProjectsSkeleton = () => {
    return (
        <div className="admin-skeleton-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Skeleton variant="circle" width={32} height={32} glow />
                    <Skeleton variant="title" width={180} height={26} />
                </div>
                <Skeleton variant="rect" width={140} height={38} style={{ borderRadius: '8px' }} glow />
            </div>

            <div className="admin-items-grid">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="admin-item-card"
                        style={{ padding: '20px', borderRadius: '14px', background: 'rgba(30, 41, 59, 0.5)' }}
                    >
                        {/* Thumbnail placeholder */}
                        <Skeleton variant="rect" width="100%" height={150} style={{ borderRadius: '10px', marginBottom: '16px' }} glow />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <Skeleton variant="title" width="65%" height={18} />
                            <Skeleton variant="text" width={55} height={18} style={{ borderRadius: '999px' }} />
                        </div>
                        <Skeleton variant="text" width="100%" height={12} style={{ marginBottom: '6px' }} />
                        <Skeleton variant="text" width="80%" height={12} style={{ marginBottom: '16px' }} />

                        {/* Tech tags */}
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', flexWrap: 'wrap' }}>
                            {[1, 2, 3, 4].map((t) => (
                                <Skeleton key={t} variant="rect" width={50} height={20} style={{ borderRadius: '4px' }} />
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                            <Skeleton variant="rect" width={70} height={32} style={{ borderRadius: '6px' }} />
                            <Skeleton variant="rect" width={70} height={32} style={{ borderRadius: '6px' }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────
   7. Timeline Skeleton (Experience, Education, Certifications)
   ───────────────────────────────────────────────────────────── */
export const TimelineSkeleton = () => {
    return (
        <div className="admin-skeleton-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Skeleton variant="circle" width={32} height={32} glow />
                    <Skeleton variant="title" width={220} height={26} />
                </div>
                <Skeleton variant="rect" width={140} height={38} style={{ borderRadius: '8px' }} glow />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="admin-card"
                        style={{ padding: '22px 24px', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.5)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <Skeleton variant="title" width="50%" height={20} style={{ marginBottom: '6px' }} glow />
                                <Skeleton variant="text" width="35%" height={13} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Skeleton variant="text" width={110} height={22} style={{ borderRadius: '6px' }} />
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <Skeleton variant="circle" width={28} height={28} />
                                    <Skeleton variant="circle" width={28} height={28} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                            <Skeleton variant="text" width="95%" height={12} />
                            <Skeleton variant="text" width="90%" height={12} />
                            <Skeleton variant="text" width="70%" height={12} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────
   8. Messages & AI Leads Skeleton
   ───────────────────────────────────────────────────────────── */
export const MessagesSkeleton = () => {
    return (
        <div className="admin-skeleton-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Skeleton variant="circle" width={32} height={32} glow />
                    <Skeleton variant="title" width={240} height={26} />
                </div>
                <Skeleton variant="rect" width={100} height={36} style={{ borderRadius: '8px' }} />
            </div>

            {/* Filter toolbar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <Skeleton variant="rect" width={240} height={40} style={{ borderRadius: '8px' }} />
                <Skeleton variant="rect" width={140} height={40} style={{ borderRadius: '8px' }} />
                <Skeleton variant="rect" width={140} height={40} style={{ borderRadius: '8px' }} />
            </div>

            {/* Message rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="admin-card"
                        style={{ padding: '18px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(30, 41, 59, 0.5)' }}
                    >
                        <Skeleton variant="circle" width={40} height={40} glow />
                        <div style={{ flex: 1, minWidth: '160px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                <Skeleton variant="text" width={140} height={14} />
                                <Skeleton variant="text" width={80} height={16} style={{ borderRadius: '999px' }} />
                            </div>
                            <Skeleton variant="text" width="75%" height={12} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Skeleton variant="text" width={70} height={11} />
                            <Skeleton variant="circle" width={28} height={28} />
                            <Skeleton variant="circle" width={28} height={28} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────
   9. Blog Skeleton
   ───────────────────────────────────────────────────────────── */
export const BlogSkeleton = () => {
    return (
        <div className="admin-skeleton-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Skeleton variant="circle" width={32} height={32} glow />
                    <Skeleton variant="title" width={180} height={26} />
                </div>
                <Skeleton variant="rect" width={130} height={38} style={{ borderRadius: '8px' }} glow />
            </div>

            <div className="admin-items-grid">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="admin-item-card" style={{ padding: '20px', borderRadius: '14px', background: 'rgba(30, 41, 59, 0.5)' }}>
                        <Skeleton variant="rect" width="100%" height={160} style={{ borderRadius: '10px', marginBottom: '16px' }} glow />
                        <Skeleton variant="title" width="85%" height={18} style={{ marginBottom: '8px' }} />
                        <Skeleton variant="text" width="100%" height={12} style={{ marginBottom: '6px' }} />
                        <Skeleton variant="text" width="65%" height={12} style={{ marginBottom: '16px' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                            <Skeleton variant="text" width={80} height={11} />
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <Skeleton variant="circle" width={28} height={28} />
                                <Skeleton variant="circle" width={28} height={28} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────
   10. Master AdminSkeleton Switcher
   ───────────────────────────────────────────────────────────── */
export const AdminSkeleton = ({ activeTab }: { activeTab: string }) => {
    switch (activeTab) {
        case 'dashboard':
            return <DashboardSkeleton />
        case 'analytics':
            return <AnalyticsSkeleton />
        case 'personal':
            return <PersonalInfoSkeleton />
        case 'skills':
            return <SkillsAdminSkeleton />
        case 'projects':
            return <ProjectsSkeleton />
        case 'experience':
        case 'education':
        case 'certifications':
            return <TimelineSkeleton />
        case 'messages':
            return <MessagesSkeleton />
        case 'blog':
            return <BlogSkeleton />
        case 'testimonials':
        case 'achievements':
            return <TimelineSkeleton />
        default:
            return <DashboardSkeleton />
    }
}

export default AdminSkeleton

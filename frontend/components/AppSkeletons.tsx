'use client'

import React from 'react'
import Skeleton from './Skeleton'

export const BlogSectionSkeleton = () => {
    return (
        <div className="articles-grid">
            {[1, 2, 3].map((i) => (
                <div key={i} className="article-card glass-panel" style={{ height: '350px', animationDelay: `${i * 0.15}s` }}>
                    <div className="article-content p-6">
                        <div className="article-meta mb-4">
                            <Skeleton width="100px" height="1rem" />
                            <Skeleton width="60px" height="1rem" />
                        </div>
                        <Skeleton variant="title" width="80%" className="mb-4" />
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="60%" className="mb-6" />
                        <div className="flex gap-2 mb-6">
                            <Skeleton width="50px" height="1.5rem" />
                            <Skeleton width="50px" height="1.5rem" />
                            <Skeleton width="50px" height="1.5rem" />
                        </div>
                        <div className="flex justify-between items-center mt-auto">
                            <Skeleton width="120px" height="2rem" />
                            <Skeleton width="30px" height="1rem" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export const ProjectsSectionSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-panel overflow-hidden" style={{ height: '400px', animationDelay: `${i * 0.1}s` }}>
                    <Skeleton variant="rect" height="200px" glow />
                    <div className="p-6">
                        <Skeleton variant="title" width="70%" className="mb-4" />
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="40%" className="mb-6" />
                        <div className="flex gap-4">
                            <Skeleton width="80px" height="2.5rem" />
                            <Skeleton width="80px" height="2.5rem" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export const SkillsSectionSkeleton = () => {
    return (
        <div className="skills-modern-section p-6">
            <div className="flex gap-4 mb-8">
                <Skeleton variant="circle" width={50} height={50} />
                <div className="flex-1">
                    <Skeleton variant="title" width="30%" className="mb-2" />
                    <Skeleton variant="text" width="20%" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass-panel p-6 rounded-xl border border-border-color" style={{ animationDelay: `${i * 0.1}s` }}>
                        <Skeleton variant="circle" width={30} height={30} className="mb-2" glow />
                        <Skeleton variant="title" width="60%" className="mb-2" />
                        <Skeleton variant="text" width="40%" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 flex flex-col gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="glass-panel p-4 rounded-xl flex gap-4">
                            <Skeleton variant="rect" width="40px" height="40px" />
                            <div className="flex-1">
                                <Skeleton variant="text" width="70%" />
                                <Skeleton variant="text" width="40%" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="lg:col-span-2 glass-panel p-8 rounded-xl">
                    <div className="flex justify-between mb-8">
                        <div className="flex gap-4">
                            <Skeleton variant="circle" width={60} height={60} />
                            <div>
                                <Skeleton variant="title" width="150px" />
                                <Skeleton variant="text" width="100px" />
                            </div>
                        </div>
                        <Skeleton variant="text" width="80px" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="glass-panel p-4 rounded-xl">
                                <div className="flex justify-between mb-2">
                                    <Skeleton variant="text" width="40%" />
                                    <Skeleton variant="text" width="20%" />
                                </div>
                                <Skeleton variant="rect" height="8px" className="mb-2" />
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((j) => (
                                        <Skeleton key={j} variant="circle" width={10} height={10} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export const HeroSectionSkeleton = () => {
    return (
        <section className="p-6">
            <div className="hero-container glass-panel p-8 rounded-2xl mb-12" style={{ animationDelay: '0.1s' }}>
                <div className="window-controls mb-6">
                    <div className="window-dots">
                        <div className="window-dot red"></div>
                        <div className="window-dot yellow"></div>
                        <div className="window-dot green"></div>
                    </div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                        const widths = ['68%', '52%', '60%', '42%', '55%', '48%', '64%', '58%']
                        return (
                            <div key={i} className="mb-2">
                                 <Skeleton variant="text" width={widths[(i - 1) % widths.length]} style={{ animationDelay: `${i * 0.05}s` }} />
                            </div>
                        )
                    })}
                </div>
                <div className="mt-8 flex justify-center">
                    <Skeleton variant="rect" width="150px" height="45px" glow />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <Skeleton variant="title" width="60%" height="3rem" glow />
                    <Skeleton variant="text" width="40%" height="1.5rem" />
                    <Skeleton variant="rect" height="100px" />
                    <div className="flex gap-4">
                        <Skeleton variant="rect" width="120px" height="40px" />
                        <Skeleton variant="rect" width="120px" height="40px" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="glass-panel p-6 rounded-xl flex flex-col items-center">
                            <Skeleton variant="title" width="50%" className="mb-2" />
                            <Skeleton variant="text" width="70%" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const EducationSectionSkeleton = () => {
    return (
        <div className="education-grid p-6">
            <div className="education-column">
                <div className="flex gap-4 mb-8">
                    <Skeleton variant="circle" width={30} height={30} />
                    <Skeleton variant="title" width="40%" />
                </div>
                {[1, 2].map((i) => (
                    <div key={i} className="education-item glass-panel p-6 rounded-xl mb-6" style={{ animationDelay: `${i * 0.15}s` }}>
                        <Skeleton variant="title" width="70%" className="mb-2" glow />
                        <Skeleton variant="text" width="50%" className="mb-4" />
                        <div className="flex gap-4 mb-4">
                            <Skeleton width="100px" height="1rem" />
                            <Skeleton width="100px" height="1rem" />
                        </div>
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="80%" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export const CertificationsSectionSkeleton = () => {
    return (
        <div className="education-grid p-6">
            <div className="education-column">
                <div className="flex gap-4 mb-8">
                    <Skeleton variant="circle" width={30} height={30} />
                    <Skeleton variant="title" width="40%" />
                </div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="certification-item glass-panel p-4 rounded-xl mb-4 flex gap-4" style={{ animationDelay: `${(i + 2) * 0.1}s` }}>
                        <Skeleton variant="rect" width="50px" height="50px" glow />
                        <div className="flex-1">
                            <Skeleton variant="text" width="60%" className="mb-2" />
                            <Skeleton variant="text" width="40%" className="mb-2" />
                            <Skeleton variant="text" width="30%" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export const TestimonialsSectionSkeleton = () => {
    return (
        <div className="testimonials-grid p-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="testimonial-card glass-panel p-6 rounded-xl relative overflow-hidden" style={{ height: '280px', animationDelay: `${i * 0.2}s` }}>
                    <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((j) => (
                            <Skeleton key={j} width="15px" height="15px" />
                        ))}
                    </div>
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="60%" className="mb-8" />
                    <div className="flex items-center gap-4 mt-auto">
                        <Skeleton variant="circle" width={40} height={40} />
                        <div className="flex-1">
                            <Skeleton variant="text" width="40%" className="mb-2" />
                            <Skeleton variant="text" width="30%" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export const ExperienceSectionSkeleton = () => {
    return (
        <div className="timeline-container p-6">
            <div className="timeline-main flex-1">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 mb-8">
                        <Skeleton variant="circle" width={30} height={30} />
                        <div className="flex-1 glass-panel p-6 rounded-xl">
                            <div className="flex justify-between mb-4">
                                <Skeleton variant="title" width="40%" />
                                <Skeleton variant="text" width="20%" />
                            </div>
                            <Skeleton variant="text" width="100%" />
                            <Skeleton variant="text" width="80%" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="changed-files-sidebar w-64 glass-panel p-6 rounded-xl hidden lg:block">
                <Skeleton variant="title" width="80%" className="mb-6" />
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-2 mb-4">
                        <Skeleton width="20px" height="20px" />
                        <Skeleton variant="text" width="100%" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export const SidebarSkeleton = () => {
    return (
        <div className="sidebar-content h-full flex flex-col">
            <div className="sidebar-icons w-12 border-r border-border-color flex flex-col items-center py-4 gap-6">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} variant="circle" width={24} height={24} glow style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
            </div>
            <div className="sidebar-explorer flex-1 p-4">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton variant="text" width="60px" height="15px" />
                    <Skeleton variant="circle" width={16} height={16} />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => {
                        const rowWidths = ['65%', '45%', '70%']
                        return (
                            <div key={i} className="flex gap-2 items-center" style={{ animationDelay: `${i * 0.1}s` }}>
                                <Skeleton width={12} height={12} />
                                <Skeleton width={16} height={16} glow />
                                <Skeleton variant="text" width={rowWidths[(i - 1) % rowWidths.length]} />
                            </div>
                        )
                    })}
                    <div className="pl-6 space-y-4 pt-2">
                        {[1, 2, 3, 4].map((i) => {
                            const subRowWidths = ['42%', '55%', '38%', '50%']
                            return (
                                <div key={i} className="flex gap-2 items-center" style={{ animationDelay: `${(i + 3) * 0.1}s` }}>
                                    <Skeleton width={14} height={14} />
                                    <Skeleton variant="text" width={subRowWidths[(i - 1) % subRowWidths.length]} />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export const ContactSectionSkeleton = () => {
    return (
        <div className="contact-grid p-6">
            <div className="contact-methods-card glass-panel p-6 rounded-xl" style={{ animationDelay: '0.1s' }}>
                <Skeleton variant="title" width="60%" className="mb-8" glow />
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-4 mb-6">
                        <Skeleton variant="circle" width={40} height={40} />
                        <div className="flex-1">
                            <Skeleton variant="text" width="30%" className="mb-2" />
                            <Skeleton variant="text" width="60%" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="availability-card glass-panel p-6 rounded-xl" style={{ animationDelay: '0.3s' }}>
                <Skeleton variant="title" width="50%" className="mb-8" glow />
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 mb-6">
                        <Skeleton variant="circle" width={30} height={30} />
                        <div className="flex-1">
                            <Skeleton variant="text" width="40%" className="mb-2" />
                            <Skeleton variant="text" width="70%" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export const TerminalSectionSkeleton = () => {
    return (
        <div className="terminal-window glass-panel rounded-xl overflow-hidden m-6" style={{ height: '400px' }}>
            <div className="terminal-header p-4 border-b border-border-color flex justify-between">
                <div className="flex gap-2">
                    <div className="window-dot red"></div>
                    <div className="window-dot yellow"></div>
                    <div className="window-dot green"></div>
                </div>
                <Skeleton width="100px" height="15px" />
            </div>
            <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => {
                    const termWidths = ['45%', '65%', '35%', '55%', '40%', '28%']
                    return (
                        <Skeleton key={i} variant="text" width={termWidths[(i - 1) % termWidths.length]} />
                    )
                })}
            </div>
        </div>
    )
}

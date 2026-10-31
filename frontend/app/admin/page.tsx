'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    User, Settings, FileText, Briefcase,
    MessageSquare, Star, BarChart3, LogOut, Eye, EyeOff, Mail, Award, BookOpen, GraduationCap,
    Menu, X, ChevronLeft, ChevronRight, Activity, Sparkles
} from 'lucide-react'
import adminApiClient from '@/lib/admin-api'
import type { AdminData, PersonalInfo, SkillCategory, Project, Experience, Testimonial, BlogPost, Education, Certification } from '@/lib/admin-types'
import { toast } from '@/lib/toast'

// Import components
import { AdminSkeleton, AdminSidebarSkeleton } from '@/components/admin/AdminSkeleton'
import ToastContainer from '@/components/admin/ToastContainer'
import DashboardTab from '@/components/admin/DashboardTab'
import PersonalInfoTab from '@/components/admin/PersonalInfoTab'
import SkillsTab from '@/components/admin/SkillsTab'
import ProjectsTab from '@/components/admin/ProjectsTab'
import ExperienceTab from '@/components/admin/ExperienceTab'
import TestimonialsTab from '@/components/admin/TestimonialsTab'
import BlogTab from '@/components/admin/BlogTab'
import MessagesTab from '@/components/admin/MessagesTab'
import AchievementsTab from '@/components/admin/AchievementsTab'
import EducationTab from '@/components/admin/EducationTab'
import CertificationsTab from '@/components/admin/CertificationsTab'
import dynamic from 'next/dynamic'
const AnalyticsTab = dynamic(() => import('@/components/admin/AnalyticsTab'), { ssr: false })

const AdminPanel = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [currentUser, setCurrentUser] = useState<{ username: string; email?: string; role?: string; is_super_admin?: boolean } | null>(null)
    const [activeTab, setActiveTab] = useState('dashboard')
    const [adminData, setAdminData] = useState<AdminData | null>(null)
    const [loading, setLoading] = useState(false)
    const [loginForm, setLoginForm] = useState({ username: '', password: '' })
    const [loginError, setLoginError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

    useEffect(() => {
        const savedToken = localStorage.getItem('admin_token')
        const savedRefreshToken = localStorage.getItem('admin_refresh_token')
        if (savedToken || savedRefreshToken) {
            if (savedToken) {
                adminApiClient.setTokens(savedToken, savedRefreshToken || undefined)
            }
            verifyToken()
        }

        const handleAuthExpired = () => {
            setIsAuthenticated(false)
            setCurrentUser(null)
            setAdminData(null)
            toast.error('Session expired. Please log in again.')
        }

        window.addEventListener('admin-auth-expired', handleAuthExpired)
        return () => {
            window.removeEventListener('admin-auth-expired', handleAuthExpired)
        }
    }, [])

    const verifyToken = async () => {
        try {
            const res = await adminApiClient.verifyToken()
            if (res.user) {
                setCurrentUser(res.user)
            }
            setIsAuthenticated(true)
            loadAdminData()
        } catch (error) {
            try {
                await adminApiClient.refreshAccessToken()
                const res = await adminApiClient.verifyToken()
                if (res.user) {
                    setCurrentUser(res.user)
                }
                setIsAuthenticated(true)
                loadAdminData()
            } catch (refreshErr) {
                adminApiClient.clearTokens()
                setCurrentUser(null)
                setIsAuthenticated(false)
            }
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoginError(null)
        setLoading(true)

        try {
            const response = await adminApiClient.login(loginForm.username, loginForm.password)
            if (response.success) {
                if (response.user) {
                    setCurrentUser(response.user)
                }
                setIsAuthenticated(true)
                toast.success('Login successful!')
                loadAdminData()
            }
        } catch (error: any) {
            const errorMessage = error.message || 'Login failed'
            setLoginError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const loadAdminData = async () => {
        setLoading(true)
        try {
            const [dashboard, personalInfo, skills, projects, experience, testimonials, blog, contactMessages, aiLeads, achievements, education, certifications] = await Promise.all([
                adminApiClient.getDashboard(),
                adminApiClient.getPersonalInfo(),
                adminApiClient.getSkills(),
                adminApiClient.getProjects(),
                adminApiClient.getExperience(),
                adminApiClient.getTestimonials(),
                adminApiClient.getBlogPosts(),
                adminApiClient.getContactMessages(),
                adminApiClient.getAiLeads().catch(() => []),
                adminApiClient.getAchievements(),
                adminApiClient.getEducation(),
                adminApiClient.getCertifications()
            ])

            setAdminData({
                personalInfo,
                skills,
                projects,
                experience,
                testimonials,
                blogPosts: blog,
                contactMessages,
                aiLeads: Array.isArray(aiLeads) ? aiLeads : [],
                achievements,
                stats: dashboard.stats,
                education,
                certifications
            })
        } catch (error: any) {
            toast.error('Failed to load data. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        adminApiClient.logout()
        setIsAuthenticated(false)
        setCurrentUser(null)
        setAdminData(null)
        setActiveTab('dashboard')
        toast.info('Logged out successfully')
    }

    // Handler functions for different sections
    const handleUpdatePersonalInfo = async (data: Partial<PersonalInfo>) => {
        try {
            const response = await adminApiClient.updatePersonalInfo(data)
            if (response.success) {
                toast.success('Personal info updated successfully!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Update failed')
        }
    }

    const handleUpdateSkillsCategory = async (category: string, data: SkillCategory) => {
        try {
            const response = await adminApiClient.updateSkillsCategory(category, data)
            if (response.success) {
                toast.success('Skills updated successfully!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Update failed')
        }
    }

    const handleAddSkill = async (category: string, skill: { name: string; level: number; years: number }) => {
        try {
            const response = await adminApiClient.addSkill(category, skill)
            if (response.success) {
                toast.success('Skill added successfully!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Add failed')
        }
    }

    const handleAddProject = async (project: Omit<Project, 'id'>) => {
        try {
            const response = await adminApiClient.addProject(project)
            if (response.success) {
                toast.success('Project added successfully!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to add project')
            throw error
        }
    }

    const handleUpdateProject = async (id: number, project: Partial<Project>) => {
        try {
            const response = await adminApiClient.updateProject(id, project)
            if (response.success) {
                toast.success('Project updated successfully!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update project')
            throw error
        }
    }

    const handleDeleteProject = async (id: number) => {
        try {
            const response = await adminApiClient.deleteProject(id)
            if (response.success) {
                toast.success('Project deleted successfully!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete project')
            throw error
        }
    }

    const handleAddExperience = async (experience: Omit<Experience, 'id'>) => {
        try {
            const response = await adminApiClient.addExperience(experience)
            if (response.success) {
                toast.success('Experience added successfully!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to add experience')
            throw error
        }
    }

    const handleUpdateExperience = async (id: number, experience: Partial<Experience>) => {
        try {
            const response = await adminApiClient.updateExperience(id, experience)
            if (response.success) {
                toast.success('Experience saved! Changes will show on your portfolio.')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update experience')
            throw error
        }
    }

    const handleDeleteExperience = async (id: number) => {
        try {
            const response = await adminApiClient.deleteExperience(id)
            if (response.success) {
                toast.success('Experience deleted successfully!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete experience')
            throw error
        }
    }

    const handleAddEducation = async (education: Omit<Education, 'id'>) => {
        try {
            const response = await adminApiClient.addEducation(education)
            if (response.success) {
                toast.success('Education added successfully!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to add education')
            throw error
        }
    }

    const handleUpdateEducation = async (id: number, education: Partial<Education>) => {
        try {
            const response = await adminApiClient.updateEducation(id, education)
            if (response.success) {
                toast.success('Education saved!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update education')
            throw error
        }
    }

    const handleDeleteEducation = async (id: number) => {
        try {
            const response = await adminApiClient.deleteEducation(id)
            if (response.success) {
                toast.success('Education deleted successfully!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete education')
            throw error
        }
    }

    const handleAddCertification = async (certification: Omit<Certification, 'id'>) => {
        try {
            const response = await adminApiClient.addCertification(certification)
            if (response.success) {
                toast.success('Certification added successfully!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to add certification')
            throw error
        }
    }

    const handleUpdateCertification = async (id: number, certification: Partial<Certification>) => {
        try {
            const response = await adminApiClient.updateCertification(id, certification)
            if (response.success) {
                toast.success('Certification saved!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update certification')
            throw error
        }
    }

    const handleDeleteCertification = async (id: number) => {
        try {
            const response = await adminApiClient.deleteCertification(id)
            if (response.success) {
                toast.success('Certification deleted successfully!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete certification')
            throw error
        }
    }

    const handleAddTestimonial = async (testimonial: Omit<Testimonial, 'id'>) => {
        try {
            const response = await adminApiClient.addTestimonial(testimonial)
            if (response.success) {
                toast.success('Testimonial added successfully!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to add testimonial')
            throw error
        }
    }

    const handleUpdateTestimonial = async (id: number, testimonial: Partial<Testimonial>) => {
        try {
            const response = await adminApiClient.updateTestimonial(id, testimonial)
            if (response.success) {
                toast.success('Testimonial updated successfully!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update testimonial')
            throw error
        }
    }

    const handleDeleteTestimonial = async (id: number) => {
        try {
            const response = await adminApiClient.deleteTestimonial(id)
            if (response.success) {
                toast.success('Testimonial deleted successfully!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete testimonial')
            throw error
        }
    }

    const handleAddBlogPost = async (post: Omit<BlogPost, 'id'>) => {
        try {
            const response = await adminApiClient.addBlogPost(post)
            if (response.success) {
                toast.success('Blog post added successfully!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to add blog post')
            throw error
        }
    }

    const handleUpdateBlogPost = async (id: number, post: Partial<BlogPost>) => {
        try {
            const response = await adminApiClient.updateBlogPost(id, post)
            if (response.success) {
                toast.success('Blog post updated successfully!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update blog post')
            throw error
        }
    }

    const handleDeleteBlogPost = async (id: number) => {
        try {
            const response = await adminApiClient.deleteBlogPost(id)
            if (response.success) {
                toast.success('Blog post deleted successfully!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete blog post')
            throw error
        }
    }

    const handleDeleteContactMessage = async (id: number) => {
        try {
            const response = await adminApiClient.deleteContactMessage(id)
            if (response.success) {
                toast.success('Message deleted successfully!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete message')
            throw error
        }
    }

    const handleDeleteAiLead = async (id: number) => {
        try {
            const response = await adminApiClient.deleteAiLead(id)
            if (response.success) {
                toast.success('AI Lead deleted successfully!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete AI lead')
            throw error
        }
    }

    const handleUpdateAchievements = async (category: string, data: any) => {
        try {
            const response = await adminApiClient.updateAchievements(category, data)
            if (response.success) {
                toast.success('Achievements updated successfully!')
                loadAdminData()
            }
        } catch (error: any) {
            toast.error(error.message || 'Update failed')
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="admin-login-wrapper">
                <ToastContainer />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="admin-login-card"
                >
                    <div className="admin-login-header">
                        <h1 className="admin-login-title">
                            Portfolio Admin
                        </h1>
                        <p className="admin-login-subtitle">Manage your portfolio content</p>
                    </div>

                    {loginError && (
                        <div className="admin-error-alert">
                            {loginError}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="admin-form">
                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                Username
                            </label>
                            <input
                                type="text"
                                value={loginForm.username}
                                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                className="admin-form-input"
                                placeholder="Enter username"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={loginForm.password}
                                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="Enter password"
                                    required
                                    disabled={loading}
                                    style={{ paddingRight: '2.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#9ca3af',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 0
                                    }}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="admin-btn-primary"
                        >
                            {loading ? (
                                <span className="admin-login-loading">
                                    <div className="admin-spinner" />
                                    Logging in...
                                </span>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </form>

                </motion.div>
            </div>
        )
    }

    const navGroups = [
        {
            title: 'Overview',
            tabs: [
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'analytics', label: 'Analytics', icon: Activity },
            ]
        },
        {
            title: 'Portfolio Content',
            tabs: [
                { id: 'projects', label: 'Projects', icon: FileText },
                { id: 'skills', label: 'Skills & Tech', icon: Settings },
                { id: 'experience', label: 'Experience', icon: Briefcase },
                { id: 'education', label: 'Education', icon: GraduationCap },
                { id: 'certifications', label: 'Certifications', icon: Award },
            ]
        },
        {
            title: 'Engagement & Profile',
            tabs: [
                { id: 'personal', label: 'Personal Info', icon: User },
                { id: 'messages', label: 'Messages & AI Leads', icon: Mail },
                { id: 'blog', label: 'Blog Posts', icon: Star },
                { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
                { id: 'achievements', label: 'Achievements', icon: Award }
            ]
        }
    ]

    return (
        <div className="admin-container">
            <ToastContainer />

            {/* Top Navigation Bar */}
            <header className="admin-header">
                <div className="admin-header-content">
                    <div className="admin-header-left">
                        {/* Mobile Drawer Toggle */}
                        <button
                            type="button"
                            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                            className="admin-mobile-toggle"
                            aria-label="Toggle navigation drawer"
                            title="Toggle menu"
                        >
                            {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        <div className="admin-logo">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <div className="admin-header-title-row">
                                <h1 className="admin-header-title">Portfolio Admin</h1>
                                <span className="admin-super-badge">
                                    👑 Super Admin
                                </span>
                            </div>
                            {currentUser?.username && (
                                <p className="admin-user-subtitle">
                                    Logged in as <strong>{currentUser.username}</strong>
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="admin-header-right">
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-btn-view-site"
                            title="Open main portfolio website in new tab"
                        >
                            <Eye size={16} />
                            <span className="btn-text">View Site</span>
                        </a>
                        <button
                            onClick={handleLogout}
                            className="admin-btn-logout"
                            title="Log out of Admin Panel"
                        >
                            <LogOut size={16} />
                            <span className="btn-text">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Backdrop Overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="admin-sidebar-overlay"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div className="admin-layout-main">
                <nav className={`admin-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                    {/* Mobile Drawer Top Header */}
                    <div className="admin-sidebar-mobile-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="admin-logo" style={{ width: '32px', height: '32px' }}>
                                <BarChart3 size={18} />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '15px', color: '#fff' }}>Navigation</span>
                        </div>
                        <button
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="admin-sidebar-close-btn"
                            aria-label="Close navigation"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Desktop Collapse Toggle */}
                    <div className="admin-sidebar-collapse-wrap">
                        <button
                            type="button"
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="admin-sidebar-collapse-btn"
                            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                            <span className="collapse-label">{isSidebarCollapsed ? 'Expand' : 'Collapse'}</span>
                        </button>
                    </div>

                    {loading && !adminData ? (
                        <AdminSidebarSkeleton />
                    ) : (
                        <div className="admin-nav-groups">
                            {navGroups.map((group, gIdx) => (
                                <div key={gIdx} className="admin-nav-group">
                                    <div className="admin-nav-group-title">{group.title}</div>
                                    <ul className="admin-nav-list">
                                        {group.tabs.map((tab) => {
                                            const IconComponent = tab.icon
                                            const isActive = activeTab === tab.id
                                            return (
                                                <li key={tab.id}>
                                                    <button
                                                        onClick={() => {
                                                            setActiveTab(tab.id)
                                                            setIsMobileSidebarOpen(false)
                                                        }}
                                                        className={`admin-nav-item ${isActive ? 'active' : ''}`}
                                                        title={tab.label}
                                                    >
                                                        <IconComponent size={18} className="admin-nav-icon" />
                                                        <span className="admin-nav-label">{tab.label}</span>
                                                        {tab.id === 'messages' && (adminData?.aiLeads?.length || 0) > 0 && (
                                                            <span className="admin-nav-badge">
                                                                {adminData?.aiLeads?.length}
                                                            </span>
                                                        )}
                                                    </button>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </nav>

                <main className="admin-content">
                    {loading ? (
                        <AdminSkeleton activeTab={activeTab} />
                    ) : adminData ? (
                        <>
                            {activeTab === 'dashboard' && (
                                <DashboardTab
                                    stats={adminData.stats}
                                    onNavigateTab={(tab) => setActiveTab(tab)}
                                />
                            )}

                            {activeTab === 'analytics' && (
                                <AnalyticsTab />
                            )}

                            {activeTab === 'personal' && (
                                <PersonalInfoTab
                                    data={adminData.personalInfo}
                                    onUpdate={handleUpdatePersonalInfo}
                                />
                            )}

                            {activeTab === 'skills' && (
                                <SkillsTab
                                    skills={adminData.skills}
                                    onUpdateCategory={handleUpdateSkillsCategory}
                                    onAddSkill={handleAddSkill}
                                />
                            )}

                            {activeTab === 'projects' && (
                                <ProjectsTab
                                    projects={adminData.projects}
                                    onAddProject={handleAddProject}
                                    onUpdateProject={handleUpdateProject}
                                    onDeleteProject={handleDeleteProject}
                                />
                            )}

                            {activeTab === 'experience' && (
                                <ExperienceTab
                                    experience={adminData.experience}
                                    onAddExperience={handleAddExperience}
                                    onUpdateExperience={handleUpdateExperience}
                                    onDeleteExperience={handleDeleteExperience}
                                />
                            )}

                            {activeTab === 'education' && adminData.education && (
                                <EducationTab
                                    education={adminData.education}
                                    onAddEducation={handleAddEducation}
                                    onUpdateEducation={handleUpdateEducation}
                                    onDeleteEducation={handleDeleteEducation}
                                />
                            )}

                            {activeTab === 'certifications' && adminData.certifications && (
                                <CertificationsTab
                                    certifications={adminData.certifications}
                                    onAddCertification={handleAddCertification}
                                    onUpdateCertification={handleUpdateCertification}
                                    onDeleteCertification={handleDeleteCertification}
                                />
                            )}

                            {activeTab === 'testimonials' && (
                                <TestimonialsTab
                                    testimonials={adminData.testimonials}
                                    onAddTestimonial={handleAddTestimonial}
                                    onUpdateTestimonial={handleUpdateTestimonial}
                                    onDeleteTestimonial={handleDeleteTestimonial}
                                />
                            )}

                            {activeTab === 'messages' && (
                                <MessagesTab
                                    messages={adminData.contactMessages}
                                    aiLeads={adminData.aiLeads || []}
                                    onDeleteMessage={handleDeleteContactMessage}
                                    onDeleteAiLead={handleDeleteAiLead}
                                    onRefresh={loadAdminData}
                                />
                            )}

                            {activeTab === 'blog' && (
                                <BlogTab
                                    blogPosts={adminData.blogPosts}
                                    onAddBlogPost={handleAddBlogPost}
                                    onUpdateBlogPost={handleUpdateBlogPost}
                                    onDeleteBlogPost={handleDeleteBlogPost}
                                />
                            )}

                            {activeTab === 'achievements' && adminData.achievements && (
                                <AchievementsTab
                                    data={adminData.achievements}
                                    onUpdate={handleUpdateAchievements}
                                />
                            )}
                        </>
                    ) : (
                        <div className="admin-loading-wrapper">
                            <p>No data available. Please refresh or check your connection.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export default AdminPanel
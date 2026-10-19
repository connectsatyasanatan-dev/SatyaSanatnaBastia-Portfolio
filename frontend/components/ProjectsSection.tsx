'use client'

import { Terminal, Download, Star, GitFork, Grid3X3, Eye, Github, X, ExternalLink, CheckCircle2, Layers } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import portfolioAPI, { Project } from '@/lib/api'
import { FALLBACK_PROJECTS } from '@/lib/fallbackData'
import { ProjectsSectionSkeleton } from './AppSkeletons'

// ── Project Detail Modal ──────────────────────────────────
function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
    const handleProjectClick = (url: string) => {
        if (!url) return
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    const getTerminalLineClass = (line: string) => {
        if (line.startsWith('$')) return 'command'
        if (line.startsWith('>')) return 'output'
        if (line.includes('✔') || line.includes('OK') || line.includes('Done')) return 'success'
        if (line.includes('🚀')) return 'highlight'
        return 'info'
    }

    return (
        <AnimatePresence>
            <motion.div
                className="pm-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="pm-modal"
                    initial={{ opacity: 0, scale: 0.92, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 30 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="pm-header">
                        <div className="pm-header-left">
                            <Terminal size={16} />
                            <span className="pm-filename">{project.filename || 'project'}</span>
                            <span className="pm-version">{project.version ? (project.version.startsWith('v') ? project.version : `v${project.version}`) : 'v1.0.0'}</span>
                            {project.featured && <span className="pm-featured">⭐ Featured</span>}
                        </div>
                        <button className="pm-close" onClick={onClose} aria-label="Close">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="pm-body">
                        {/* Terminal preview */}
                        {project.terminalOutput && project.terminalOutput.length > 0 && (
                            <div className="pm-terminal">
                                {project.terminalOutput.map((line, i) => (
                                    <div key={i} className={`terminal-line ${getTerminalLineClass(line)}`}>{line}</div>
                                ))}
                            </div>
                        )}

                        {/* Title + stats */}
                        <div className="pm-title-row">
                            <h2 className="pm-title">{project.name}</h2>
                            <div className="pm-stats">
                                <span><Star size={13} /> {project.stars || 0}</span>
                                <span><GitFork size={13} /> {project.forks || 0}</span>
                                <span><Download size={13} /> {project.downloads || '0'}</span>
                            </div>
                        </div>

                        {/* Status badge */}
                        <div className="pm-status-row">
                            <span className={`pm-status pm-status--${project.status || 'active'}`}>
                                {project.status || 'active'}
                            </span>
                        </div>

                        {/* Description */}
                        <p className="pm-description">{project.description}</p>

                        {/* Technologies */}
                        {project.technologies && project.technologies.length > 0 && (
                            <div className="pm-section">
                                <div className="pm-section-title">
                                    <Layers size={14} />
                                    Tech Stack
                                </div>
                                <div className="pm-tech-grid">
                                    {project.technologies.map((tech, i) => (
                                        <span key={i} className="pm-tech-tag">{tech}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Features */}
                        {project.features && project.features.length > 0 && (
                            <div className="pm-section">
                                <div className="pm-section-title">
                                    <CheckCircle2 size={14} />
                                    Key Features
                                </div>
                                <ul className="pm-features">
                                    {project.features.map((f, i) => (
                                        <li key={i}>{f}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Footer actions */}
                    <div className="pm-footer">
                        <button
                            className="pm-btn pm-btn--demo"
                            onClick={() => handleProjectClick(project.demoUrl)}
                            disabled={!project.demoUrl}
                        >
                            <Eye size={15} /> Live Demo
                        </button>
                        <button
                            className="pm-btn pm-btn--code"
                            onClick={() => handleProjectClick(project.githubUrl)}
                            disabled={!project.githubUrl}
                        >
                            <Github size={15} /> View Code
                        </button>
                        {project.demoUrl && (
                            <button
                                className="pm-btn pm-btn--ext"
                                onClick={() => handleProjectClick(project.demoUrl)}
                                disabled={!project.demoUrl}
                            >
                                <ExternalLink size={15} /> Open
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

// ── Main Section ──────────────────────────────────────────
const ProjectsSection = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        setHasError(false)
        try {
            const data = await portfolioAPI.getProjects()
            if (data && data.length > 0) {
                setProjects(data)
            } else {
                setProjects(FALLBACK_PROJECTS)
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error)
            setProjects(FALLBACK_PROJECTS)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    // Close modal on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedProject(null) }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    const handleProjectClick = (url: string) => {
        if (!url) return
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    const getTerminalLineClass = (line: string) => {
        if (line.startsWith('$')) return 'command'
        if (line.startsWith('>')) return 'output'
        if (line.includes('✔') || line.includes('OK') || line.includes('Done')) return 'success'
        if (line.includes('🚀')) return 'highlight'
        return 'info'
    }

    return (
        <>
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="skeleton-projects"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                        transition={{ duration: 0.5 }}
                    >
                        <ProjectsSectionSkeleton />
                    </motion.div>
                ) : (
                    <motion.section
                        key="projects-content"
                        id="projects-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <div className="ide-section-header">
                            <div className="ide-section-header-left">
                                <div className="ide-section-icon-badge">
                                    <Grid3X3 size={20} />
                                </div>
                                <div className="ide-section-titles">
                                    <h2 className="ide-section-title">Featured Projects &amp; Architecture</h2>
                                    <span className="ide-section-tag">// production_projects.sh</span>
                                </div>
                            </div>
                            <div className="view-toggle">
                                <button onClick={() => setViewMode('grid')} className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}>Grid</button>
                                <button onClick={() => setViewMode('list')} className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}>List</button>
                            </div>
                        </div>

                        <div className={`projects-grid ${viewMode}-view`}>
                            {projects.map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="project-card"
                                    onClick={() => setSelectedProject(project)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {/* Header */}
                                    <div className="project-header">
                                        <div className="project-header-left">
                                            <Terminal size={18} />
                                            <span className="project-filename">{project.filename}</span>
                                        </div>
                                        <div className="project-stats">
                                            <div className="download-stat">
                                                <Download size={14} />
                                                <span>{project.downloads || '0'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Terminal */}
                                    <div className="project-terminal">
                                        <div className="terminal-gradient"></div>
                                        <div className="terminal-content">
                                            {project.terminalOutput && project.terminalOutput.map((line, lineIndex) => (
                                                <div key={lineIndex} className={`terminal-line ${getTerminalLineClass(line)}`}>{line}</div>
                                            ))}
                                            {(!project.terminalOutput || project.terminalOutput.length === 0) && (
                                                <div className="terminal-line command">$ npm list dependencies</div>
                                            )}
                                            <div className="terminal-progress">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: '100%' }}
                                                    transition={{ duration: 2, delay: 0.5 }}
                                                    className="progress-bar"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="project-content">
                                        <div className="project-content-header">
                                            <h4 className="project-name">{project.name}</h4>
                                            <span className="project-version">{project.version ? (project.version.startsWith('v') ? project.version : `v${project.version}`) : 'v1.0.0'}</span>
                                        </div>

                                        <p className="project-description">{project.description}</p>

                                        <div className="project-technologies">
                                            {project.technologies.slice(0, 4).map((tech, techIndex) => (
                                                <span key={techIndex} className="tech-tag">{tech}</span>
                                            ))}
                                            {project.technologies.length > 4 && (
                                                <span className="tech-tag-more">+{project.technologies.length - 4}</span>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="project-footer">
                                            <div className="project-stats-footer">
                                                <div className="stat-item">
                                                    <Star size={14} />
                                                    <span className="stat-value">{project.stars || 0}</span>
                                                </div>
                                                <div className="stat-item">
                                                    <GitFork size={14} />
                                                    <span className="stat-value">{project.forks || 0}</span>
                                                </div>
                                            </div>
                                            <div className="project-links">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleProjectClick(project.demoUrl) }}
                                                    className="project-link demo"
                                                    disabled={!project.demoUrl}
                                                >
                                                    <Eye size={16} /> Demo
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleProjectClick(project.githubUrl) }}
                                                    className="project-link code"
                                                    disabled={!project.githubUrl}
                                                >
                                                    <Github size={16} /> Code
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Project Detail Modal */}
            {selectedProject && (
                <ProjectModal
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                />
            )}
        </>
    )
}

export default ProjectsSection

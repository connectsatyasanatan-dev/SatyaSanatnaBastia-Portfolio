'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    Download,
    FileText,
    ExternalLink,
    Printer,
    ZoomIn,
    ZoomOut,
    Loader2,
    Eye,
    Briefcase,
    GraduationCap,
    Award,
    Code2,
    Mail,
    Phone,
    MapPin,
    Linkedin,
    Github,
    Sparkles
} from 'lucide-react'

interface ResumeModalProps {
    isOpen: boolean
    onClose: () => void
    resumeUrl: string | null
    name: string
}

const LOCAL_RESUME = '/resume.pdf'

const ResumeModal = ({ isOpen, onClose, resumeUrl, name }: ResumeModalProps) => {
    const [viewMode, setViewMode] = useState<'pdf' | 'interactive'>('pdf')
    const [loading, setLoading] = useState(true)
    const [zoom, setZoom] = useState(100)
    const [pdfLoadError, setPdfLoadError] = useState(false)
    const iframeRef = useRef<HTMLIFrameElement>(null)

    const activePdfUrl = resumeUrl || LOCAL_RESUME

    useEffect(() => {
        if (isOpen) {
            setLoading(true)
            setPdfLoadError(false)
            setZoom(100)

            // Auto-detect mobile devices where iframe PDF embedding is unsupported
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
                setViewMode('interactive')
            } else {
                setViewMode('pdf')
            }

            // Safety timeout to dismiss loader spinner if iframe takes longer
            const timer = setTimeout(() => {
                setLoading(false)
            }, 1000)

            return () => clearTimeout(timer)
        }
    }, [isOpen, resumeUrl])

    const handleDownload = async () => {
        try {
            const response = await fetch(activePdfUrl)
            if (!response.ok) throw new Error('Fetch failed')
            const blob = await response.blob()
            const blobUrl = window.URL.createObjectURL(blob)

            const link = document.createElement('a')
            link.href = blobUrl
            link.download = 'Satya Sanatan Bastia - Resume.pdf'

            document.body.appendChild(link)
            link.click()

            document.body.removeChild(link)
            window.URL.revokeObjectURL(blobUrl)
        } catch {
            const link = document.createElement('a')
            link.href = activePdfUrl
            link.target = '_blank'
            link.download = 'Satya Sanatan Bastia - Resume.pdf'
            link.click()
        }
    }

    const handlePrint = () => {
        if (viewMode === 'interactive') {
            window.print()
            return
        }
        if (iframeRef.current?.contentWindow) {
            try {
                iframeRef.current.contentWindow.print()
                return
            } catch {
                // fall through to window.open
            }
        }
        window.open(activePdfUrl, '_blank')
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="resume-modal-overlay"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="resume-modal-content"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Top Bar */}
                    <div className="resume-modal-header">
                        <div className="header-left">
                            <FileText className="text-primary" size={20} />
                            <div>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Curriculum Vitae
                                    <span style={{ fontSize: '11px', background: 'rgba(6,249,249,0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(6,249,249,0.2)' }}>
                                        Verified
                                    </span>
                                </h3>
                                <p>{name} &bull; Software Engineer</p>
                            </div>
                        </div>

                        {/* View Switcher: PDF vs Interactive CV */}
                        <div className="resume-view-toggle">
                            <button
                                className={`resume-toggle-btn ${viewMode === 'pdf' ? 'active' : ''}`}
                                onClick={() => setViewMode('pdf')}
                                title="Original PDF View"
                            >
                                <FileText size={14} />
                                <span>PDF Document</span>
                            </button>
                            <button
                                className={`resume-toggle-btn ${viewMode === 'interactive' ? 'active' : ''}`}
                                onClick={() => setViewMode('interactive')}
                                title="Interactive Formatted View"
                            >
                                <Sparkles size={14} />
                                <span>Interactive CV</span>
                            </button>
                        </div>

                        <div className="header-actions">
                            {viewMode === 'pdf' && (
                                <div className="zoom-controls">
                                    <button onClick={() => setZoom(prev => Math.max(60, prev - 10))} title="Zoom Out">
                                        <ZoomOut size={16} />
                                    </button>
                                    <span>{zoom}%</span>
                                    <button onClick={() => setZoom(prev => Math.min(180, prev + 10))} title="Zoom In">
                                        <ZoomIn size={16} />
                                    </button>
                                </div>
                            )}

                            <button onClick={handlePrint} className="action-btn" title="Print Document">
                                <Printer size={18} />
                            </button>

                            <button onClick={handleDownload} className="download-btn-modern">
                                <Download size={16} />
                                <span>Download PDF</span>
                            </button>

                            <button onClick={onClose} className="close-btn-modern" aria-label="Close modal">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* PDF Notice Bar if browser blocks preview */}
                    {viewMode === 'pdf' && (
                        <div className="resume-help-banner">
                            <span>Browser not rendering the PDF?</span>
                            <button
                                onClick={() => setViewMode('interactive')}
                                className="resume-help-btn"
                            >
                                <Eye size={12} /> Switch to Interactive CV
                            </button>
                            <span style={{ opacity: 0.5 }}>or</span>
                            <a
                                href={activePdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="resume-help-link"
                            >
                                Open PDF directly <ExternalLink size={11} />
                            </a>
                        </div>
                    )}

                    {/* Document Body */}
                    <div className="resume-viewer-body">
                        {loading && viewMode === 'pdf' && (
                            <div className="resume-loader">
                                <Loader2 className="animate-spin text-primary" size={36} />
                                <p style={{ fontSize: '13px', color: '#94a3b8' }}>Rendering Curriculum Vitae...</p>
                            </div>
                        )}

                        {/* MODE 1: PDF Viewer via clean iframe */}
                        {viewMode === 'pdf' && (
                            <div
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    transform: `scale(${zoom / 100})`,
                                    transformOrigin: 'top center',
                                    transition: 'transform 0.2s ease',
                                    padding: '10px 0 30px'
                                }}
                            >
                                <iframe
                                    ref={iframeRef}
                                    id="resume-pdf-frame"
                                    src={`${activePdfUrl}#view=FitH&toolbar=0&navpanes=0`}
                                    className="resume-iframe"
                                    title="Curriculum Vitae Document Preview"
                                    onLoad={() => setLoading(false)}
                                    onError={() => {
                                        setPdfLoadError(true)
                                        setViewMode('interactive')
                                    }}
                                />
                            </div>
                        )}

                        {/* MODE 2: Interactive Rich CV (100% Guaranteed cross-platform rendering) */}
                        {viewMode === 'interactive' && (
                            <div className="resume-interactive-doc">
                                {/* Header */}
                                <div className="resume-doc-header">
                                    <div className="resume-doc-title-block">
                                        <h1 className="resume-doc-name">Satya Sanatan Bastia</h1>
                                        <p className="resume-doc-tagline">
                                            Software Engineer &bull; Frontend Developer &bull; Oracle Certified (OCI)
                                        </p>
                                    </div>
                                    <div className="resume-doc-contacts">
                                        <span className="contact-chip">
                                            <Mail size={13} /> connectwithsatyasanatan@gmail.com
                                        </span>
                                        <span className="contact-chip">
                                            <Phone size={13} /> +91 7205053993
                                        </span>
                                        <span className="contact-chip">
                                            <MapPin size={13} /> Bhubaneswar, Odisha, India
                                        </span>
                                        <span className="contact-chip">
                                            <Linkedin size={13} /> LinkedIn / satya-sanatan-bastia
                                        </span>
                                        <span className="contact-chip">
                                            <Github size={13} /> GitHub / connectsatyasanatan
                                        </span>
                                    </div>
                                </div>

                                {/* Professional Summary */}
                                <div className="resume-doc-section">
                                    <div className="resume-doc-sec-title">
                                        <Briefcase size={16} className="sec-icon" />
                                        <span>Professional Summary</span>
                                    </div>
                                    <p className="resume-doc-summary-text">
                                        Software Developer with experience building and shipping production React.js applications for enterprise and government clients. Strong expertise in JavaScript, React, Redux, responsive UI architecture, REST API integration, and reusable component libraries. Working knowledge of Python, Flask, FastAPI, and PostgreSQL for full-stack collaboration, with foundational knowledge of AWS and Oracle Cloud Infrastructure (OCI).
                                    </p>
                                </div>

                                {/* Experience */}
                                <div className="resume-doc-section">
                                    <div className="resume-doc-sec-title">
                                        <Briefcase size={16} className="sec-icon" />
                                        <span>Professional Experience</span>
                                    </div>

                                    <div className="resume-doc-exp-item">
                                        <div className="exp-item-header">
                                            <div>
                                                <h3 className="exp-role">Associate Software Engineer</h3>
                                                <p className="exp-company">Bourntec Solutions Inc. &bull; Bhubaneswar, Odisha</p>
                                            </div>
                                            <span className="exp-duration">May 2025 &ndash; Present</span>
                                        </div>
                                        <ul className="exp-bullets">
                                            <li>Developed and shipped 3+ production-grade React.js applications for enterprise clients, owning component architecture, state management (Redux/Context), and REST API integration from design to deployment.</li>
                                            <li>Collaborated with backend and QA teams using Git-based workflows to coordinate and ship stable production releases on schedule, reducing deployment-related issues through consistent code review practices.</li>
                                            <li>Designed cloud architecture diagrams and technical proposal decks (Draw.io) for pre-sales engagements, supporting the business development team in client-facing technical documentation and solution pitches.</li>
                                        </ul>
                                    </div>

                                    <div className="resume-doc-exp-item">
                                        <div className="exp-item-header">
                                            <div>
                                                <h3 className="exp-role">Software Development &amp; Cloud Support Intern</h3>
                                                <p className="exp-company">Bourntec Solutions Inc. &bull; Bhubaneswar, Odisha</p>
                                            </div>
                                            <span className="exp-duration">May 2024 &ndash; May 2025</span>
                                        </div>
                                        <ul className="exp-bullets">
                                            <li>Built reusable React.js components and integrated REST APIs for Next-Gen enterprise web applications, maintaining clean code quality and strict Figma design parity.</li>
                                            <li>Assisted in setting up automated cloud deployment pipelines, monitoring systems, and optimizing asset delivery for enhanced Core Web Vitals.</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Technical Skills */}
                                <div className="resume-doc-section">
                                    <div className="resume-doc-sec-title">
                                        <Code2 size={16} className="sec-icon" />
                                        <span>Technical Skills</span>
                                    </div>
                                    <div className="resume-doc-skills-grid">
                                        <div className="skill-cat-card">
                                            <h4 className="skill-cat-title" style={{ color: '#06f9f9' }}>Frontend Engineering</h4>
                                            <div className="skill-tag-list">
                                                {['React.js', 'Next.js', 'TypeScript', 'JavaScript (ES6+)', 'Redux Toolkit', 'HTML5 & CSS3', 'Framer Motion', 'Tailwind CSS'].map(s => (
                                                    <span key={s} className="resume-skill-pill">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="skill-cat-card">
                                            <h4 className="skill-cat-title" style={{ color: '#ff00ff' }}>Backend &amp; APIs</h4>
                                            <div className="skill-tag-list">
                                                {['Python', 'Flask', 'FastAPI', 'Node.js', 'REST API Design', 'JWT Auth', 'Axios', 'Swagger / OpenAPI'].map(s => (
                                                    <span key={s} className="resume-skill-pill">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="skill-cat-card">
                                            <h4 className="skill-cat-title" style={{ color: '#2de2e6' }}>Database &amp; Cloud</h4>
                                            <div className="skill-tag-list">
                                                {['PostgreSQL', 'MySQL', 'MongoDB', 'AWS Fundamentals', 'Oracle Cloud (OCI)', 'Docker', 'Vercel / Render'].map(s => (
                                                    <span key={s} className="resume-skill-pill">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="skill-cat-card">
                                            <h4 className="skill-cat-title" style={{ color: '#00ff88' }}>AI &amp; Tools</h4>
                                            <div className="skill-tag-list">
                                                {['LLM API Integration', 'Prompt Engineering', 'Git & GitHub', 'Figma', 'VS Code', 'Agile / SDLC'].map(s => (
                                                    <span key={s} className="resume-skill-pill">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Certifications & Education */}
                                <div className="resume-doc-section" style={{ borderBottom: 'none' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <div className="resume-doc-sec-title">
                                                <Award size={16} className="sec-icon" />
                                                <span>Certifications</span>
                                            </div>
                                            <div className="resume-cert-item">
                                                <p className="cert-title">Oracle Cloud Infrastructure (OCI) Certified</p>
                                                <p className="cert-issuer">Oracle Corporation &bull; Cloud Foundations</p>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="resume-doc-sec-title">
                                                <GraduationCap size={16} className="sec-icon" />
                                                <span>Education</span>
                                            </div>
                                            <div className="resume-cert-item">
                                                <p className="cert-title">Bachelor of Technology (B.Tech) in CSE</p>
                                                <p className="cert-issuer">Computer Science &amp; Engineering &bull; Odisha, India</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="resume-modal-footer">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <p>Document Security: Verified &amp; Signed</p>
                            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
                            <span style={{ color: '#06f9f9' }}>Single-Page Executive Format</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <button
                                onClick={handleDownload}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <Download size={13} /> Download .pdf
                            </button>
                            <a
                                href={activePdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="external-link"
                            >
                                Open in New Tab <ExternalLink size={13} />
                            </a>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default ResumeModal

'use client'

import { Play, Github, Linkedin, Download, Terminal, X, CheckCircle2, Cpu, Zap, Globe } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import portfolioAPI, { PersonalInfo, PortfolioStats, Achievements } from '@/lib/api'
import { HeroSectionSkeleton } from './AppSkeletons'
import { AnimatePresence, motion } from 'framer-motion'
import ResumeModal from './ResumeModal'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
}

const HeroSection = () => {
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null)
    const [stats, setStats] = useState<PortfolioStats | null>(null)
    const [achievements, setAchievements] = useState<Achievements | null>(null)
    const [loading, setLoading] = useState(true)
    const [isExecuting, setIsExecuting] = useState(false)
    const [terminalLogs, setTerminalLogs] = useState<string[]>([])
    const [executionStep, setExecutionStep] = useState(0) // 0: Idle, 1: Terminal, 2: Success Card
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)
    const terminalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetch = async () => {
            try {
                const [infoData, statsData, achievementsData] = await Promise.all([
                    portfolioAPI.getPersonalInfo(),
                    portfolioAPI.getStats(),
                    portfolioAPI.getAchievements()
                ])
                setPersonalInfo(infoData)
                setStats(statsData)
                setAchievements(achievementsData)
            } catch (e) {
                console.error('Failed to load hero data', e)
            } finally {
                setLoading(false)
            }
        }

        fetch()
    }, [])

    const codeLines = [
        { text: "// Welcome to my digital workspace", type: "comment" },
        { text: "", type: "empty" },
        { text: `import { Human, Developer } from '@universe/core';`, type: "import" },
        { text: "", type: "empty" },
        { text: `const ${personalInfo?.name?.replace(/\s+/g, '') || 'Developer'} = new Developer;`, type: "const" },
        { text: "", type: "empty" },
        { text: `${personalInfo?.name?.replace(/\s+/g, '') || 'Developer'}.configure({`, type: "configure" },
        { text: `  role: '${personalInfo?.role || 'Full Stack Developer'}',`, type: "role" },
        { text: `  experience: '${personalInfo?.experience || '2+ Years'}',`, type: "experience" },
        { text: `  location: '${personalInfo?.location || 'Bhubaneswar, India'}',`, type: "location" },
        { text: `  status: '${personalInfo?.status || 'Open to Work'}',`, type: "status" },
        { text: `  email: '${personalInfo?.email || 'connectsatyasanatan@gmail.com'}'`, type: "email" },
        { text: "});", type: "closing" },
    ]

    const handleExecuteClick = () => {
        setIsExecuting(true)
        setExecutionStep(1)
        setTerminalLogs([])
        
        const logs = [
            `> Initializing ${personalInfo?.name || 'Developer'} environment...`,
            `> Loading core modules: React, Next.js, Node.js...`,
            `> Injecting experience: ${personalInfo?.experience || '2+ Years'}`,
            `> Calibrating location: ${personalInfo?.location || 'Bhubaneswar, Odisha'}...`,
            `> Setting status to: ${personalInfo?.status || 'Open to Work'}`,
            `> Analyzing GitHub repositories...`,
            `> Syncing with production servers...`,
            `> Finalizing neural connections...`,
            `> -----------------------------------------`,
            `> SUCCESS: ${personalInfo?.name || 'Developer'} is fully instantiated!`
        ]

        let currentLog = 0
        const interval = setInterval(() => {
            if (currentLog < logs.length) {
                setTerminalLogs(prev => [...prev, logs[currentLog]])
                currentLog++
                if (terminalRef.current) {
                    terminalRef.current.scrollTop = terminalRef.current.scrollHeight
                }
            } else {
                clearInterval(interval)
                setTimeout(() => setExecutionStep(2), 800)
            }
        }, 300)
    }

    const closeExecutionModal = () => {
        setIsExecuting(false)
        setExecutionStep(0)
        setTerminalLogs([])
    }

    const handleEmailClick = () => {
        const email = personalInfo?.email || 'connectsatyasanatan@gmail.com'
        window.open(`mailto:${email}`, '_blank')
    }

    const handleGithubClick = () => {
        const gh = personalInfo?.github || 'https://github.com/connectsatyasanatan'
        window.open(gh, '_blank', 'noopener,noreferrer')
    }

    const handleLinkedinClick = () => {
        const li = personalInfo?.linkedin || 'https://linkedin.com/in/satya-sanatan'
        window.open(li, '_blank', 'noopener,noreferrer')
    }

    const handleResumeClick = () => {
        setIsResumeModalOpen(true)
    }

    const renderCodeLine = (line: any, index: number) => {
        switch (line.type) {
            case 'comment':
                return <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>{line.text}</span>
            case 'import':
                return (
                    <>
                        <span style={{ color: 'var(--secondary)' }}>import</span>
                        <span style={{ color: 'white' }}> {`{ `}</span>
                        <span style={{ color: '#fbbf24' }}>Human</span>
                        <span style={{ color: 'white' }}>, </span>
                        <span style={{ color: '#fbbf24' }}>Developer</span>
                        <span style={{ color: 'white' }}> {`} `}</span>
                        <span style={{ color: 'var(--secondary)' }}>from</span>
                        <span style={{ color: '#ce9178' }}> '@universe/core'</span>
                        <span style={{ color: 'white' }}>;</span>
                    </>
                )
            case 'const':
                return (
                    <>
                        <span style={{ color: 'var(--secondary)' }}>const</span>
                        <span style={{ color: 'var(--accent)' }}>{'\u00A0'}{personalInfo?.name?.replace(/\s+/g, '') || 'Developer'}</span>
                        <span style={{ color: 'white' }}>{'\u00A0'}={'\u00A0'}</span>
                        <span style={{ color: 'var(--secondary)' }}>new</span>
                        <span style={{ color: '#fbbf24' }}>Developer</span>
                        <span style={{ color: 'white' }}>{'\u00A0\u00A0'}</span>
                        <span style={{ color: 'var(--primary)' }}>;</span>
                    </>
                )
            case 'configure':
                return (
                    <>
                        <span style={{ color: 'var(--accent)' }}>{personalInfo?.name?.replace(/\s+/g, '') || 'Developer'}</span>
                        <span style={{ color: 'white' }}>.</span>
                        <span style={{ color: '#3b82f6' }}>configure</span>
                        <span style={{ color: 'var(--primary)' }}>({`{`}</span>
                    </>
                )
            case 'role':
                return (
                    <>
                        <span style={{ color: 'white', marginLeft: '25px' }}>  role: </span>
                        <span style={{ color: '#ce9178' }}>'{personalInfo?.role || 'Full Stack Developer'}'</span>
                        <span style={{ color: 'white' }}>,</span>
                    </>
                )
            case 'experience':
                return (
                    <>
                        <span style={{ color: 'white', marginLeft: '25px' }}>  experience: </span>
                        <span style={{ color: '#ce9178' }}>'{personalInfo?.experience || '2+ Years'}'</span>
                        <span style={{ color: 'white' }}>,</span>
                    </>
                )
            case 'location':
                return (
                    <>
                        <span style={{ color: 'white', marginLeft: '25px' }}>  location: </span>
                        <span style={{ color: '#ce9178' }}>'{personalInfo?.location || 'Bhubaneswar, India'}'</span>
                        <span style={{ color: 'white' }}>,</span>
                    </>
                )
            case 'status':
                return (
                    <>
                        <span style={{ color: 'white', marginLeft: '25px' }}>  status: </span>
                        <span style={{ color: '#22c55e' }}>'{personalInfo?.status || 'Open to Work'}'</span>
                        <span style={{ color: 'white' }}>,</span>
                    </>
                )
            case 'email':
                return (
                    <>
                        <span style={{ color: 'white', marginLeft: '25px' }}>  email: </span>
                        <span style={{ color: '#ce9178' }}>'{personalInfo?.email || 'connectsatyasanatan@gmail.com'}'</span>
                    </>
                )
            case 'closing':
                return (
                    <>
                        <span style={{ color: 'var(--primary)'  }}>&#125;);</span>
                        <span className="blinking-cursor" style={{ color: 'var(--primary)' }}></span>
                    </>
                )
            default:
                return line.text
        }
    }

    const yearsExp = stats?.experience_years || achievements?.stats?.yearsOfExperience || 2
    const projectsCount = stats?.projects_count || achievements?.stats?.projectsCompleted || 15
    const clientsCount = achievements?.stats?.clientsSatisfied || 12

    return (
        <AnimatePresence mode="wait">
            {loading ? (
                <motion.div 
                    key="skeleton"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                    transition={{ duration: 0.5 }}
                >
                    <HeroSectionSkeleton />
                </motion.div>
            ) : (
                <>
                    <motion.section 
                        key="hero-content"
                        className="hero-modern" 
                        id="hero-section"
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                    >
                        <div className="hero-container">
                            <div className="window-controls">
                                <div className="window-dots">
                                    <div className="window-dot red"></div>
                                    <div className="window-dot yellow"></div>
                                    <div className="window-dot green"></div>
                                </div>
                                <div className="window-status">Read-Only</div>
                            </div>

                            <div className="code-content code-block">
                                {codeLines.map((line, index) => (
                                    <div key={index} className="code-line">
                                        {renderCodeLine(line, index)}
                                    </div>
                                ))}
                            </div>

                            <div className="execute-bar">
                                <button className="execute-btn" onClick={handleExecuteClick}>
                                    <Play />
                                    <span className="btn-text-full">Execute Code</span>
                                    <span className="btn-text-short">Run</span>
                                </button>
                            </div>
                        </div>

                        {isExecuting && (
                            <div className="execution-modal-overlay">
                                <div className="execution-modal-content glass-panel animate-delay-1">
                                    <div className="execution-modal-header">
                                        <div className="header-left">
                                            <Terminal size={18} />
                                            <span>Execution Terminal</span>
                                        </div>
                                        <button className="close-btn" onClick={closeExecutionModal}>
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="execution-modal-body">
                                        {executionStep === 1 && (
                                            <div className="terminal-wrapper" ref={terminalRef}>
                                                {terminalLogs.map((log, idx) => (
                                                    <div key={idx} className={`terminal-line ${log && typeof log === 'string' && log.includes('SUCCESS') ? 'text-primary' : 'text-white'}`}>
                                                        {log}
                                                    </div>
                                                ))}
                                                <div className="blinking-cursor"></div>
                                            </div>
                                        )}

                                        {executionStep === 2 && (
                                            <div className="success-profile-card">
                                                <div className="profile-badge">
                                                    <CheckCircle2 size={48} className="text-primary" />
                                                    <h2>Compilation Successful</h2>
                                                </div>
                                                
                                                <div className="profile-content">
                                                    <div className="profile-main-info">
                                                        <h3>{personalInfo?.name}</h3>
                                                        <p className="text-primary">{personalInfo?.role}</p>
                                                    </div>

                                                    <div className="profile-grid">
                                                        <div className="profile-grid-item">
                                                            <Cpu size={16} className="text-accent" />
                                                            <div>
                                                                <span className="label">Stack</span>
                                                                <span className="value">Full Stack</span>
                                                            </div>
                                                        </div>
                                                        <div className="profile-grid-item">
                                                            <Zap size={16} className="text-secondary" />
                                                            <div>
                                                                <span className="label">Performance</span>
                                                                <span className="value">Optimal</span>
                                                            </div>
                                                        </div>
                                                        <div className="profile-grid-item">
                                                            <Globe size={16} className="text-primary" />
                                                            <div>
                                                                <span className="label">Availability</span>
                                                                <span className="value">Remote / On-site</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="profile-actions">
                                                        <button className="hero-btn primary" onClick={handleEmailClick}>
                                                            <Play size={16} /> Hire Now
                                                        </button>
                                                        <button className="hero-btn secondary" onClick={handleResumeClick}>
                                                            <Download size={16} /> Profile.pdf
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="hero-info">
                            <div className="hero-bio">
                                <motion.h1 className="hero-name" variants={itemVariants}>
                                    {personalInfo?.name || 'Developer'}
                                </motion.h1>
                                <motion.p className="hero-title" variants={itemVariants}>
                                    {personalInfo?.role || personalInfo?.title || ''}
                                </motion.p>
                                <motion.p className="hero-description" variants={itemVariants}>
                                    {personalInfo?.bio || ''}
                                </motion.p>
                            </div>

                            <motion.div className="hero-actions" variants={itemVariants}>
                                {/* <button className="hero-btn primary" onClick={handleGithubClick}>
                                    <Github />
                                    <span className="btn-text-full">Browse Repo</span>
                                    <span className="btn-text-short">GitHub</span>
                                </button> */}

                                <button className="hero-btn secondary" onClick={handleResumeClick}>
                                    <Download />
                                    <span className="btn-text-full">Download CV</span>
                                    <span className="btn-text-short">Resume</span>
                                </button>

                                <button className="hero-btn accent" onClick={handleLinkedinClick}>
                                    <Linkedin />
                                    <span className="btn-text-full">Connect</span>
                                    <span className="btn-text-short">LinkedIn</span>
                                </button>
                            </motion.div>

                            <motion.div className="hero-stats" variants={itemVariants}>
                                <div className="stat-item hover-scale">
                                    <div className="stat-value primary">{yearsExp}+</div>
                                    <div className="stat-label">Years Exp</div>
                                </div>
                                <div className="stat-item hover-scale">
                                    <div className="stat-value secondary">{projectsCount}+</div>
                                    <div className="stat-label">Projects</div>
                                </div>
                                <div className="stat-item hover-scale">
                                    <div className="stat-value accent">{clientsCount}+</div>
                                    <div className="stat-label">Clients</div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.section>

                    <ResumeModal
                        isOpen={isResumeModalOpen}
                        onClose={() => setIsResumeModalOpen(false)}
                        resumeUrl={personalInfo?.resume || '/SATYA SANATAN BASTIA - Resume.pdf'}
                        name={personalInfo?.name || 'Satya Sanatan'}
                    />
                </>
            )}
        </AnimatePresence>
    )
}

export default HeroSection
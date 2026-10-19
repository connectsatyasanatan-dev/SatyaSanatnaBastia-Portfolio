'use client'

import { GitCommit, GitMerge, Play, Pause, Diff, Activity } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import portfolioAPI, { Experience } from '@/lib/api'
import { FALLBACK_EXPERIENCES } from '@/lib/fallbackData'
import { ExperienceSectionSkeleton } from './AppSkeletons'

const GitHistory = () => {
    const [experiences, setExperiences] = useState<Experience[]>([])
    const [loading, setLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        setHasError(false)
        try {
            const data = await portfolioAPI.getExperience()
            if (data && data.length > 0) {
                setExperiences(data)
            } else {
                setExperiences(FALLBACK_EXPERIENCES)
            }
        } catch (e) {
            console.error('Failed to load experience', e)
            setExperiences(FALLBACK_EXPERIENCES)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    const changedFiles = [
        { status: "A", file: "src/components/Header.tsx", statusClass: "added" },
        { status: "M", file: "src/styles/globals.css", statusClass: "modified" },
        { status: "D", file: "legacy/OldNav.js", statusClass: "deleted" },
        { status: "M", file: "package.json", statusClass: "modified" },
    ]

    return (
        <AnimatePresence mode="wait">
            {loading ? (
                <motion.div
                    key="skeleton-experience"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                    transition={{ duration: 0.5 }}
                >
                    <ExperienceSectionSkeleton />
                </motion.div>
            ) : hasError ? null : (
                <motion.section
                    key="experience-content"
                    id="git-history-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div className="ide-section-header">
                        <div className="ide-section-header-left">
                            <div className="ide-section-icon-badge purple">
                                <GitCommit size={20} />
                            </div>
                            <div className="ide-section-titles">
                                <h2 className="ide-section-title">Git History &amp; Experience</h2>
                                <span className="ide-section-tag">// git_history.log</span>
                            </div>
                        </div>
                    </div>

                    <div className="timeline-container">
                        {/* Timeline */}
                        <div className="timeline-main">
                            <div className="timeline-line"></div>

                            {experiences.map((exp, index) => {
                                const periodStr = exp.period || ''
                                const isPresent = periodStr.toLowerCase().includes('present') || periodStr.toLowerCase().includes('current');
                                const expColor = exp.color || 'cyan';
                                const IconComponent = isPresent ? Play : Pause;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.2 }}
                                        className="timeline-item"
                                    >
                                        {/* Timeline dot */}
                                        <div className="timeline-dot">
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                className={`timeline-dot-inner ${expColor}`}
                                            >
                                                <IconComponent className={`${expColor}`} />
                                            </motion.div>
                                        </div>

                                        {/* Content card */}
                                        <motion.div
                                            whileHover={{ y: -2 }}
                                            className={`timeline-content ${expColor} ${isPresent ? 'active' : ''}`}
                                            style={isPresent ? {
                                                borderColor: 'var(--primary)',
                                                boxShadow: '0 0 15px rgba(6, 249, 249, 0.15), inset 0 0 20px rgba(6, 249, 249, 0.05)'
                                            } : {}}
                                        >
                                            <div className="timeline-header">
                                                <div className="timeline-title-group">
                                                    <div className="timeline-title-row">
                                                        <h4 className="timeline-title">{exp.title}</h4>
                                                        {exp.badge && (
                                                            <span className={`timeline-badge ${expColor}`}>
                                                                {exp.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={`timeline-company ${expColor}`}>@ {exp.company}</p>
                                                </div>
                                                <div className="timeline-meta">
                                                    <div className={`timeline-period ${isPresent ? 'active' : ''}`}>
                                                        {isPresent && (
                                                            <span className="live-indicator"></span>
                                                        )}
                                                        {periodStr}
                                                    </div>
                                                    <div className="timeline-commit">{exp.commit || 'main@head'}</div>
                                                </div>
                                            </div>

                                            <p className="timeline-description">{exp.description}</p>

                                            {exp.achievements && exp.achievements.length > 0 && (
                                                <div className="timeline-achievements">
                                                    <ul>
                                                        {exp.achievements.map((achievement, achIndex) => (
                                                            <li key={achIndex}>{achievement}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="timeline-technologies">
                                                {(exp.technologies || []).map((tech, techIndex) => (
                                                    <span
                                                        key={techIndex}
                                                        className={`tech-tag ${expColor}`}
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )
                            })}
                        </div>

                        {/* Changed files sidebar */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="changed-files-sidebar"
                        >
                            <div className="changed-files-header">
                                <Diff />
                                <h4 className="changed-files-title">Changed Files</h4>
                            </div>

                            <div className="changed-files-list">
                                {changedFiles.map((file, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="changed-file-item"
                                    >
                                        <span className={`file-status ${file.statusClass}`}>{file.status}</span>
                                        <span>{file.file}</span>
                                    </motion.div>
                                ))}

                                <div className="changed-files-stats">
                                    <div className="stats-row">
                                        <span>Additions</span>
                                        <span className="stats-additions">+452</span>
                                    </div>
                                    <div className="stats-row">
                                        <span>Deletions</span>
                                        <span className="stats-deletions">-128</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.section>
            )}
        </AnimatePresence>
    )
}

export default GitHistory
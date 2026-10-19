'use client'

import { useState, useEffect } from 'react'
import {
    Code2,
    Database,
    Cloud,
    Wrench,
    TrendingUp,
    Award,
    Zap,
    Target,
    Brain,
    Rocket,
    ChevronRight,
    Play,
    Pause
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import portfolioAPI, { SkillCategory, Achievements, PortfolioStats } from '@/lib/api'
import { SkillsSectionSkeleton } from './AppSkeletons'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
}

const SkillsSection = () => {
    const [activeCategory, setActiveCategory] = useState('frontend')
    const [isAnimating, setIsAnimating] = useState(true)
    const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)
    const [skills, setSkills] = useState<Record<string, SkillCategory>>({})
    const [achievements, setAchievements] = useState<Achievements | null>(null)
    const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [skillsData, achievementsData, statsData] = await Promise.all([
                    portfolioAPI.getSkills(),
                    portfolioAPI.getAchievements(),
                    portfolioAPI.getStats()
                ])
                setSkills(skillsData)

                // Set first category with skills as active
                const firstValidCategory = skillCategories.find(cat => skillsData[cat.key]?.skills.length > 0)
                if (firstValidCategory) {
                    setActiveCategory(firstValidCategory.key)
                }

                setAchievements(achievementsData)
                setPortfolioStats(statsData)
            } catch (error) {
                console.error('Failed to fetch skills data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const skillCategories = [
        {
            key: 'frontend',
            icon: Code2,
            color: '#06f9f9',
            gradient: 'from-cyan-400 to-blue-500',
            title: 'Frontend',
            description: 'User Interface & Experience'
        },
        {
            key: 'backend',
            icon: Database,
            color: '#ff00ff',
            gradient: 'from-purple-400 to-pink-500',
            title: 'Backend',
            description: 'Server & API Development'
        },
        {
            key: 'database',
            icon: Database,
            color: '#2de2e6',
            gradient: 'from-teal-400 to-cyan-500',
            title: 'Database',
            description: 'Data Storage & Management'
        },
        {
            key: 'cloud',
            icon: Cloud,
            color: '#00ff88',
            gradient: 'from-green-400 to-emerald-500',
            title: 'Cloud & DevOps',
            description: 'Infrastructure & Deployment'
        },
        {
            key: 'tools',
            icon: Wrench,
            color: '#ffaa00',
            gradient: 'from-yellow-400 to-orange-500',
            title: 'Tools & Others',
            description: 'Development Tools & Utilities'
        }
    ]

    const getSkillLevel = (level: number) => {
        if (level >= 90) return { label: 'Expert', color: '#00ff88' }
        if (level >= 80) return { label: 'Advanced', color: '#06f9f9' }
        if (level >= 70) return { label: 'Intermediate', color: '#ffaa00' }
        return { label: 'Beginner', color: '#ff00ff' }
    }

    const toggleAnimation = () => {
        setIsAnimating(!isAnimating)
    }

    useEffect(() => {
        if (isAnimating) {
            const interval = setInterval(() => {
                setActiveCategory(prev => {
                    const currentIndex = skillCategories.findIndex(cat => cat.key === prev)
                    const nextIndex = (currentIndex + 1) % skillCategories.length
                    return skillCategories[nextIndex].key
                })
            }, 4000)
            return () => clearInterval(interval)
        }
    }, [isAnimating, skillCategories])

    if (loading) {
        return <SkillsSectionSkeleton />
    }

    const activeSkillData = skills[activeCategory as keyof typeof skills]
    const activeCategoryData = skillCategories.find(cat => cat.key === activeCategory)

    return (
        <AnimatePresence mode="wait">
            {loading ? (
                <motion.div
                    key="skeleton-skills"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                    transition={{ duration: 0.5 }}
                >
                    <SkillsSectionSkeleton />
                </motion.div>
            ) : (
                <motion.section
                    key="skills-content"
                    id="skills-section"
                    className="skills-modern-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {/* Header with Animation Control */}
                    <div className="ide-section-header">
                        <div className="ide-section-header-left">
                            <div className="ide-section-icon-badge">
                                <Brain size={20} />
                            </div>
                            <div className="ide-section-titles">
                                <h2 className="ide-section-title">Technical Expertise</h2>
                                <span className="ide-section-tag">// technical_skills.ts</span>
                            </div>
                        </div>
                        <div className="ide-section-controls">
                            <button
                                className="animation-toggle"
                                onClick={toggleAnimation}
                                title={isAnimating ? 'Pause Animation' : 'Play Animation'}
                                aria-label={isAnimating ? 'Pause Animation' : 'Play Animation'}
                            >
                                {isAnimating ? <Pause size={14} /> : <Play size={14} />}
                            </button>
                        </div>
                    </div>

                    {/* Interactive Skills Explorer */}
                    <div className="skills-explorer">
                        {/* Category Navigation */}
                        <div className="category-nav">
                            {skillCategories
                                .filter(category => skills[category.key as keyof typeof skills]?.skills.length > 0)
                                .map((category) => {
                                    const IconComponent = category.icon
                                    const isActive = activeCategory === category.key

                                    return (
                                        <button
                                            key={category.key}
                                            className={`category-btn ${isActive ? 'active' : ''}`}
                                            onClick={() => setActiveCategory(category.key)}
                                            style={{
                                                '--category-color': category.color,
                                                '--category-gradient': `linear-gradient(135deg, ${category.color}20, ${category.color}10)`
                                            } as React.CSSProperties}
                                        >
                                            <div className="category-btn-icon">
                                                <IconComponent size={20} />
                                            </div>
                                            <div className="category-btn-content">
                                                <div className="category-btn-title">{category.title}</div>
                                                <div className="category-btn-desc">{category.description}</div>
                                            </div>
                                            <ChevronRight className="category-btn-arrow" size={16} />
                                        </button>
                                    )
                                })}
                        </div>

                        {/* Skills Display */}
                        <div className="skills-display">
                            {activeSkillData && (
                                <>
                                    <div className="skills-header">
                                        <div className="skills-category-info">
                                            <div
                                                className="category-icon-large"
                                                style={{ '--category-color': activeCategoryData?.color } as React.CSSProperties}
                                            >
                                                {activeCategoryData && <activeCategoryData.icon size={32} />}
                                            </div>
                                            <div className="category-details">
                                                <h4 className="category-title-large">{activeSkillData.title}</h4>
                                                <p className="category-description">{activeCategoryData?.description}</p>
                                            </div>
                                        </div>
                                        <div className="skills-count">
                                            {activeSkillData.skills?.length || 0} Skills
                                        </div>
                                    </div>

                                    <motion.div
                                        className="skills-grid-modern"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        key={activeCategory} // Force re-animation on category change
                                    >
                                        {(activeSkillData.skills || []).map((skill, index) => {
                                            const skillLevel = getSkillLevel(skill.level)
                                            const isHovered = hoveredSkill === skill.name

                                            return (
                                                <motion.div
                                                    key={skill.name}
                                                    variants={itemVariants}
                                                    className={`skill-card-modern ${isHovered ? 'hovered' : ''}`}
                                                    onMouseEnter={() => setHoveredSkill(skill.name)}
                                                    onMouseLeave={() => setHoveredSkill(null)}
                                                    style={{
                                                        '--skill-color': skillLevel.color,
                                                    } as React.CSSProperties}
                                                >
                                                    <div className="skill-card-content">
                                                        <div className="skill-name-row">
                                                            <span 
                                                                className="skill-dot" 
                                                                style={{ 
                                                                    backgroundColor: skillLevel.color,
                                                                    boxShadow: `0 0 8px ${skillLevel.color}`
                                                                }} 
                                                            />
                                                            <span className="skill-name">{skill.name}</span>
                                                        </div>
                                                        <span 
                                                            className="skill-level-badge" 
                                                            style={{ 
                                                                color: skillLevel.color,
                                                                borderColor: `${skillLevel.color}40`,
                                                                backgroundColor: `${skillLevel.color}15`
                                                            }}
                                                        >
                                                            {skillLevel.label}
                                                        </span>
                                                    </div>
                                                    <div className="skill-card-glow" style={{ backgroundColor: skillLevel.color }}></div>
                                                </motion.div>
                                            )
                                        })}
                                    </motion.div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Achievements Showcase */}
                    {achievements && achievements.highlights && achievements.highlights.length > 0 && (
                        <div className="achievements-showcase">
                            <div className="achievements-header-modern">
                                <div className="achievements-icon-container">
                                    <Award className="achievements-icon" />
                                    <div className="achievements-icon-glow"></div>
                                </div>
                                <div className="achievements-text">
                                    <h4 className="achievements-title">Key Achievements</h4>
                                    <p className="achievements-subtitle">Milestones & Recognition</p>
                                </div>
                            </div>

                            <div className="achievements-grid-modern">
                                {achievements.highlights.slice(0, 6).map((achievement, index) => (
                                    <div
                                        key={index}
                                        className="achievement-card-modern"
                                        style={{ '--animation-delay': `${index * 0.1}s` } as React.CSSProperties}
                                    >
                                        <div className="achievement-emoji">
                                            {achievement.split(' ')[0]}
                                        </div>
                                        <div className="achievement-content">
                                            <p className="achievement-text">
                                                {achievement.substring(achievement.indexOf(' ') + 1)}
                                            </p>
                                        </div>
                                        <div className="achievement-glow"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.section>
            )}
        </AnimatePresence>
    )
}

export default SkillsSection
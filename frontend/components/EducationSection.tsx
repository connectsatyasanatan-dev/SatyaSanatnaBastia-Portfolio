'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Calendar, MapPin, Star, BookOpen, Award, Lightbulb, ChevronRight, Sparkles, Binary, BrainCircuit, FlaskConical, Code2, Play, Pause } from 'lucide-react'
import portfolioAPI, { Education } from '@/lib/api'
import { EducationSectionSkeleton } from './AppSkeletons'

/* ─── Decorative particles ─── */
const Particles = () => (
    <div className="edu-particles" aria-hidden>
        {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className={`edu-particle edu-particle-${i % 6}`} style={{
                left: `${(i * 37 + 11) % 95}%`,
                top: `${(i * 53 + 7) % 90}%`,
                animationDelay: `${(i * 0.37).toFixed(2)}s`,
                animationDuration: `${3 + (i % 4) * 0.8}s`,
            }} />
        ))}
    </div>
)

/* ─── Hexagon icon badge ─── */
const HexBadge = ({ icon: Icon, active }: { icon: React.ElementType; active?: boolean }) => (
    <div className={`edu-hex-badge ${active ? 'active' : ''}`}>
        <svg viewBox="0 0 100 115" className="edu-hex-svg" aria-hidden>
            <polygon points="50,5 95,27.5 95,87.5 50,110 5,87.5 5,27.5" />
        </svg>
        <Icon size={20} className="edu-hex-icon" />
    </div>
)

/* ─── Animated course chip ─── */
const CourseChip = ({ label, delay }: { label: string; delay: number }) => (
    <motion.span
        className="edu-chip"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay }}
    >
        <span className="edu-chip-dot" />
        {label}
    </motion.span>
)

const degreeIcons: React.ElementType[] = [BrainCircuit, Code2, FlaskConical, BookOpen]

const EducationSection = () => {
    const [education, setEducation] = useState<Education[]>([])
    const [loading, setLoading] = useState(true)
    const [activeIndex, setActiveIndex] = useState<number>(0)
    const [isAnimating, setIsAnimating] = useState(true)
    const trackRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const eduData = await portfolioAPI.getEducation()
                setEducation([...eduData].reverse())
            } catch (error) {
                console.error('Failed to fetch education:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    useEffect(() => {
        if (isAnimating && education.length > 0) {
            const interval = setInterval(() => {
                setActiveIndex(prev => (prev + 1) % education.length)
            }, 4000)
            return () => clearInterval(interval)
        }
    }, [isAnimating, education.length])

    const toggleAnimation = () => {
        setIsAnimating(!isAnimating)
    }

    return (
        <AnimatePresence mode="wait">
            {loading ? (
                <motion.div 
                    key="skeleton-education"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                    transition={{ duration: 0.5 }}
                >
                    <EducationSectionSkeleton />
                </motion.div>
            ) : education.length === 0 ? null : (() => {
                const active = education[activeIndex]
                return (
                    <motion.section 
                        key="education-content"
                        id="edu-root"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <style>{`
                            /* ── root ── */
                            #edu-root {
                                position: relative;
                                max-width: 1200px;
                                margin: 0 auto 64px auto;
                                padding: 0 16px;
                                font-family: 'Space Grotesk', sans-serif;
                            }

                            /* ── floating particles ── */
                            .edu-particles {
                                position: absolute;
                                inset: 0;
                                pointer-events: none;
                                overflow: hidden;
                                border-radius: 24px;
                                z-index: 0;
                            }
                            .edu-particle {
                                position: absolute;
                                border-radius: 50%;
                                opacity: 0;
                                animation: edu-float linear infinite;
                            }
                            .edu-particle-0 { width:3px; height:3px; background:#06f9f9; }
                            .edu-particle-1 { width:2px; height:2px; background:#2de2e6; opacity:.7; }
                            .edu-particle-2 { width:4px; height:4px; background:rgba(6,249,249,0.4); }
                            .edu-particle-3 { width:2px; height:2px; background:#a78bfa; }
                            .edu-particle-4 { width:3px; height:3px; background:rgba(167,139,250,0.5); }
                            .edu-particle-5 { width:2px; height:2px; background:rgba(45,226,230,.6); }
                            @keyframes edu-float {
                                0%   { opacity:0; transform: translateY(20px) scale(.5); }
                                10%  { opacity:.8; }
                                90%  { opacity:.6; }
                                100% { opacity:0; transform: translateY(-80px) scale(1.2); }
                            }

                            /* ── section header ── */
                            .edu-header {
                                position: relative;
                                z-index: 1;
                                display: flex;
                                align-items: center;
                                gap: 14px;
                                margin-bottom: 36px;
                            }
                            .edu-header-icon-wrap {
                                position: relative;
                                width: 46px; height: 46px;
                                display: flex; align-items: center; justify-content: center;
                                flex-shrink: 0;
                            }
                            .edu-header-icon-bg {
                                position: absolute; inset: 0;
                                border-radius: 14px;
                                background: linear-gradient(135deg, rgba(6,249,249,.2), rgba(6,249,249,.04));
                                border: 1px solid rgba(6,249,249,.25);
                                animation: edu-halo 3s ease-in-out infinite;
                            }
                            @keyframes edu-halo {
                                0%,100% { box-shadow: 0 0 0 0 rgba(6,249,249,.25); }
                                50%     { box-shadow: 0 0 0 8px rgba(6,249,249,.04); }
                            }
                            .edu-header-icon { color: #06f9f9; position: relative; z-index: 1; }
                            .edu-header-text { flex: 1; min-width: 0; }
                            .edu-header-title {
                                font-size: var(--text-2xl); font-weight: 700;
                                letter-spacing: -.03em; color: #fff; margin: 0;
                                background: linear-gradient(90deg, #fff 40%, #06f9f9 100%);
                                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                                background-clip: text;
                            }
                            .edu-header-sub {
                                font-size: var(--text-xs); color: rgba(255,255,255,.4);
                                font-family: var(--font-mono);
                                letter-spacing: .06em; margin-top: 2px;
                            }
                            .edu-header-badge {
                                display: inline-flex; align-items: center; gap: 5px;
                                font-size: var(--text-xs); font-family: var(--font-mono);
                                color: #06f9f9; background: rgba(6,249,249,.08);
                                border: 1px solid rgba(6,249,249,.2); padding: 4px 12px;
                                border-radius: 20px; letter-spacing: .05em;
                                white-space: nowrap; flex-shrink: 0;
                            }
                            .edu-header-badge-dot {
                                width: 6px; height: 6px; border-radius: 50%;
                                background: #06f9f9; animation: edu-dot-pulse 1.6s ease-in-out infinite;
                            }
                            @keyframes edu-dot-pulse {
                                0%,100% { opacity:1; transform: scale(1); }
                                50%     { opacity:.4; transform: scale(.6); }
                            }

                            /* ── header buttons ── */
                            .edu-header-actions {
                                display: flex;
                                align-items: center;
                                gap: 12px;
                            }
                            .edu-animation-toggle {
                                background: rgba(6, 249, 249, 0.08);
                                border: 1px solid rgba(6, 249, 249, 0.2);
                                color: #06f9f9;
                                cursor: pointer;
                                display: flex; align-items: center; justify-content: center;
                                width: 32px; height: 32px; border-radius: 8px;
                                transition: all 0.2s ease;
                            }
                            .edu-animation-toggle:hover {
                                background: rgba(6, 249, 249, 0.15);
                                border-color: rgba(6, 249, 249, 0.35);
                                transform: scale(1.05);
                            }

                            /* ── layout: left nav + right detail ── */
                            .edu-layout {
                                position: relative; z-index: 1;
                                display: grid;
                                grid-template-columns: 280px 1fr;
                                gap: 20px;
                                align-items: start;
                            }
                            @media (max-width: 720px) {
                                .edu-layout { grid-template-columns: 1fr; }
                            }

                            /* ── left nav list ── */
                            .edu-nav {
                                display: flex; flex-direction: column; gap: 10px;
                            }

                            /* ── nav item ── */
                            .edu-nav-item {
                                position: relative; cursor: pointer;
                                border-radius: 14px; overflow: hidden;
                                border: 1px solid rgba(255,255,255,.06);
                                background: rgba(15,23,42,.45);
                                backdrop-filter: blur(10px);
                                padding: 14px 16px;
                                transition: border-color .3s, box-shadow .3s, transform .25s;
                                display: flex; align-items: center; gap: 12px;
                            }
                            .edu-nav-item:hover {
                                border-color: rgba(6,249,249,.22);
                                transform: translateX(3px);
                            }
                            .edu-nav-item.is-active {
                                border-color: rgba(6,249,249,.4);
                                background: rgba(6,249,249,.06);
                                box-shadow: 0 4px 24px rgba(6,249,249,.08), inset 0 0 0 1px rgba(6,249,249,.1);
                            }
                            .edu-nav-item.is-active .edu-nav-bar {
                                opacity: 1; transform: scaleY(1);
                            }
                            .edu-nav-bar {
                                position: absolute; left: 0; top: 12%; bottom: 12%;
                                width: 3px; border-radius: 2px;
                                background: linear-gradient(to bottom, #06f9f9, #2de2e6);
                                opacity: 0; transform: scaleY(0);
                                transform-origin: top;
                                transition: opacity .3s, transform .3s;
                            }
                            .edu-nav-info { flex: 1; min-width: 0; }
                            .edu-nav-degree {
                                font-size: var(--text-sm); font-weight: 600; color: #fff;
                                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                                line-height: 1.3; margin-bottom: 3px;
                            }
                            .edu-nav-school {
                                font-size: var(--text-xs); color: rgba(255,255,255,.5);
                                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                            }
                            .edu-nav-year {
                                font-family: var(--font-mono);
                                font-size: var(--text-2xs); color: #06f9f9; opacity: .8;
                                margin-top: 4px;
                            }
                            .edu-nav-arrow {
                                color: rgba(6,249,249,.4);
                                flex-shrink: 0;
                                transition: transform .25s, color .2s;
                            }
                            .edu-nav-item.is-active .edu-nav-arrow {
                                color: #06f9f9; transform: translateX(2px);
                            }

                            /* ── hex badge ── */
                            .edu-hex-badge {
                                position: relative; width: 40px; height: 46px;
                                display: flex; align-items: center; justify-content: center;
                                flex-shrink: 0;
                                transition: filter .3s;
                            }
                            .edu-hex-badge.active { filter: drop-shadow(0 0 8px rgba(6,249,249,.5)); }
                            .edu-hex-svg {
                                position: absolute; inset: 0; width: 100%; height: 100%;
                            }
                            .edu-hex-svg polygon {
                                fill: rgba(6,249,249,.08);
                                stroke: rgba(6,249,249,.3);
                                stroke-width: 3;
                                transition: fill .3s, stroke .3s;
                            }
                            .edu-hex-badge.active .edu-hex-svg polygon {
                                fill: rgba(6,249,249,.18);
                                stroke: #06f9f9;
                            }
                            .edu-hex-icon {
                                position: relative; z-index: 1;
                                color: rgba(6,249,249,.6);
                                transition: color .3s;
                            }
                            .edu-hex-badge.active .edu-hex-icon { color: #06f9f9; }

                            /* ── detail panel ── */
                            .edu-detail {
                                position: relative;
                                border-radius: 20px;
                                background: rgba(11,18,18,.75);
                                backdrop-filter: blur(16px);
                                border: 1px solid rgba(255,255,255,.07);
                                overflow: hidden;
                                box-shadow: 0 8px 40px rgba(0,0,0,.35);
                            }
                            .edu-detail-top-bar {
                                position: absolute; top: 0; left: 0; right: 0; height: 2px;
                                background: linear-gradient(90deg, transparent 0%, #06f9f9 40%, #a78bfa 70%, transparent 100%);
                                opacity: .7;
                            }
                            .edu-detail-ambient {
                                position: absolute; top: -60px; right: -60px;
                                width: 240px; height: 240px; border-radius: 50%;
                                background: radial-gradient(circle, rgba(6,249,249,.07) 0%, transparent 70%);
                                pointer-events: none;
                            }
                            .edu-detail-inner {
                                position: relative; z-index: 1;
                                padding: 30px 28px 28px;
                            }

                            /* detail: hero row */
                            .edu-detail-hero {
                                display: flex; align-items: flex-start;
                                gap: 16px; margin-bottom: 20px;
                            }
                            .edu-detail-text { flex: 1; min-width: 0; }
                            .edu-detail-degree {
                                font-size: 20px; font-weight: 800;
                                letter-spacing: -.02em; color: #fff;
                                line-height: 1.25; margin: 0 0 6px;
                            }
                            .edu-detail-school {
                                font-size: 14px; font-weight: 600;
                                color: #06f9f9; margin: 0; opacity: .9;
                            }

                            /* detail: meta chips */
                            .edu-detail-meta {
                                display: flex; flex-wrap: wrap; gap: 8px;
                                margin-bottom: 24px;
                            }
                            .edu-meta-pill {
                                display: inline-flex; align-items: center; gap: 6px;
                                font-size: 12px; font-family: 'JetBrains Mono', monospace;
                                color: rgba(255,255,255,.55);
                                background: rgba(255,255,255,.04);
                                border: 1px solid rgba(255,255,255,.09);
                                padding: 5px 12px; border-radius: 30px;
                            }
                            .edu-meta-pill.gpa-pill {
                                color: #fbbf24; background: rgba(251,191,36,.07);
                                border-color: rgba(251,191,36,.18);
                                font-weight: 600;
                            }
                            .edu-meta-pill svg { width: 12px; height: 12px; flex-shrink: 0; }

                            /* detail: focus strip */
                            .edu-focus {
                                display: flex; align-items: center; gap: 10px;
                                padding: 11px 14px; margin-bottom: 22px;
                                background: linear-gradient(90deg, rgba(6,249,249,.07), rgba(6,249,249,.02));
                                border: 1px solid rgba(6,249,249,.14);
                                border-radius: 10px;
                            }
                            .edu-focus-label {
                                font-size: 10px; font-weight: 700; letter-spacing: .1em;
                                text-transform: uppercase; color: #2de2e6;
                                white-space: nowrap;
                            }
                            .edu-focus-val { font-size: 13px; color: rgba(255,255,255,.75); }

                            /* detail: section divider label */
                            .edu-section-label {
                                display: flex; align-items: center; gap: 8px;
                                font-size: 10px; font-weight: 700;
                                text-transform: uppercase; letter-spacing: .1em;
                                color: rgba(255,255,255,.35);
                                margin-bottom: 12px;
                            }
                            .edu-section-label::after {
                                content: ''; flex: 1; height: 1px;
                                background: rgba(255,255,255,.06);
                            }

                            /* detail: course chips */
                            .edu-chips-wrap {
                                display: flex; flex-wrap: wrap; gap: 7px;
                                margin-bottom: 22px;
                            }
                            .edu-chip {
                                display: inline-flex; align-items: center; gap: 6px;
                                font-size: 12px; font-family: 'JetBrains Mono', monospace;
                                background: rgba(6,249,249,.06);
                                color: #06f9f9;
                                border: 1px solid rgba(6,249,249,.18);
                                padding: 5px 11px; border-radius: 7px;
                                transition: background .2s, border-color .2s;
                                cursor: default;
                            }
                            .edu-chip:hover {
                                background: rgba(6,249,249,.13);
                                border-color: rgba(6,249,249,.38);
                            }
                            .edu-chip-dot {
                                width: 5px; height: 5px; border-radius: 50%;
                                background: #06f9f9; opacity: .7; flex-shrink: 0;
                            }

                            /* detail: achievements */
                            .edu-ach-list { display: flex; flex-direction: column; gap: 10px; }
                            .edu-ach-row {
                                display: flex; align-items: flex-start; gap: 12px;
                                padding: 10px 14px; border-radius: 10px;
                                background: rgba(255,255,255,.03);
                                border: 1px solid rgba(255,255,255,.05);
                                transition: background .25s, border-color .25s;
                            }
                            .edu-ach-row:hover {
                                background: rgba(255,255,255,.055);
                                border-color: rgba(255,255,255,.1);
                            }
                            .edu-ach-num {
                                font-family: 'JetBrains Mono', monospace;
                                font-size: 11px; font-weight: 700;
                                color: #06f9f9; min-width: 20px;
                                margin-top: 1px; line-height: 1.5;
                            }
                            .edu-ach-text {
                                font-size: 13px; color: rgba(255,255,255,.72);
                                line-height: 1.6;
                            }

                            /* ── empty text ── */
                            .edu-empty {
                                padding: 40px; text-align: center;
                                color: rgba(255,255,255,.3); font-size: 14px;
                            }

                            /* ── responsive ── */
                            @media (max-width: 720px) {
                                .edu-layout { grid-template-columns: 1fr; }
                                .edu-nav {
                                    flex-direction: row;
                                    overflow-x: auto;
                                    -webkit-overflow-scrolling: touch;
                                    padding-bottom: 8px;
                                    gap: 8px;
                                }
                                .edu-nav-item {
                                    min-width: 220px;
                                    flex-shrink: 0;
                                }
                            }
                            @media (max-width: 480px) {
                                .edu-detail-inner { padding: 16px 12px 14px; }
                                .edu-detail-degree { font-size: 16px; }
                                .edu-detail-school { font-size: 13px; }
                                #edu-root { padding: 0 8px; margin-bottom: 48px; }
                                .edu-header-title { font-size: 20px; }
                                .edu-meta-pill { font-size: 11px; padding: 4px 8px; }
                                .edu-chip { font-size: 11px; padding: 4px 8px; }
                                .edu-nav-item {
                                    min-width: 180px;
                                    padding: 10px 12px;
                                }
                                .edu-nav-degree { font-size: 12px; }
                                .edu-nav-school { font-size: 10px; }
                            }
                            @media (min-width: 481px) and (max-width: 600px) {
                                .edu-detail-inner { padding: 20px 16px 18px; }
                                .edu-detail-degree { font-size: 17px; }
                                #edu-root { padding: 0 10px; }
                            }
                            @media (min-width: 640px)  { #edu-root { padding: 0 24px; } }
                            @media (min-width: 768px)  { #edu-root { padding: 0 32px; margin-bottom: 80px; } }
                            @media (min-width: 1024px) { #edu-root { padding: 0; } }
                        `}</style>

                        {/* Header */}
                        <div className="edu-header">
                            <div className="edu-header-icon-wrap">
                                <div className="edu-header-icon-bg" />
                                <GraduationCap size={22} className="edu-header-icon" />
                            </div>
                            <div className="edu-header-text">
                                <h2 className="edu-header-title">Education</h2>
                                <p className="edu-header-sub">// academic_journey.log</p>
                            </div>
                            <div className="edu-header-actions">
                                <button
                                    className="edu-animation-toggle"
                                    onClick={toggleAnimation}
                                    title={isAnimating ? 'Pause Animation' : 'Play Animation'}
                                >
                                    {isAnimating ? <Pause size={14} /> : <Play size={14} />}
                                </button>
                            </div>
                        </div>

                        {/* Main two-column layout */}
                        <div className="edu-layout">

                            {/* LEFT: navigation list */}
                            <nav className="edu-nav" aria-label="Education entries">
                                {education.map((edu, i) => {
                                    const Icon = degreeIcons[i % degreeIcons.length]
                                    return (
                                        <motion.div
                                            key={i}
                                            className={`edu-nav-item ${activeIndex === i ? 'is-active' : ''}`}
                                            onClick={() => setActiveIndex(i)}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4, delay: i * 0.12 }}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={e => e.key === 'Enter' && setActiveIndex(i)}
                                            aria-pressed={activeIndex === i}
                                        >
                                            <div className="edu-nav-bar" />
                                            <HexBadge icon={Icon} active={activeIndex === i} />
                                            <div className="edu-nav-info">
                                                <div className="edu-nav-degree">{edu.degree}</div>
                                                <div className="edu-nav-school">{edu.school}</div>
                                                {edu.period && <div className="edu-nav-year">{edu.period}</div>}
                                            </div>
                                            <ChevronRight size={14} className="edu-nav-arrow" />
                                        </motion.div>
                                    )
                                })}
                            </nav>

                            {/* RIGHT: detail panel */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeIndex}
                                    className="edu-detail"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                                >
                                    <div className="edu-detail-top-bar" />
                                    <div className="edu-detail-ambient" />
                                    <div className="edu-detail-inner">

                                        {/* Hero */}
                                        <div className="edu-detail-hero">
                                            <div className="edu-detail-text">
                                                <h3 className="edu-detail-degree">{active.degree}</h3>
                                                <p className="edu-detail-school">{active.school}</p>
                                            </div>
                                        </div>

                                        {/* Meta pills */}
                                        <div className="edu-detail-meta">
                                            {active.location && (
                                                <span className="edu-meta-pill">
                                                    <MapPin />{active.location}
                                                </span>
                                            )}
                                            {active.period && (
                                                <span className="edu-meta-pill">
                                                    <Calendar />{active.period}
                                                </span>
                                            )}
                                            {active.gpa && (
                                                <span className="edu-meta-pill gpa-pill">
                                                    <Star />GPA: {active.gpa}
                                                </span>
                                            )}
                                        </div>

                                        {/* Focus strip */}
                                        {active.focus && (
                                            <div className="edu-focus">
                                                <Lightbulb size={14} color="#2de2e6" />
                                                <span className="edu-focus-label">Stream</span>
                                                <span className="edu-focus-val">{active.focus}</span>
                                            </div>
                                        )}

                                        {/* Courses */}
                                        {active.relevant_courses && active.relevant_courses.length > 0 && (
                                            <>
                                                <div className="edu-section-label">
                                                    <BookOpen size={11} />
                                                    Relevant Coursework
                                                </div>
                                                <div className="edu-chips-wrap">
                                                    {active.relevant_courses.map((c, ci) => (
                                                        <CourseChip key={ci} label={c} delay={ci * 0.05} />
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {/* Achievements */}
                                        {active.achievements && active.achievements.length > 0 && (
                                            <>
                                                <div className="edu-section-label">
                                                    <Award size={11} />
                                                    Highlights
                                                </div>
                                                <div className="edu-ach-list">
                                                    {active.achievements.map((ach, ai) => (
                                                        <motion.div
                                                            key={ai}
                                                            className="edu-ach-row"
                                                            initial={{ opacity: 0, x: 10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ duration: 0.3, delay: ai * 0.07 }}
                                                        >
                                                            <span className="edu-ach-num">0{ai + 1}</span>
                                                            <span className="edu-ach-text">{ach}</span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {!active.focus && !active.relevant_courses?.length && !active.achievements?.length && (
                                            <div className="edu-empty">No additional details available.</div>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.section>
                )
            })()}
        </AnimatePresence>
    )
}

export default EducationSection
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote, Star, User, Building, ChevronLeft, ChevronRight, Play, Pause, Sparkles } from 'lucide-react'
import portfolioAPI, { Testimonial } from '@/lib/api'
import { TestimonialsSectionSkeleton } from './AppSkeletons'

const TestimonialsSection = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([])
    const [loading, setLoading] = useState(true)
    const [activeIndex, setActiveIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)
    const [direction, setDirection] = useState(0) // -1 for left, 1 for right

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const data = await portfolioAPI.getTestimonials()
                setTestimonials(data)
            } catch (error) {
                console.error('Failed to fetch testimonials:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchTestimonials()
    }, [])

    const slideNext = useCallback(() => {
        if (testimonials.length === 0) return
        setDirection(1)
        setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, [testimonials.length])

    const slidePrev = useCallback(() => {
        if (testimonials.length === 0) return
        setDirection(-1)
        setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }, [testimonials.length])

    useEffect(() => {
        if (isAutoPlaying && testimonials.length > 0) {
            const timer = setInterval(slideNext, 6000)
            return () => clearInterval(timer)
        }
    }, [isAutoPlaying, testimonials.length, slideNext])

    // Animation variants for the unique slider effect
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 150 : -150,
            opacity: 0,
            scale: 0.95,
            rotateY: direction > 0 ? 15 : -15,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            rotateY: 0,
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
            }
        },
        exit: (direction: number) => ({
            x: direction > 0 ? -150 : 150,
            opacity: 0,
            scale: 0.95,
            rotateY: direction > 0 ? -15 : 15,
            transition: {
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1]
            }
        })
    }

    return (
        <AnimatePresence mode="wait">
            {loading ? (
                <motion.div
                    key="skeleton-testimonials"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                    transition={{ duration: 0.5 }}
                >
                    <TestimonialsSectionSkeleton />
                </motion.div>
            ) : testimonials.length === 0 ? null : (() => {
                const active = testimonials[activeIndex]
                return (
                    <motion.section
                        key="testimonials-content"
                        id="testimonials-root"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <style>{`
                            /* ── root container ── */
                            #testimonials-root {
                                position: relative;
                                max-width: 1200px;
                                margin: 100px auto 140px auto;
                                padding: 0 24px;
                                font-family: 'Space Grotesk', sans-serif;
                                perspective: 1200px;
                            }

                            /* ── background glass ── */
                            .testi-container {
                                position: relative;
                                width: 100%;
                                background: rgba(15, 23, 42, 0.4);
                                backdrop-filter: blur(28px);
                                border: 1px solid rgba(255, 255, 255, 0.08);
                                border-radius: 40px;
                                overflow: hidden;
                                box-shadow: 0 40px 100px -30px rgba(0, 0, 0, 0.6),
                                            inset 0 0 0 1px rgba(255, 255, 255, 0.03);
                            }

                            /* ── section heading ── */
                            .testi-header {
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                margin-bottom: 30px;
                                padding-left: 10px;
                            }
                            .testi-header-title {
                                font-size: var(--text-2xl); font-weight: 700; color: #fff;
                                background: linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.4));
                                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                            }
                            .testi-header-badge {
                                display: flex; align-items: center; gap: 8px;
                                padding: 6px 14px; background: rgba(255, 255, 255, 0.05);
                                border: 1px solid rgba(255, 255, 255, 0.1);
                                border-radius: 20px; font-size: var(--text-xs); color: rgba(255, 255, 255, 0.6);
                                font-family: var(--font-mono);
                            }

                            /* ── slider wrapper ── */
                            .testi-slider {
                                position: relative;
                                min-height: 440px;
                                display: grid;
                                grid-template-columns: 1fr;
                                align-items: center;
                            }

                            /* ── the active slide ── */
                            .testi-slide {
                                grid-area: 1 / 1;
                                display: flex;
                                flex-direction: column;
                                padding: 30px 60px;
                            }
                            @media (max-width: 900px) { .testi-slide { padding: 40px 30px; } }

                            /* ── decorative elements ── */
                            .testi-quote-mark {
                                position: absolute; top: -20px; left: -20px;
                                width: 120px; height: 120px;
                                color: rgba(255, 255, 255, 0.03);
                                pointer-events: none;
                            }

                            /* ── content parts ── */
                            .testi-meta-row {
                                display: flex; align-items: center; gap: 20px; margin-bottom: 36px;
                            }
                            .testi-avatar-placeholder {
                                width: 76px; height: 76px; border-radius: 20px;
                                background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03));
                                display: flex; align-items: center; justify-content: center;
                                border: 1px solid rgba(255, 255, 255, 0.1);
                                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                            }
                            .testi-info {
                                display: flex; flex-direction: column; gap: 4px;
                            }
                            .testi-name { font-size: var(--text-lg); font-weight: 700; color: #fff; margin: 0; }
                            .testi-position {
                                display: flex; align-items: center; gap: 8px;
                                font-size: var(--text-sm); color: rgba(255, 255, 255, 0.6);
                            }

                            .testi-stars {
                                display: flex; gap: 6px; margin-bottom: 24px;
                            }
                            .star-filled { color: #facc15; }
                            .star-empty { color: rgba(255, 255, 255, 0.1); }

                            .testi-quote-text {
                                font-size: clamp(1.125rem, 1rem + 0.6vw, 1.375rem);
                                font-weight: 500;
                                line-height: 1.6;
                                color: #fff;
                                letter-spacing: -0.01em;
                                margin: 0 0 40px 0;
                                max-width: 800px;
                            }
                            @media (max-width: 768px) { .testi-quote-text { font-size: 1.125rem; } }

                            /* ── navigation controls ── */
                            .testi-nav {
                                position: absolute; bottom: 50px; right: 80px;
                                display: flex; align-items: center; gap: 16px;
                                z-index: 10;
                            }
                            @media (max-width: 900px) { .testi-nav { right: 30px; bottom: 30px; } }

                            .testi-btn {
                                width: 52px; height: 52px; border-radius: 18px;
                                background: rgba(255, 255, 255, 0.05);
                                border: 1px solid rgba(255, 255, 255, 0.1);
                                color: #fff; cursor: pointer;
                                display: flex; align-items: center; justify-content: center;
                                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                            }
                            .testi-btn:hover {
                                background: rgba(255, 255, 255, 0.12);
                                transform: translateY(-4px);
                                border-color: rgba(255, 255, 255, 0.2);
                            }
                            .testi-btn:active { transform: scale(0.95); }

                            .testi-btn.pause-btn { background: rgba(255, 255, 255, 0.03); }

                            /* ── progress indicator ── */
                            .testi-progress-bar {
                                position: absolute; bottom: 0; left: 0; height: 4px;
                                background: linear-gradient(90deg, #3b82f6, #3b82f6, #a78bfa);
                                transition: width linear;
                            }

                            /* ── pagination dots ── */
                            .testi-dots {
                                position: absolute; bottom: 50px; left: 80px;
                                display: flex; gap: 8px;
                            }
                            @media (max-width: 900px) { .testi-dots { left: 30px; bottom: 30px; } }
                            .dot {
                                width: 8px; height: 8px; border-radius: 50%;
                                background: rgba(255, 255, 255, 0.1);
                                transition: all 0.3s ease; cursor: pointer;
                            }
                            .dot.active { width: 32px; border-radius: 10px; background: #3b82f6; }

                            /* ── ambient glow ── */
                            .testi-glow {
                                position: absolute; width: 600px; height: 600px;
                                background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
                                top: 50%; left: 50%; transform: translate(-50%, -50%);
                                pointer-events: none; z-index: -1;
                            }

                            /* ── mobile responsive ── */
                            @media (max-width: 600px) {
                                #testimonials-root {
                                    margin: 48px auto 64px auto;
                                    padding: 0 8px;
                                }
                                .testi-header {
                                    flex-direction: column;
                                    align-items: flex-start;
                                    gap: 12px;
                                    margin-bottom: 28px;
                                }
                                .testi-header-title {
                                    font-size: 22px;
                                }
                                .testi-header-badge {
                                    font-size: 11px;
                                    padding: 4px 10px;
                                }
                                .testi-container {
                                    border-radius: 20px;
                                }
                                .testi-slide {
                                    padding: 28px 20px 80px 20px;
                                }
                                .testi-slider {
                                    min-height: 380px;
                                }
                                .testi-meta-row {
                                    gap: 12px;
                                    margin-bottom: 20px;
                                }
                                .testi-avatar-placeholder {
                                    width: 52px;
                                    height: 52px;
                                    border-radius: 14px;
                                }
                                .testi-name {
                                    font-size: 16px;
                                }
                                .testi-position {
                                    font-size: 12px;
                                }
                                .testi-quote-text {
                                    font-size: 16px;
                                    margin-bottom: 24px;
                                }
                                .testi-nav {
                                    right: 16px;
                                    bottom: 16px;
                                    gap: 8px;
                                }
                                .testi-btn {
                                    width: 40px;
                                    height: 40px;
                                    border-radius: 12px;
                                }
                                .testi-dots {
                                    left: 20px;
                                    bottom: 24px;
                                }
                                .testi-quote-mark {
                                    width: 60px;
                                    height: 60px;
                                    top: -10px;
                                    left: -10px;
                                }
                            }
                        `}</style>

                        <div className="testi-header">
                            <div className="testi-header-title">Endorsements</div>
                            {/* <div className="testi-header-badge">
                                <Sparkles size={14} className="text-blue-400" />
                                <span>Premium Collaborations</span>
                            </div> */}
                        </div>

                        <div className="testi-container">
                            <div className="testi-slider">
                                <Quote size={200} className="testi-quote-mark" />

                                <AnimatePresence mode="wait" custom={direction}>
                                    <motion.div
                                        key={activeIndex}
                                        custom={direction}
                                        variants={variants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{
                                            x: { type: "spring", stiffness: 300, damping: 30 },
                                            opacity: { duration: 0.2 },
                                            scale: { duration: 0.4 },
                                            rotateY: { duration: 0.4 }
                                        }}
                                        className="testi-slide"
                                    >
                                        <div className="testi-meta-row">
                                            <div className="testi-avatar-placeholder" style={{ padding: 0, overflow: 'hidden', background: 'linear-gradient(135deg, rgba(255,255,255,0.05), transparent)' }}>
                                                <img
                                                    src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(active.name)}&backgroundColor=transparent`}
                                                    alt={`${active.name} Avatar`}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            </div>
                                            <div className="testi-info">
                                                <h4 className="testi-name">{active.name}</h4>
                                                <div className="testi-position">
                                                    <Building size={14} />
                                                    <span>{active.role} at {active.company}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="testi-stars">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={18}
                                                    fill={i < (active.rating || 5) ? "currentColor" : "none"}
                                                    className={i < (active.rating || 5) ? "star-filled" : "star-empty"}
                                                />
                                            ))}
                                        </div>

                                        <blockquote className="testi-quote-text">
                                            "{active.text}"
                                        </blockquote>
                                    </motion.div>
                                </AnimatePresence>

                                <div className="testi-dots">
                                    {testimonials.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`dot ${i === activeIndex ? 'active' : ''}`}
                                            onClick={() => {
                                                setDirection(i > activeIndex ? 1 : -1)
                                                setActiveIndex(i)
                                            }}
                                        />
                                    ))}
                                </div>

                                <div className="testi-nav">
                                    <button className="testi-btn pause-btn" onClick={() => setIsAutoPlaying(!isAutoPlaying)}>
                                        {isAutoPlaying ? <Pause size={20} /> : <Play size={20} />}
                                    </button>
                                    <button className="testi-btn" onClick={slidePrev}>
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button className="testi-btn" onClick={slideNext}>
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Animated progress bar for auto-play */}
                            {isAutoPlaying && (
                                <motion.div
                                    key={`progress-${activeIndex}`}
                                    className="testi-progress-bar"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 6, ease: "linear" }}
                                />
                            )}
                        </div>

                        <div className="testi-glow" />
                    </motion.section>
                )
            })()}
        </AnimatePresence>
    )
}

export default TestimonialsSection
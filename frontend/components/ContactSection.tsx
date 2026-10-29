'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mail, Github, Linkedin, Twitter, MapPin, Calendar,
    Coffee, Send, User, AtSign, MessageSquare, FileText,
    CheckCircle2, XCircle, Loader2, Terminal
} from 'lucide-react'
import portfolioAPI, { PersonalInfo } from '@/lib/api'
import { ContactSectionSkeleton } from './AppSkeletons'

const MAX_MESSAGE = 1000

const ContactSection = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
    const [touched, setTouched] = useState({ name: false, email: false, subject: false, message: false })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null)
    const [loadingInfo, setLoadingInfo] = useState(true)

    useEffect(() => {
        portfolioAPI.getPersonalInfo()
            .then(setPersonalInfo)
            .catch(() => { })
            .finally(() => setLoadingInfo(false))
    }, [])

    const validate = {
        name: formData.name.trim().length >= 2,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
        message: formData.message.trim().length >= 10,
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        if (name === 'message' && value.length > MAX_MESSAGE) return
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTouched(prev => ({ ...prev, [e.target.name]: true }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setTouched({ name: true, email: true, subject: true, message: true })
        if (!validate.name || !validate.email || !validate.message) return

        setIsSubmitting(true)
        setSubmitStatus('idle')
        try {
            await portfolioAPI.submitContactForm(formData)
            setSubmitStatus('success')
            setFormData({ name: '', email: '', subject: '', message: '' })
            setTouched({ name: false, email: false, subject: false, message: false })
        } catch {
            setSubmitStatus('error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const emailVal = personalInfo?.email || 'connectsatyasanatan@gmail.com'
    const githubVal = personalInfo?.github || 'https://github.com/connectsatyasanatan'
    const linkedinVal = personalInfo?.linkedin || 'https://www.linkedin.com/in/satya-sanatan-bastia-298644223/'
    const twitterVal = personalInfo?.twitter || 'https://twitter.com/satyasanatan'

    const contactLinks = [
        { icon: Mail, label: 'Email', value: emailVal, href: `mailto:${emailVal}`, color: '#06f9f9' },
        { icon: Github, label: 'GitHub', value: githubVal, href: githubVal, color: '#ffffff' },
        { icon: Linkedin, label: 'LinkedIn', value: linkedinVal, href: linkedinVal, color: '#60a5fa' },
        { icon: Twitter, label: 'Twitter', value: twitterVal, href: twitterVal, color: '#38bdf8' },
    ]

    const statusItems = [
        { icon: MapPin, label: 'Location', value: personalInfo?.location || 'Bhubaneswar, Odisha, India', color: '#f97316' },
        { icon: Calendar, label: 'Availability', value: personalInfo?.availability || 'Available for opportunities', color: '#22c55e' },
        { icon: Coffee, label: 'Timezone', value: personalInfo?.timezone || 'IST (UTC+5:30)', color: '#eab308' },
    ]

    const fieldState = (field: 'name' | 'email' | 'message') => {
        if (!touched[field]) return 'idle'
        return validate[field] ? 'valid' : 'invalid'
    }

    return (
        <AnimatePresence mode="wait">
            {loadingInfo ? (
                <motion.div key="skeleton-contact"
                    initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                    transition={{ duration: 0.5 }}>
                    <ContactSectionSkeleton />
                </motion.div>
            ) : (
                <motion.section key="contact-content" id="contact-section"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}>

                    {/* ── Section header ── */}
                    <div className="ide-section-header">
                        <div className="ide-section-header-left">
                            <div className="ide-section-icon-badge">
                                <Mail size={20} />
                            </div>
                            <div className="ide-section-titles">
                                <h2 className="ide-section-title">Contact &amp; Availability</h2>
                                <span className="ide-section-tag">// init_connection.json</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Top grid: links + status ── */}
                    <div className="contact-grid">
                        {/* Connect card */}
                        <motion.div className="contact-methods-card"
                            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.6 }}>
                            <h4 className="card-title">
                                <span className="bracket">{'{'}</span> Connect with me <span className="bracket">{'}'}</span>
                            </h4>
                            <div className="contact-methods">
                                {contactLinks.map((m, i) => (
                                    <motion.a key={i} href={m.href} target="_blank" rel="noopener noreferrer"
                                        className="contact-method"
                                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                        whileHover={{ x: 5 }}>
                                        <div className="method-icon">
                                            <m.icon size={18} style={{ color: m.color }} />
                                        </div>
                                        <div className="method-info">
                                            <div className="method-label">{m.label}</div>
                                            <div className="method-value">{m.value || '-'}</div>
                                        </div>
                                        <div className="method-arrow">→</div>
                                    </motion.a>
                                ))}
                            </div>
                        </motion.div>

                        {/* Status card */}
                        <motion.div className="availability-card"
                            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
                            <h4 className="card-title">
                                <span className="bracket secondary">{'<'}</span> Current Status <span className="bracket secondary">{'/>'}</span>
                            </h4>
                            <div className="availability-info">
                                {statusItems.map((item, i) => (
                                    <motion.div key={i} className="availability-item"
                                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }} transition={{ delay: i * 0.1 + 0.2 }}>
                                        <div className="item-icon">
                                            <item.icon size={18} style={{ color: item.color }} />
                                        </div>
                                        <div className="item-info">
                                            <div className="item-label">{item.label}</div>
                                            <div className="item-value">{item.value}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="status-indicator">
                                <div className="status-header">
                                    <div className="status-dot available" />
                                    <span className="status-text">AVAILABLE FOR HIRE</span>
                                </div>
                                <p className="status-description">
                                    Open to full-stack roles, freelance projects, and collaborations
                                    in React, Next.js, Python, and cloud architecture.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* ── Quick CTA ── */}
                    <motion.div className="contact-cta"
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}>
                        <motion.a
                            href={personalInfo?.email ? `mailto:${personalInfo.email}?subject=Let's work together!` : '#'}
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className="cta-button">
                            <Mail size={18} />
                            Let's Build Something Amazing
                        </motion.a>
                    </motion.div>

                    {/* ── Send Message form ── */}
                    <motion.div className="cf-wrapper"
                        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.5 }}>

                        {/* VS Code window chrome */}
                        <div className="cf-chrome">
                            <div className="cf-dots">
                                <span className="cf-dot red" />
                                <span className="cf-dot yellow" />
                                <span className="cf-dot green" />
                            </div>
                            <div className="cf-chrome-title">
                                <Terminal size={13} />
                                <span>contact.json - Send Message</span>
                            </div>
                            <div className="cf-chrome-lang">JSON</div>
                        </div>

                        {/* Line-number gutter + form body */}
                        <div className="cf-body">
                            <div className="cf-gutter">
                                {Array.from({ length: 14 }, (_, i) => (
                                    <span key={i}>{i + 1}</span>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit} className="cf-form" noValidate>

                                {/* Row: name + email */}
                                <div className="cf-row">
                                    <div className={`cf-field ${fieldState('name')}`}>
                                        <label className="cf-label">
                                            <User size={12} />
                                            name <span className="cf-required">*</span>
                                        </label>
                                        <div className="cf-input-wrap">
                                            <input
                                                type="text" name="name" autoComplete="name"
                                                value={formData.name} onChange={handleChange} onBlur={handleBlur}
                                                placeholder="Your full name"
                                                className="cf-input" disabled={isSubmitting} />
                                            {touched.name && (
                                                <span className="cf-status-icon">
                                                    {validate.name
                                                        ? <CheckCircle2 size={14} className="cf-valid" />
                                                        : <XCircle size={14} className="cf-invalid" />}
                                                </span>
                                            )}
                                        </div>
                                        {touched.name && !validate.name && (
                                            <span className="cf-error">Minimum 2 characters required</span>
                                        )}
                                    </div>

                                    <div className={`cf-field ${fieldState('email')}`}>
                                        <label className="cf-label">
                                            <AtSign size={12} />
                                            email <span className="cf-required">*</span>
                                        </label>
                                        <div className="cf-input-wrap">
                                            <input
                                                type="email" name="email" autoComplete="email"
                                                value={formData.email} onChange={handleChange} onBlur={handleBlur}
                                                placeholder="you@example.com"
                                                className="cf-input" disabled={isSubmitting} />
                                            {touched.email && (
                                                <span className="cf-status-icon">
                                                    {validate.email
                                                        ? <CheckCircle2 size={14} className="cf-valid" />
                                                        : <XCircle size={14} className="cf-invalid" />}
                                                </span>
                                            )}
                                        </div>
                                        {touched.email && !validate.email && (
                                            <span className="cf-error">Enter a valid email address</span>
                                        )}
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="cf-field idle">
                                    <label className="cf-label">
                                        <FileText size={12} />
                                        subject <span className="cf-optional">(optional)</span>
                                    </label>
                                    <input
                                        type="text" name="subject"
                                        value={formData.subject} onChange={handleChange} onBlur={handleBlur}
                                        placeholder="Project inquiry, collaboration, freelance…"
                                        className="cf-input" disabled={isSubmitting} />
                                </div>

                                {/* Message */}
                                <div className={`cf-field ${fieldState('message')}`}>
                                    <label className="cf-label">
                                        <MessageSquare size={12} />
                                        message <span className="cf-required">*</span>
                                    </label>
                                    <div className="cf-input-wrap cf-textarea-wrap">
                                        <textarea
                                            name="message" rows={6}
                                            value={formData.message} onChange={handleChange} onBlur={handleBlur}
                                            placeholder={"Tell me about your project, idea, or just say hi...\n\n// I read every message and reply within 24 hours."}
                                            className="cf-input cf-textarea" disabled={isSubmitting} />
                                        {touched.message && (
                                            <span className="cf-status-icon cf-status-textarea">
                                                {validate.message
                                                    ? <CheckCircle2 size={14} className="cf-valid" />
                                                    : <XCircle size={14} className="cf-invalid" />}
                                            </span>
                                        )}
                                    </div>
                                    <div className="cf-meta-row">
                                        {touched.message && !validate.message && (
                                            <span className="cf-error">Minimum 10 characters required</span>
                                        )}
                                        <span className={`cf-char-count ${formData.message.length > MAX_MESSAGE * 0.9 ? 'warn' : ''}`}>
                                            {formData.message.length} / {MAX_MESSAGE}
                                        </span>
                                    </div>
                                </div>

                                {/* Submit */}
                                <motion.button type="submit"
                                    className={`cf-submit${isSubmitting ? ' loading' : ''}`}
                                    disabled={isSubmitting}
                                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}>
                                    {isSubmitting ? (
                                        <><Loader2 size={16} className="cf-spin" /> Sending…</>
                                    ) : (
                                        <><Send size={16} className="cf-send-icon" /> Send Message</>
                                    )}
                                </motion.button>

                                {/* Feedback */}
                                <AnimatePresence>
                                    {submitStatus === 'success' && (
                                        <motion.div className="cf-feedback success"
                                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}>
                                            <CheckCircle2 size={16} />
                                            Message sent! I'll get back to you within 24 hours.
                                        </motion.div>
                                    )}
                                    {submitStatus === 'error' && (
                                        <motion.div className="cf-feedback error"
                                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}>
                                            <XCircle size={16} />
                                            Failed to send. Please email me directly at{' '}
                                            <a href={`mailto:${personalInfo?.email}`}>{personalInfo?.email}</a>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </div>

                        {/* Status bar */}
                        <div className="cf-statusbar">
                            <span className="cf-sb-item">
                                <span className={`cf-sb-dot ${submitStatus === 'success' ? 'green' : submitStatus === 'error' ? 'red' : 'blue'}`} />
                                {submitStatus === 'success' ? 'Sent' : submitStatus === 'error' ? 'Error' : 'Ready'}
                            </span>
                            <span className="cf-sb-item">contact.json</span>
                            <span className="cf-sb-item">UTF-8</span>
                            <span className="cf-sb-item">JSON</span>
                        </div>
                    </motion.div>

                </motion.section>
            )}
        </AnimatePresence>
    )
}

export default ContactSection

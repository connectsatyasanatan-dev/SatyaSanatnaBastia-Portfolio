'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Calendar, X, ExternalLink, Activity } from 'lucide-react'
import portfolioAPI, { Certification } from '@/lib/api'
import { FALLBACK_CERTIFICATIONS } from '@/lib/fallbackData'
import { CertificationsSectionSkeleton } from './AppSkeletons'

const CertificationsSection = () => {
    const [certifications, setCertifications] = useState<Certification[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCert, setSelectedCert] = useState<Certification | null>(null)

    useEffect(() => {
        if (selectedCert) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [selectedCert])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const certData = await portfolioAPI.getCertifications()
                if (certData && certData.length > 0) {
                    setCertifications(certData)
                } else {
                    setCertifications(FALLBACK_CERTIFICATIONS)
                }
            } catch (error) {
                console.error('Failed to fetch certifications:', error)
                setCertifications(FALLBACK_CERTIFICATIONS)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <AnimatePresence mode="wait">
            {loading ? (
                <motion.div
                    key="skeleton-certifications"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                    transition={{ duration: 0.5 }}
                >
                    <CertificationsSectionSkeleton />
                </motion.div>
            ) : certifications.length === 0 ? null : (
                <motion.section
                    key="certifications-content"
                    id="certifications-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ maxWidth: '1536px', margin: '0 auto 48px auto', padding: '0 var(--space-4, 16px)', position: 'relative' }}
                >
                    <style>{`
                        .certifications-grid {
                            display: grid;
                            grid-template-columns: 1fr;
                            gap: 24px;
                            margin-bottom: 32px;
                        }
                        @media (min-width: 720px) {
                            .certifications-grid {
                                grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                            }
                        }
                        .certifications-grid.single-item {
                            grid-template-columns: 1fr;
                        }
                        .cert-card {
                            background: rgba(15, 23, 42, 0.6);
                            backdrop-filter: blur(12px);
                            border: 1px solid rgba(255, 255, 255, 0.08);
                            border-radius: 16px;
                            padding: 24px;
                            display: flex;
                            flex-direction: column;
                            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                            overflow: hidden;
                            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                            cursor: pointer;
                        }
                        .cert-card::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            height: 2px;
                            background: linear-gradient(90deg, transparent, #9333ea, #db2777, transparent);
                            opacity: 0.7;
                            transition: opacity 0.5s ease;
                        }
                        .cert-card::after {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            height: 150px;
                            background: radial-gradient(circle at 50% 0%, rgba(147, 51, 234, 0.15), transparent 70%);
                            pointer-events: none;
                            z-index: 0;
                        }
                        .cert-card:hover {
                            transform: translateY(-6px);
                            border-color: rgba(218, 165, 32, 0.4);
                            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
                        }
                        .cert-card:hover::before {
                            opacity: 1;
                            background: linear-gradient(90deg, transparent, #db2777, #f59e0b, transparent);
                        }
                        .cert-header, .cert-meta-list, .cert-credential-id {
                            position: relative;
                            z-index: 1;
                        }
                        .cert-header {
                            display: flex;
                            align-items: flex-start;
                            gap: 16px;
                            margin-bottom: 20px;
                        }
                        .cert-icon-wrapper {
                            width: 56px;
                            height: 56px;
                            border-radius: 12px;
                            background: rgba(218, 165, 32, 0.1);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: goldenrod;
                            flex-shrink: 0;
                            transition: all 0.3s ease;
                            border: 1px solid rgba(218, 165, 32, 0.2);
                        }
                        .cert-icon-wrapper.has-image {
                            background: transparent;
                            border: none;
                        }
                        .cert-icon-wrapper.has-image img {
                            border-radius: 10px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        }
                        .cert-card:hover .cert-icon-wrapper:not(.has-image) {
                            background: goldenrod;
                            color: #fff;
                            transform: rotate(5deg) scale(1.05);
                        }
                        .cert-card:hover .cert-icon-wrapper.has-image img {
                            transform: scale(1.05);
                            transition: transform 0.3s ease;
                        }
                        .cert-title-area {
                            flex: 1;
                        }
                        .cert-name {
                            font-size: 18px;
                            font-weight: 700;
                            color: white;
                            margin: 0 0 6px 0;
                            line-height: 1.3;
                            letter-spacing: -0.01em;
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                        }
                        .cert-issuer {
                            font-size: 14px;
                            color: rgba(255, 255, 255, 0.6);
                            margin: 0;
                            font-weight: 500;
                        }
                        .cert-meta-list {
                            background: rgba(0, 0, 0, 0.2);
                            border-radius: 8px;
                            padding: 12px;
                            margin-top: auto;
                            display: grid;
                            gap: 10px;
                        }
                        .cert-meta-item {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            font-size: 13px;
                            color: rgba(255, 255, 255, 0.7);
                        }
                        .cert-meta-icon {
                            width: 14px;
                            height: 14px;
                            color: var(--secondary);
                        }
                        .cert-status-indicator {
                            width: 8px;
                            height: 8px;
                            border-radius: 50%;
                            box-shadow: 0 0 8px currentColor;
                        }
                        .cert-credential-id {
                            margin-top: 16px;
                            padding-top: 16px;
                            border-top: 1px dashed rgba(255, 255, 255, 0.1);
                            font-family: 'JetBrains Mono', monospace;
                            font-size: 12px;
                            color: rgba(255, 255, 255, 0.5);
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        }
                        .cert-verify-btn {
                            color: goldenrod;
                            text-decoration: none;
                            font-weight: 600;
                            transition: opacity 0.2s;
                        }
                        .cert-verify-btn:hover {
                            opacity: 0.8;
                        }

                        /* Single Item Specific Styles */
                        .cert-card.single-item {
                            flex-direction: column;
                            align-items: center;
                            text-align: center;
                            padding: 32px;
                            gap: 24px;
                        }
                        .cert-card.single-item .cert-header {
                            flex-direction: column;
                            align-items: center;
                            gap: 20px;
                            margin-bottom: 0;
                        }
                        .cert-card.single-item .cert-icon-wrapper {
                            width: 120px;
                            height: 120px;
                        }
                        .cert-card.single-item .cert-name {
                            font-size: 24px;
                            -webkit-line-clamp: unset;
                        }
                        .cert-card.single-item .cert-issuer {
                            font-size: 16px;
                            margin-bottom: 16px;
                        }
                        .cert-card.single-item .cert-meta-list {
                            width: 100%;
                            max-width: 400px;
                            margin: 24px auto 0 auto;
                        }
                        .cert-card.single-item .cert-credential-id {
                            width: 100%;
                            max-width: 400px;
                            margin: 16px auto 0 auto;
                        }

                        @media (min-width: 768px) {
                            .cert-card.single-item {
                                flex-direction: row;
                                text-align: left;
                                padding: 48px;
                                gap: 40px;
                                align-items: stretch;
                            }
                            .cert-card.single-item .cert-header {
                                flex-direction: row;
                                flex: 1;
                                margin: 0;
                                text-align: left;
                                align-items: center;
                            }
                            .cert-card.single-item .cert-icon-wrapper {
                                width: 150px;
                                height: 150px;
                            }
                            .cert-card.single-item .cert-name {
                                font-size: 28px;
                                margin-bottom: 8px;
                            }
                            .cert-card.single-item .cert-issuer {
                                font-size: 18px;
                                margin-bottom: 0;
                            }
                            .cert-card.single-item .cert-meta-list {
                                margin: 0;
                                min-width: 250px;
                                max-width: none;
                                background: rgba(0, 0, 0, 0.3);
                                padding: 24px;
                                border-radius: 16px;
                                align-self: center;
                            }
                            .cert-card.single-item .cert-credential-id {
                                position: absolute;
                                bottom: 24px;
                                right: 48px;
                                margin: 0;
                                max-width: none;
                                width: auto;
                                border: none;
                                padding: 0;
                            }
                            .cert-card.single-item .cert-detail-group {
                                display: flex;
                                flex-direction: column;
                                justify-content: center;
                            }
                        }

                        /* Modal Styles */
                        .cert-modal-overlay {
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100vw;
                            height: 100vh;
                            background: rgba(0, 0, 0, 0.75);
                            backdrop-filter: blur(12px);
                            z-index: 9999;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            padding: 20px;
                        }
                        .cert-modal-content {
                            background: #0f172a;
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            border-radius: 24px;
                            width: 100%;
                            max-width: 550px;
                            padding: 40px 32px;
                            position: relative;
                            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            text-align: center;
                            overflow: hidden;
                        }
                        .cert-modal-content::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            height: 200px;
                            background: radial-gradient(circle at 50% -20%, rgba(147, 51, 234, 0.25), transparent 70%);
                            pointer-events: none;
                        }
                        .cert-modal-close {
                            position: absolute;
                            top: 20px;
                            right: 20px;
                            background: rgba(255,255,255,0.05);
                            border: 1px solid rgba(255,255,255,0.1);
                            border-radius: 50%;
                            width: 36px;
                            height: 36px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: rgba(255,255,255,0.7);
                            cursor: pointer;
                            transition: all 0.2s;
                            z-index: 10;
                        }
                        .cert-modal-close:hover {
                            background: rgba(255,255,255,0.1);
                            color: white;
                            transform: scale(1.05);
                        }
                        .cert-modal-badge {
                            width: 140px;
                            height: 140px;
                            border-radius: 24px;
                            margin-bottom: 24px;
                            background: rgba(218, 165, 32, 0.05);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border: 1px solid rgba(218, 165, 32, 0.2);
                            overflow: hidden;
                            position: relative;
                            z-index: 1;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                        }
                        .cert-modal-badge img {
                            width: 100%;
                            height: 100%;
                            object-fit: contain;
                        }
                        .cert-modal-title {
                            font-size: 26px;
                            font-weight: 700;
                            color: white;
                            margin: 0 0 8px 0;
                            line-height: 1.3;
                        }
                        .cert-modal-issuer {
                            font-size: 16px;
                            color: rgba(255, 255, 255, 0.6);
                            margin: 0 0 32px 0;
                            font-weight: 500;
                        }
                        .cert-modal-details {
                            width: 100%;
                            background: rgba(0, 0, 0, 0.3);
                            border: 1px solid rgba(255,255,255,0.05);
                            border-radius: 16px;
                            padding: 24px;
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 20px;
                            text-align: left;
                            margin-bottom: 32px;
                        }
                        .cert-modal-detail-item {
                            display: flex;
                            flex-direction: column;
                            gap: 6px;
                        }
                        .cert-modal-detail-label {
                            font-size: 12px;
                            color: rgba(255,255,255,0.4);
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                        }
                        .cert-modal-detail-value {
                            font-size: 15px;
                            color: rgba(255,255,255,0.9);
                            font-weight: 500;
                            word-break: break-all;
                        }
                        .cert-modal-verify {
                            background: linear-gradient(135deg, #9333ea, #db2777);
                            color: white;
                            border: none;
                            padding: 14px 36px;
                            border-radius: 30px;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s;
                            text-decoration: none;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            box-shadow: 0 4px 15px rgba(219, 39, 119, 0.2);
                        }
                        .cert-modal-verify:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 8px 25px rgba(219, 39, 119, 0.4);
                        }
                        
                        @media (max-width: 768px) {
                            .certifications-grid {
                                grid-template-columns: 1fr;
                            }
                            .cert-modal-details {
                                grid-template-columns: 1fr;
                            }
                            .cert-modal-content {
                                padding: 32px 20px;
                            }
                            .cert-modal-title {
                                font-size: 22px;
                            }
                        }
                        @media (max-width: 480px) {
                            .cert-card {
                                padding: 18px;
                            }
                            .cert-name {
                                font-size: 16px;
                            }
                        }
                    `}</style>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <Award size={28} style={{ color: 'goldenrod' }} />
                        <h2 className="section-title" style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.025em', color: 'white', margin: 0 }}>Licenses & Certifications</h2>
                    </div>

                    <div className={`certifications-grid ${certifications.length === 1 ? 'single-item' : ''}`}>
                        {certifications.map((cert, index) => {
                            const isValid = cert.validity?.includes('2025') || cert.validity?.includes('2026') || cert.validity?.toLowerCase().includes('no expiration');
                            const hasBadge = !!cert.badge;

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className={`cert-card ${certifications.length === 1 ? 'single-item' : ''}`}
                                    onClick={() => setSelectedCert(cert)}
                                >
                                    <div className="cert-header">
                                        <div className={`cert-icon-wrapper ${hasBadge ? 'has-image' : ''}`}>
                                            {hasBadge ? (
                                                <img
                                                    src={cert.badge}
                                                    alt={`${cert.name} Badge`}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <Award size={28} />
                                            )}
                                        </div>
                                        <div className="cert-title-area">
                                            <h4 className="cert-name">{cert.name}</h4>
                                            <p className="cert-issuer">{cert.issuer}</p>
                                        </div>
                                    </div>

                                    <div className="cert-meta-list">
                                        {cert.date && (
                                            <div className="cert-meta-item">
                                                <Calendar className="cert-meta-icon" />
                                                <span>Issued {cert.date}</span>
                                            </div>
                                        )}
                                        {cert.validity && (
                                            <div className="cert-meta-item">
                                                <span
                                                    className="cert-status-indicator"
                                                    style={{ color: isValid ? '#22c55e' : '#eab308' }}
                                                />
                                                <span>{cert.validity}</span>
                                            </div>
                                        )}
                                    </div>

                                    {cert.credential && (
                                        <div className="cert-credential-id" onClick={(e) => e.stopPropagation()}>
                                            <span>ID: {cert.credential}</span>
                                            <a 
                                                href={cert.verify_url || "#"} 
                                                className="cert-verify-btn" 
                                                target={cert.verify_url ? "_blank" : undefined}
                                                rel={cert.verify_url ? "noopener noreferrer" : undefined}
                                            >
                                                Verify ↗
                                            </a>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    <AnimatePresence>
                        {selectedCert && (
                            <motion.div
                                className="cert-modal-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedCert(null)}
                            >
                                <motion.div
                                    className="cert-modal-content"
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button className="cert-modal-close" onClick={() => setSelectedCert(null)}>
                                        <X size={20} />
                                    </button>

                                    <div className="cert-modal-badge">
                                        {selectedCert.badge ? (
                                            <img src={selectedCert.badge} alt="Certification Badge" />
                                        ) : (
                                            <Award size={64} style={{ color: 'goldenrod' }} />
                                        )}
                                    </div>

                                    <h3 className="cert-modal-title">{selectedCert.name}</h3>
                                    <p className="cert-modal-issuer">{selectedCert.issuer}</p>

                                    <div className="cert-modal-details">
                                        {selectedCert.date && (
                                            <div className="cert-modal-detail-item">
                                                <div className="cert-modal-detail-label">
                                                    <Calendar size={14} /> Issued Date
                                                </div>
                                                <div className="cert-modal-detail-value">{selectedCert.date}</div>
                                            </div>
                                        )}
                                        {selectedCert.validity && (
                                            <div className="cert-modal-detail-item">
                                                <div className="cert-modal-detail-label">
                                                    <Activity size={14} /> Status
                                                </div>
                                                <div className="cert-modal-detail-value" style={{
                                                    color: (selectedCert.validity.includes('2025') || selectedCert.validity.includes('2026') || selectedCert.validity.toLowerCase().includes('no expiration')) ? '#4ade80' : '#facc15'
                                                }}>
                                                    {selectedCert.validity}
                                                </div>
                                            </div>
                                        )}
                                        {selectedCert.credential && (
                                            <div className="cert-modal-detail-item" style={{ gridColumn: '1 / -1' }}>
                                                <div className="cert-modal-detail-label">Credential ID</div>
                                                <div className="cert-modal-detail-value" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px' }}>
                                                    {selectedCert.credential}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {selectedCert.verify_url && (
                                        <a href={selectedCert.verify_url} className="cert-modal-verify" target="_blank" rel="noopener noreferrer">
                                            Verify Credential <ExternalLink size={18} />
                                        </a>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.section>
            )}
        </AnimatePresence>
    )
}

export default CertificationsSection

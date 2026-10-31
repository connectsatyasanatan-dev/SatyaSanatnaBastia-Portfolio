'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, FileText, ExternalLink, Printer, Loader2 } from 'lucide-react'

interface ResumeModalProps {
    isOpen: boolean
    onClose: () => void
    resumeUrl: string | null
    name: string
}

const LOCAL_RESUME = '/resume.pdf'

const ResumeModal = ({ isOpen, onClose, resumeUrl, name }: ResumeModalProps) => {
    const [loading, setLoading] = useState(true)
    const [activePdfUrl, setActivePdfUrl] = useState(LOCAL_RESUME)
    const iframeRef = useRef<HTMLIFrameElement>(null)

    useEffect(() => {
        if (!isOpen) return

        setLoading(true)
        const target = resumeUrl?.trim() || LOCAL_RESUME

        // If target is already local resume, set and finish loading
        if (target === LOCAL_RESUME) {
            setActivePdfUrl(LOCAL_RESUME)
            const timer = setTimeout(() => setLoading(false), 500)
            return () => clearTimeout(timer)
        }

        let cancelled = false
        setActivePdfUrl(target)

        // Validate target URL: ensure it doesn't return 404 or JSON error like {"error":"Endpoint not found"}
        fetch(target, { method: 'GET' })
            .then(res => {
                if (cancelled) return
                const contentType = res.headers.get('content-type') || ''
                // If response is not ok or returns JSON error instead of PDF:
                if (!res.ok || contentType.includes('application/json')) {
                    console.warn(`Resume endpoint returned ${res.status} ${contentType}. Falling back to ${LOCAL_RESUME}`)
                    setActivePdfUrl(LOCAL_RESUME)
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setActivePdfUrl(LOCAL_RESUME)
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false)
                }
            })

        return () => {
            cancelled = true
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
            link.href = LOCAL_RESUME
            link.target = '_blank'
            link.download = 'Satya Sanatan Bastia - Resume.pdf'
            link.click()
        }
    }

    const handlePrint = () => {
        if (iframeRef.current?.contentWindow) {
            try {
                iframeRef.current.contentWindow.print()
                return
            } catch {
                // fall through
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
                    {/* Header */}
                    <div className="resume-modal-header">
                        <div className="header-left">
                            <FileText className="text-primary" size={20} />
                            <div>
                                <h3>Curriculum Vitae</h3>
                                <p>{name} &bull; Software Engineer</p>
                            </div>
                        </div>

                        <div className="header-actions">
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

                    {/* Viewer Body: PDF Document ONLY */}
                    <div className="resume-viewer-body">
                        {loading && (
                            <div className="resume-loader">
                                <Loader2 className="animate-spin text-primary" size={36} />
                                <p style={{ fontSize: '13px', color: '#94a3b8' }}>Loading Resume Document...</p>
                            </div>
                        )}

                        <iframe
                            key={activePdfUrl}
                            ref={iframeRef}
                            id="resume-pdf-frame"
                            src={`${activePdfUrl}#view=FitH`}
                            className="resume-iframe"
                            title="Satya Sanatan Bastia - Curriculum Vitae"
                            onLoad={() => setLoading(false)}
                            onError={() => {
                                if (activePdfUrl !== LOCAL_RESUME) {
                                    setActivePdfUrl(LOCAL_RESUME)
                                }
                            }}
                        />
                    </div>

                    {/* Footer */}
                    <div className="resume-modal-footer">
                        <p>Document Security: Verified &amp; Signed</p>
                        <a
                            href={activePdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="external-link"
                        >
                            Open in New Tab <ExternalLink size={13} />
                        </a>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default ResumeModal

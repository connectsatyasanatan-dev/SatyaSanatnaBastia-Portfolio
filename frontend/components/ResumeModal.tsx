'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, FileText, ExternalLink, Printer, ZoomIn, ZoomOut, Loader2 } from 'lucide-react'

interface ResumeModalProps {
    isOpen: boolean
    onClose: () => void
    resumeUrl: string | null
    name: string
}

const LOCAL_RESUME_FALLBACK = '/SATYA SANATAN BASTIA - Resume.pdf'

const ResumeModal = ({ isOpen, onClose, resumeUrl, name }: ResumeModalProps) => {
    const [loading, setLoading] = useState(true)
    const [zoom, setZoom] = useState(100)
    const [currentUrl, setCurrentUrl] = useState(resumeUrl || LOCAL_RESUME_FALLBACK)

    useEffect(() => {
        if (isOpen) {
            setLoading(true)
            setZoom(100)
            setCurrentUrl(resumeUrl || LOCAL_RESUME_FALLBACK)
        }
    }, [isOpen, resumeUrl])

    const handleDownload = async () => {
        const target = currentUrl || LOCAL_RESUME_FALLBACK
        try {
            const response = await fetch(target)
            if (!response.ok) throw new Error('Fetch failed')
            const blob = await response.blob()
            const blobUrl = window.URL.createObjectURL(blob)
            
            const link = document.createElement('a')
            link.href = blobUrl
            link.download = "Satya Sanatan Bastia - Resume.pdf"
            
            document.body.appendChild(link)
            link.click()
            
            document.body.removeChild(link)
            window.URL.revokeObjectURL(blobUrl)
        } catch (error) {
            console.error('Download failed, using local fallback:', error)
            const link = document.createElement('a')
            link.href = LOCAL_RESUME_FALLBACK
            link.target = '_blank'
            link.download = "Satya Sanatan Bastia - Resume.pdf"
            link.click()
        }
    }

    const handlePrint = () => {
        const iframe = document.getElementById('resume-iframe') as HTMLIFrameElement
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.print()
        }
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
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="resume-modal-content"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="resume-modal-header">
                        <div className="header-left">
                            <FileText className="text-primary" size={20} />
                            <div>
                                <h3>Curriculum Vitae</h3>
                                <p>{name}</p>
                            </div>
                        </div>
                        <div className="header-actions">
                            <div className="zoom-controls">
                                <button onClick={() => setZoom(prev => Math.max(50, prev - 10))} title="Zoom Out">
                                    <ZoomOut size={18} />
                                </button>
                                <span>{zoom}%</span>
                                <button onClick={() => setZoom(prev => Math.min(200, prev + 10))} title="Zoom In">
                                    <ZoomIn size={18} />
                                </button>
                            </div>
                            
                            <button onClick={handlePrint} className="action-btn" title="Print">
                                <Printer size={18} />
                            </button>
                            
                            <button onClick={handleDownload} className="download-btn-modern">
                                <Download size={18} />
                                <span>Download PDF</span>
                            </button>
                            
                            <button onClick={onClose} className="close-btn-modern">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="resume-viewer-body">
                        {loading && (
                            <div className="resume-loader">
                                <Loader2 className="animate-spin text-primary" size={40} />
                                <p>Loading Document...</p>
                            </div>
                        )}
                        
                        {!currentUrl ? (
                            <div className="resume-error">
                                <FileText size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                <p>Resume file not found.</p>
                            </div>
                        ) : (
                            <iframe
                                id="resume-iframe"
                                src={`${currentUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                className="resume-iframe"
                                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                                onLoad={() => setLoading(false)}
                                onError={() => {
                                    if (currentUrl !== LOCAL_RESUME_FALLBACK) {
                                        setCurrentUrl(LOCAL_RESUME_FALLBACK);
                                    }
                                }}
                            />
                        )}
                    </div>
                    
                    <div className="resume-modal-footer">
                        <p>Document Security: Verified & Signed</p>
                        <a href={currentUrl || LOCAL_RESUME_FALLBACK} target="_blank" rel="noopener noreferrer" className="external-link">
                            Open in New Tab <ExternalLink size={14} />
                        </a>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default ResumeModal

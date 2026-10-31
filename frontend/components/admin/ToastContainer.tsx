'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { toast } from '@/lib/toast'

const ToastContainer = () => {
    const [toasts, setToasts] = useState<Array<{
        id: string
        message: string
        type: 'success' | 'error' | 'warning' | 'info'
    }>>([])

    useEffect(() => {
        const unsubscribe = toast.subscribe(newToasts => {
            setToasts(newToasts)
        })

        return unsubscribe
    }, [])

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 size={16} />
            case 'error':
                return <AlertCircle size={16} />
            case 'warning':
                return <AlertTriangle size={16} />
            case 'info':
            default:
                return <Info size={16} />
        }
    }

    return (
        <aside className="admin-toast-container" aria-label="Notifications" aria-live="polite">
            <AnimatePresence mode="popLayout">
                {toasts.map(t => (
                    <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, y: -12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96, transition: { duration: 0.15 } }}
                        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                        className={`admin-toast ${t.type}`}
                        role="status"
                    >
                        <div className="admin-toast-icon">
                            {getIcon(t.type)}
                        </div>
                        <div className="admin-toast-content">
                            <p className="admin-toast-text">{t.message}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => toast.dismiss(t.id)}
                            className="admin-toast-close"
                            aria-label="Dismiss notification"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </aside>
    )
}

export default ToastContainer

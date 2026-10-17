'use client'

import { useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ErrorAlertProps {
    message: string
    type?: 'error' | 'warning' | 'success' | 'info'
    onDismiss?: () => void
    autoDismiss?: boolean
    dismissTimeout?: number
}

const ErrorAlert = ({
    message,
    type = 'error',
    onDismiss,
    autoDismiss = false,
    dismissTimeout = 5000
}: ErrorAlertProps) => {
    const [isVisible, setIsVisible] = useState(true)

    const typeClasses = {
        error: 'admin-message-error',
        warning: 'admin-message-warning',
        success: 'admin-message-success',
        info: 'admin-message-info'
    }

    const iconColors = {
        error: 'admin-icon-error',
        warning: 'admin-icon-warning',
        success: 'admin-icon-success',
        info: 'admin-icon-info'
    }

    const handleDismiss = () => {
        setIsVisible(false)
        if (onDismiss) {
            setTimeout(onDismiss, 300)
        }
    }

    if (autoDismiss && isVisible) {
        setTimeout(handleDismiss, dismissTimeout)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`admin-toast-message ${type} admin-transition`}
                >
                    <AlertCircle className="admin-toast-icon admin-icon-sm" />
                    <div className="admin-toast-content">
                        <p className="admin-toast-text">{message}</p>
                    </div>
                    {onDismiss && (
                        <button
                            onClick={handleDismiss}
                            className="admin-toast-close"
                        >
                            <X className="admin-icon-sm" />
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default ErrorAlert
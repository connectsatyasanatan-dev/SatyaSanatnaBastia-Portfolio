'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to console
        console.error('Unhandled application error:', error)
    }, [error])

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'var(--background-dark, #0b0f1a)',
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--error-color, #f44336)' }}>
                Something went wrong!
            </h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary, #8b949e)', maxWidth: '600px' }}>
                An unexpected error has occurred. Below is the error detail to help diagnose the issue:
            </p>

            {error && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '16px',
                    maxWidth: '800px',
                    width: '100%',
                    marginBottom: '20px',
                    textAlign: 'left',
                    overflow: 'auto',
                }}>
                    <p style={{ color: '#f87171', fontWeight: 600, margin: '0 0 8px 0', fontSize: '14px' }}>
                        {error.name || 'Error'}: {error.message || 'Unknown error'}
                    </p>
                    {error.digest && (
                        <p style={{ color: '#94a3b8', fontSize: '11px', margin: '0 0 8px 0', fontFamily: 'monospace' }}>
                            Digest: {error.digest}
                        </p>
                    )}
                    {error.stack && (
                        <pre style={{ color: '#cbd5e1', fontSize: '11px', margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
                            {error.stack}
                        </pre>
                    )}
                </div>
            )}

            <button
                onClick={() => reset()}
                style={{
                    padding: '0.75rem 1.5rem',
                    background: 'var(--accent-color, #0a74da)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 600,
                    transition: 'background 0.2s',
                }}
            >
                Try again
            </button>
        </div>
    )
}

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Terminal, Minimize2, Maximize2, X, CornerDownLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { TerminalSectionSkeleton } from './AppSkeletons'
import { applyTheme } from '@/lib/theme'

interface TerminalLog {
    text: string
    type: 'command' | 'success' | 'info' | 'warning' | 'highlight' | 'dim' | 'default'
}

const INITIAL_LOGS: TerminalLog[] = [
    { text: '$ git status', type: 'command' },
    { text: "On branch main", type: 'dim' },
    { text: "Your branch is up to date with 'origin/main'.", type: 'dim' },
    { text: '$ npm run build', type: 'command' },
    { text: '✔ Creating an optimized production build', type: 'success' },
    { text: '✔ Compiled successfully in 1.4s', type: 'success' },
    { text: '✔ Linting and checking validity of types', type: 'success' },
    { text: '✔ System loaded with fail-safe fallbacks active', type: 'info' },
    { text: "Route (app)                              Size     First Load JS", type: 'dim' },
    { text: "┌ ○ /                                    142 B          87.4 kB", type: 'dim' },
    { text: "└ ○ /about                               139 B          87.4 kB", type: 'dim' },
    { text: '$ echo "Ready for new opportunities! Type \'help\' for CLI commands 🚀"', type: 'command' },
    { text: "Ready for new opportunities! Type 'help' for CLI commands 🚀", type: 'highlight' },
]

export default function TerminalSection() {
    const [isMinimized, setIsMinimized] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [logs, setLogs] = useState<TerminalLog[]>(INITIAL_LOGS)
    const [inputVal, setInputVal] = useState('')
    const [history, setHistory] = useState<string[]>([])
    const [historyIdx, setHistoryIdx] = useState<number>(-1)

    const inputRef = useRef<HTMLInputElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500)
        return () => clearTimeout(timer)
    }, [])

    const scrollToBottom = () => {
        setTimeout(() => {
            if (contentRef.current) {
                contentRef.current.scrollTop = contentRef.current.scrollHeight
            }
        }, 10)
    }

    const executeCommand = (raw: string) => {
        const cmd = raw.trim()
        if (!cmd) return

        setHistory(prev => [...prev, cmd])
        setHistoryIdx(-1)

        const newLogs: TerminalLog[] = [...logs, { text: `$ ${cmd}`, type: 'command' }]
        const parts = cmd.split(' ')
        const root = parts[0].toLowerCase()
        const arg = parts.slice(1).join(' ').trim().toLowerCase()

        switch (root) {
            case 'help':
                newLogs.push(
                    { text: '── Available Portfolio CLI Commands ──', type: 'highlight' },
                    { text: '  whoami          - Identity & background summary', type: 'info' },
                    { text: '  skills          - Tech stack breakdown by domain', type: 'info' },
                    { text: '  projects        - Featured projects & architecture', type: 'info' },
                    { text: '  contact         - Direct email, phone & profiles', type: 'info' },
                    { text: '  theme [name]    - Switch theme (cyberpunk | dracula | onedark | tokyonight)', type: 'info' },
                    { text: '  stats           - Telemetry, lines of code & commits', type: 'info' },
                    { text: '  resume          - Download Curriculum Vitae (PDF)', type: 'info' },
                    { text: '  palette         - Launch VS Code Command Palette', type: 'info' },
                    { text: '  clear           - Reset terminal console', type: 'info' }
                )
                break

            case 'whoami':
                newLogs.push(
                    { text: '👤 Satya Sanatan Sahoo', type: 'highlight' },
                    { text: 'Role: Full Stack Developer & AI Solutions Engineer', type: 'success' },
                    { text: 'Focus: High-performance Web Applications, Scalable APIs & Agentic AI', type: 'info' },
                    { text: 'Location: Bhubaneswar, Odisha, India (UTC +05:30)', type: 'dim' },
                    { text: 'Status: Open to Full-time Opportunities & High-impact Contracts', type: 'success' }
                )
                break

            case 'skills':
                newLogs.push(
                    { text: '⚡ Core Technical Arsenal:', type: 'highlight' },
                    { text: '  Frontend : React 18, Next.js 14, TypeScript, Vanilla CSS3, Framer Motion', type: 'info' },
                    { text: '  Backend  : Python 3.11, Flask, Node.js, Express, REST APIs, WebSockets', type: 'info' },
                    { text: '  Database : PostgreSQL, Redis, MongoDB, SQLAlchemy, psycopg2', type: 'info' },
                    { text: '  DevOps   : Docker, GitHub Actions CI/CD, AWS EC2, Linux, Nginx', type: 'info' },
                    { text: '  AI/ML    : Groq AI, LangChain, RAG Pipelines, Prompt Engineering', type: 'info' }
                )
                break

            case 'projects':
                newLogs.push(
                    { text: '🚀 Key Featured Projects:', type: 'highlight' },
                    { text: '  1. VS Code Interactive Portfolio - IDE simulator in Next.js + Flask', type: 'success' },
                    { text: '  2. Zentara AI Representative - Custom agent for automated visitor interaction', type: 'success' },
                    { text: '  3. CodeSnippet Cloud Manager - Multi-language snippet manager with tags', type: 'success' },
                    { text: '  4. DevPulse Telemetry Dashboard - Real-time analytics with charts', type: 'success' },
                    { text: 'Tip: Press Ctrl+P or type "palette" to jump directly to any project.', type: 'dim' }
                )
                break

            case 'contact':
                newLogs.push(
                    { text: '📬 Contact Coordinates:', type: 'highlight' },
                    { text: '  Email    : connectsatyasanatan@gmail.com', type: 'success' },
                    { text: '  Phone    : +91 7978252276', type: 'info' },
                    { text: '  LinkedIn : https://www.linkedin.com/in/satya-sanatan-bastia-298644223/', type: 'info' },
                    { text: '  GitHub   : https://github.com/connectsatyasanatan', type: 'info' }
                )
                break

            case 'theme':
                if (!arg) {
                    newLogs.push(
                        { text: 'Available themes: cyberpunk, dracula, onedark, tokyonight', type: 'highlight' },
                        { text: 'Usage: theme dracula', type: 'dim' }
                    )
                } else if (['cyberpunk', 'dracula', 'onedark', 'tokyonight'].includes(arg)) {
                    applyTheme(arg as any)
                    newLogs.push({ text: `✔ Applied theme: ${arg}`, type: 'success' })
                } else {
                    newLogs.push({ text: `Unknown theme "${arg}". Valid options: cyberpunk, dracula, onedark, tokyonight`, type: 'warning' })
                }
                break

            case 'stats':
                newLogs.push(
                    { text: '📊 Developer Metrics:', type: 'highlight' },
                    { text: '  Projects Completed : 15+', type: 'info' },
                    { text: '  Years Experience   : 2+', type: 'info' },
                    { text: '  GitHub Commits     : 1,420+', type: 'info' },
                    { text: '  Lines of Code      : 120,000+', type: 'info' },
                    { text: '  Coffee Consumed    : 1,024 cups ☕', type: 'dim' }
                )
                break

            case 'resume':
                newLogs.push({ text: '✔ Opening resume in new tab...', type: 'success' })
                if (typeof window !== 'undefined') {
                    window.open('/resume.pdf', '_blank')
                }
                break

            case 'palette':
                newLogs.push({ text: 'Opening Command Palette...', type: 'dim' })
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('open_command_palette'))
                }
                break

            case 'clear':
                setLogs([])
                setInputVal('')
                return

            case 'sudo':
                if (cmd.includes('rm -rf')) {
                    newLogs.push(
                        { text: '🚨 Nice try! This incident will be reported to Santa Claus 🎅', type: 'highlight' },
                        { text: 'Permission denied: root sandbox is locked.', type: 'warning' }
                    )
                } else {
                    newLogs.push({ text: 'User is not in the sudoers file. Incident logged.', type: 'warning' })
                }
                break

            default:
                newLogs.push({
                    text: `zsh: command not found: ${cmd}. Type 'help' for available commands.`,
                    type: 'warning'
                })
        }

        setLogs(newLogs)
        setInputVal('')
        scrollToBottom()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            executeCommand(inputVal)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            if (history.length === 0) return
            const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1)
            setHistoryIdx(nextIdx)
            setInputVal(history[nextIdx] || '')
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            if (historyIdx === -1) return
            const nextIdx = historyIdx + 1
            if (nextIdx >= history.length) {
                setHistoryIdx(-1)
                setInputVal('')
            } else {
                setHistoryIdx(nextIdx)
                setInputVal(history[nextIdx] || '')
            }
        }
    }

    const focusInput = () => {
        inputRef.current?.focus()
    }

    return (
        <AnimatePresence mode="wait">
            {isLoading ? (
                <motion.div
                    key="skeleton-terminal"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                    transition={{ duration: 0.5 }}
                >
                    <TerminalSectionSkeleton />
                </motion.div>
            ) : (
                <motion.section
                    key="terminal-content-root"
                    id="terminal-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <motion.div
                        className={`terminal-window ${isMinimized ? 'minimized' : ''}`}
                        onClick={focusInput}
                    >
                        {/* Terminal header */}
                        <div className="terminal-header">
                            <div className="terminal-title">
                                <Terminal className="w-4 h-4 text-primary" />
                                <span className="title-text">Terminal</span>
                                <span className="title-info">- zsh - 80×24</span>
                            </div>
                            <div className="terminal-controls">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setIsMinimized(!isMinimized)
                                    }}
                                    className="control-btn"
                                    aria-label={isMinimized ? "Maximize terminal" : "Minimize terminal"}
                                >
                                    {isMinimized ? (
                                        <Maximize2 className="w-3 h-3 text-text-dim hover:text-white" />
                                    ) : (
                                        <Minimize2 className="w-3 h-3 text-text-dim hover:text-white" />
                                    )}
                                </button>
                                <button
                                    className="control-btn close"
                                    aria-label="Clear terminal"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setLogs([])
                                    }}
                                >
                                    <X className="w-3 h-3 text-text-dim hover:text-red-400" />
                                </button>
                            </div>
                        </div>

                        {/* Terminal content */}
                        {!isMinimized && (
                            <div className="terminal-content" ref={contentRef}>
                                <div className="terminal-logs">
                                    {logs.map((log, index) => (
                                        <div
                                            key={index}
                                            className={`terminal-line ${log.type}`}
                                        >
                                            {log.text || '\u00A0'}
                                        </div>
                                    ))}
                                </div>

                                {/* Interactive CLI Input Form */}
                                <form
                                    className="terminal-input-form"
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        executeCommand(inputVal)
                                    }}
                                >
                                    <span className="terminal-prompt">
                                        <span className="prompt-full">user@satya-portfolio:~$</span>
                                        <span className="prompt-short">satya:~$</span>
                                    </span>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        className="terminal-input"
                                        value={inputVal}
                                        onChange={(e) => setInputVal(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="type 'help', 'whoami', 'skills', 'theme dracula'..."
                                        autoComplete="off"
                                        spellCheck={false}
                                    />
                                    <button type="submit" style={{ display: 'none' }} aria-hidden="true" />
                                </form>

                                <div className="terminal-hint">
                                    💡 Type &apos;help&apos; for CLI commands • Press &apos;Ctrl+P&apos; for VS Code Command Palette
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Terminal stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="terminal-stats"
                    >
                        <div className="stat-indicator">
                            <div className="status-dot online"></div>
                            <span>System Online</span>
                        </div>
                        <div className="stat-indicator">
                            <div className="status-dot success"></div>
                            <span>Build: Passing</span>
                        </div>
                        <div className="stat-indicator">
                            <div className="status-dot warning"></div>
                            <span>Fail-Safe: Active</span>
                        </div>
                    </motion.div>
                </motion.section>
            )}
        </AnimatePresence>
    )
}
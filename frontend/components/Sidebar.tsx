'use client'

import {
    FolderOpen,
    Search,
    GitBranch,
    Bug,
    Package,
    User,
    Settings,
    ChevronRight,
    MoreHorizontal,
    Folder,
    FileText,
    File,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { SidebarSkeleton } from './AppSkeletons'
import { useSectionVisibility } from '@/hooks/useSectionVisibility'

import { SECTION_FILES, SectionFile } from '@/lib/sections'
export { SECTION_FILES }
export type { SectionFile }

const FILE_ICON_COLORS: Record<string, string> = {
    tsx: '#61dafb',
    ts: '#3178c6',
    json: '#22c55e',
    md: '#a78bfa',
    sh: '#f59e0b',
    log: '#f97316',
}

function FileIcon({ ext, size = 14 }: { ext: string; size?: number }) {
    const color = FILE_ICON_COLORS[ext] || '#9ca3af'
    return <File size={size} style={{ color, flexShrink: 0 }} />
}

function scrollToSection(sectionId: string) {
    const el = document.getElementById(sectionId)
    if (!el) return

    // Scroll within .main-content container (body is overflow:hidden)
    const container = document.querySelector('.main-content') as HTMLElement
    if (container) {
        const containerTop = container.getBoundingClientRect().top
        const elTop = el.getBoundingClientRect().top
        const offset = elTop - containerTop + container.scrollTop - 16
        container.scrollTo({ top: offset, behavior: 'smooth' })
    } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    // Close mobile sidebar after navigation
    const appBody = document.querySelector('.app-body')
    if (appBody) {
        appBody.classList.remove('mobile-sidebar-open')
    }
}

interface SidebarProps {
    activeSection?: string
}

const Sidebar = ({ activeSection }: SidebarProps) => {
    const [isLoading, setIsLoading] = useState(true)
    const { isSectionVisible } = useSectionVisibility()
    const visibleFiles = (SECTION_FILES || []).filter((file) => isSectionVisible(file.id))

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200)
        return () => clearTimeout(timer)
    }, [])

    const SidebarContent = () => (
        <div className="sidebar-content">
            {/* Icon sidebar */}
            <div className="sidebar-icons">
                <div className="icon-wrapper active" title="Explorer">
                    <FolderOpen size={24} />
                </div>
                <div className="icon-wrapper" title="Search">
                    <Search size={24} />
                </div>
                <div className="icon-wrapper" title="Source Control">
                    <GitBranch size={24} />
                </div>
                <div className="icon-wrapper" title="Debug">
                    <Bug size={24} />
                </div>
                <div className="icon-wrapper" title="Extensions">
                    <Package size={24} />
                </div>
                <div className="icons-bottom">
                    <div className="icon-wrapper" title="Account">
                        <User size={24} />
                    </div>
                    <div className="icon-wrapper Settings-icon" title="Settings">
                        <Settings size={24} />
                    </div>
                </div>
            </div>

            {/* File explorer */}
            <div className="sidebar-explorer">
                <div className="explorer-header">
                    <span>Explorer</span>
                    <MoreHorizontal />
                </div>

                <div className="file-tree">
                    {/* Root folder */}
                    <div className="folder-root">
                        <ChevronRight style={{ transform: 'rotate(90deg)' }} />
                        <span className="folder-name">Satya’s Portfolio</span>
                    </div>

                    <div className="folder-contents">
                        <div className="file-item">
                            <ChevronRight />
                            <Folder />
                            <span>.github</span>
                        </div>

                        <div className="file-item">
                            <ChevronRight style={{ transform: 'rotate(90deg)' }} />
                            <FolderOpen size={14} style={{ color: '#22c55e', flexShrink: 0 }} />
                            <span>src</span>
                        </div>

                        {/* sections folder inside src */}
                        <div className="nested-folder">
                            <div className="file-item">
                                <ChevronRight />
                                <Folder style={{ color: '#eab308' }} />
                                <span>assets</span>
                            </div>

                            <div className="file-item">
                                <ChevronRight style={{ transform: 'rotate(90deg)' }} />
                                <FolderOpen size={14} style={{ color: '#3b82f6', flexShrink: 0 }} />
                                <span>Components</span>
                            </div>

                            {/* Each section as a file */}
                            <div className="nested-folder" role="tree" aria-label="Portfolio sections">
                                {visibleFiles.map((file, idx) => (
                                    <div
                                        key={file.id}
                                        role="treeitem"
                                        tabIndex={0}
                                        aria-selected={activeSection === file.id}
                                        aria-label={`Navigate to ${file.filename}`}
                                        className={`file-item${activeSection === file.id ? ' active' : ''}`}
                                        onClick={() => scrollToSection(file.sectionId)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault()
                                                scrollToSection(file.sectionId)
                                            }
                                            if (e.key === 'ArrowDown') {
                                                e.preventDefault()
                                                const next = e.currentTarget.parentElement
                                                    ?.querySelectorAll('[role="treeitem"]')[idx + 1] as HTMLElement
                                                next?.focus()
                                            }
                                            if (e.key === 'ArrowUp') {
                                                e.preventDefault()
                                                const prev = e.currentTarget.parentElement
                                                    ?.querySelectorAll('[role="treeitem"]')[idx - 1] as HTMLElement
                                                prev?.focus()
                                            }
                                        }}
                                        title={`Go to ${file.filename}`}
                                    >
                                        <FileIcon ext={file.icon} />
                                        <span>{file.filename}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Root level files */}
                        <div className="file-item">
                            <File size={14} style={{ color: '#eab308', flexShrink: 0 }} />
                            <span>package.json</span>
                        </div>
                        <div className="file-item">
                            <FileText size={14} style={{ color: '#6b7280', flexShrink: 0 }} />
                            <span>README.md</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    if (isLoading) {
        return <SidebarSkeleton />
    }

    return (
        <div className="sidebar-content-wrapper">
            <SidebarContent />
        </div>
    )
}

export default Sidebar

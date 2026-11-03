export interface SectionFile {
    id: string
    filename: string
    icon: string
    color: string
    sectionId: string
}

export const SECTION_FILES: SectionFile[] = [
    { id: 'hero', filename: 'index.tsx', icon: 'tsx', color: '#61dafb', sectionId: 'hero-section' },
    { id: 'skills', filename: 'skills.ts', icon: 'ts', color: '#3178c6', sectionId: 'skills-section' },
    { id: 'experience', filename: 'git-history.log', icon: 'log', color: '#f97316', sectionId: 'git-history-section' },
    { id: 'education', filename: 'education.md', icon: 'md', color: '#a78bfa', sectionId: 'edu-root' },
    { id: 'certifications', filename: 'certifications.json', icon: 'json', color: '#22c55e', sectionId: 'certifications-section' },
    { id: 'projects', filename: 'projects.sh', icon: 'sh', color: '#f59e0b', sectionId: 'projects-section' },
    { id: 'testimonials', filename: 'testimonials.md', icon: 'md', color: '#a78bfa', sectionId: 'testimonials-root' },
    { id: 'blog', filename: 'blog.md', icon: 'md', color: '#a78bfa', sectionId: 'blog-section' },
    { id: 'terminal', filename: 'terminal.sh', icon: 'sh', color: '#f59e0b', sectionId: 'terminal-section' },
    { id: 'contact', filename: 'contact.json', icon: 'json', color: '#22c55e', sectionId: 'contact-section' },
]


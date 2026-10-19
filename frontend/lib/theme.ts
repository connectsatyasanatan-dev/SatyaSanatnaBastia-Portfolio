export type VSCodeTheme = 'cyberpunk' | 'dracula' | 'onedark' | 'tokyonight'

export interface ThemeOption {
    id: VSCodeTheme
    name: string
    color: string
    accent: string
}

export const THEME_OPTIONS: ThemeOption[] = [
    { id: 'cyberpunk', name: 'Cyberpunk Teal (Default)', color: '#06f9f9', accent: '#ff00ff' },
    { id: 'dracula', name: 'Dracula', color: '#bd93f9', accent: '#ff79c6' },
    { id: 'onedark', name: 'One Dark Pro', color: '#61afef', accent: '#e06c75' },
    { id: 'tokyonight', name: 'Tokyo Night', color: '#7aa2f7', accent: '#7dcfff' },
]

export const getStoredTheme = (): VSCodeTheme => {
    if (typeof window === 'undefined') return 'cyberpunk'
    const stored = localStorage.getItem('vscode_portfolio_theme') as VSCodeTheme
    if (stored && THEME_OPTIONS.some(t => t.id === stored)) {
        return stored
    }
    return 'cyberpunk'
}

export const applyTheme = (theme: VSCodeTheme) => {
    if (typeof window === 'undefined') return
    if (theme === 'cyberpunk') {
        document.documentElement.removeAttribute('data-theme')
    } else {
        document.documentElement.setAttribute('data-theme', theme)
    }
    localStorage.setItem('vscode_portfolio_theme', theme)
    window.dispatchEvent(new CustomEvent('vscode_theme_change', { detail: theme }))
}

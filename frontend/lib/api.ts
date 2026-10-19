// Public API client for portfolio data
import apiClient from './apiClient'

export interface PersonalInfo {
    name: string
    role: string
    title: string
    location: string
    status: string
    experience: string
    email: string
    phone: string
    github: string
    linkedin: string
    twitter: string
    portfolio: string
    resume: string
    bio: string
    availability: string
    timezone: string
    languages: string[]
}

export interface Skill {
    name: string
    level: number
    years: number
}

export interface SkillCategory {
    title: string
    skills: Skill[]
}

export interface Project {
    id: number
    name: string
    filename: string
    version: string
    downloads: string
    description: string
    technologies: string[]
    features: string[]
    stars: number
    forks: number
    demoUrl: string
    githubUrl: string
    status: string
    featured: boolean
    terminalOutput?: string[]
}

export interface Experience {
    id: number
    title: string
    company: string
    location: string
    period: string
    duration: string
    type: string
    description: string
    achievements: string[]
    technologies: string[]
    commit?: string
    color?: string
    badge?: string
}

export interface Education {
    id?: number
    degree: string
    school: string
    location: string
    period: string
    gpa?: string
    relevant_courses: string[]
    achievements: string[]
    focus?: string
    projects?: number
    certification?: string
    duration?: string
}

export interface Certification {
    id?: number
    name: string
    issuer: string
    date: string
    credential?: string
    validity?: string
    badge?: string
    verify_url?: string
}

export interface Achievements {
    stats: {
        yearsOfExperience: number
        projectsCompleted: number
        clientsSatisfied: number
        codeCommits: number;
        linesOfCode: number
        bugsFixed: number
        coffeeConsumed: number
        hackathonsWon: number
    }
    highlights: string[]
}

export interface Testimonial {
    id: number
    name: string
    role: string
    company: string
    text: string
    rating: number
    date: string
}

export interface BlogPost {
    id: number
    title: string
    excerpt: string
    date: string
    readTime: string
    tags: string[]
    featured: boolean
}

export interface PortfolioStats {
    projects_count: number
    featured_projects: number
    total_stars: number
    total_forks: number
    experience_years: number
    skills_count: number
    testimonials_count: number
    blog_posts_count: number
    clients_satisfied: number
    code_commits: number
    lines_of_code: number
    coffee_consumed: number
    unique_visitors: number
}


import {
    FALLBACK_PERSONAL_INFO,
    FALLBACK_STATS,
    FALLBACK_ACHIEVEMENTS,
    FALLBACK_SKILLS,
    FALLBACK_PROJECTS,
    FALLBACK_EXPERIENCE,
    FALLBACK_EDUCATION,
    FALLBACK_CERTIFICATIONS,
    FALLBACK_TESTIMONIALS,
    FALLBACK_BLOG_POSTS
} from './fallbackData'

class PortfolioAPI {
    private async request<T>(endpoint: string): Promise<T> {
        try {
            const response = await apiClient.get<T>(endpoint)
            return response.data
        } catch (error) {
            console.warn(`API request failed or unavailable: ${endpoint}. Utilizing resilient fallback.`)
            throw error
        }
    }

    async getPersonalInfo(): Promise<PersonalInfo> {
        try {
            const data = await this.request<PersonalInfo>('/personal-info')
            if (!data) return FALLBACK_PERSONAL_INFO
            return {
                ...FALLBACK_PERSONAL_INFO,
                ...data,
                name: (data.name && data.name !== 'Developer') ? data.name : FALLBACK_PERSONAL_INFO.name,
                role: data.role || FALLBACK_PERSONAL_INFO.role,
                title: data.title || FALLBACK_PERSONAL_INFO.title,
                location: data.location || FALLBACK_PERSONAL_INFO.location,
                status: data.status || FALLBACK_PERSONAL_INFO.status,
                experience: data.experience || FALLBACK_PERSONAL_INFO.experience,
                email: data.email || FALLBACK_PERSONAL_INFO.email,
                github: data.github || FALLBACK_PERSONAL_INFO.github,
                linkedin: data.linkedin || FALLBACK_PERSONAL_INFO.linkedin,
                bio: data.bio || FALLBACK_PERSONAL_INFO.bio,
                availability: data.availability || FALLBACK_PERSONAL_INFO.availability,
                timezone: data.timezone || FALLBACK_PERSONAL_INFO.timezone,
            }
        } catch {
            return FALLBACK_PERSONAL_INFO
        }
    }

    async getSkills(): Promise<Record<string, SkillCategory>> {
        try {
            const data = await this.request<Record<string, SkillCategory>>('/skills')
            if (!data || Object.keys(data).length === 0) return FALLBACK_SKILLS
            // Check if skills arrays are actually populated
            const totalSkills = Object.values(data).reduce((acc, cat) => acc + (cat.skills?.length || 0), 0)
            return totalSkills > 0 ? data : FALLBACK_SKILLS
        } catch {
            return FALLBACK_SKILLS
        }
    }

    async getProjects(featured?: boolean): Promise<Project[]> {
        try {
            const endpoint = featured ? '/projects?featured=true' : '/projects'
            const data = await this.request<Project[]>(endpoint)
            if (!data || data.length === 0) {
                return featured ? FALLBACK_PROJECTS.filter(p => p.featured) : FALLBACK_PROJECTS
            }
            return data
        } catch {
            return featured ? FALLBACK_PROJECTS.filter(p => p.featured) : FALLBACK_PROJECTS
        }
    }

    async getExperience(): Promise<Experience[]> {
        try {
            const data = await this.request<Experience[]>('/experience')
            return (data && data.length > 0) ? data : FALLBACK_EXPERIENCE
        } catch {
            return FALLBACK_EXPERIENCE
        }
    }

    async getEducation(): Promise<Education[]> {
        try {
            const data = await this.request<Education[]>('/education')
            return (data && data.length > 0) ? data : FALLBACK_EDUCATION
        } catch {
            return FALLBACK_EDUCATION
        }
    }

    async getCertifications(): Promise<Certification[]> {
        try {
            const data = await this.request<Certification[]>('/certifications')
            return (data && data.length > 0) ? data : FALLBACK_CERTIFICATIONS
        } catch {
            return FALLBACK_CERTIFICATIONS
        }
    }

    async getAchievements(): Promise<Achievements> {
        try {
            const data = await this.request<Achievements>('/achievements')
            if (!data || !data.stats || (data.stats.yearsOfExperience === 0 && data.stats.projectsCompleted === 0)) {
                return FALLBACK_ACHIEVEMENTS
            }
            return data
        } catch {
            return FALLBACK_ACHIEVEMENTS
        }
    }

    async getTestimonials(): Promise<Testimonial[]> {
        try {
            const data = await this.request<Testimonial[]>('/testimonials')
            return (data && data.length > 0) ? data : FALLBACK_TESTIMONIALS
        } catch {
            return FALLBACK_TESTIMONIALS
        }
    }

    async getBlogPosts(featured?: boolean): Promise<BlogPost[]> {
        try {
            const endpoint = featured ? '/blog?featured=true' : '/blog'
            const data = await this.request<BlogPost[]>(endpoint)
            if (!data || data.length === 0) {
                return featured ? FALLBACK_BLOG_POSTS.filter(p => p.featured) : FALLBACK_BLOG_POSTS
            }
            return data
        } catch {
            return featured ? FALLBACK_BLOG_POSTS.filter(p => p.featured) : FALLBACK_BLOG_POSTS
        }
    }

    async getStats(): Promise<PortfolioStats> {
        try {
            const data = await this.request<PortfolioStats>('/stats')
            if (!data || (data.experience_years === 0 && data.projects_count === 0)) {
                return FALLBACK_STATS
            }
            return data
        } catch {
            return FALLBACK_STATS
        }
    }

    async submitContactForm(data: { name: string; email: string; subject?: string; message: string }) {
        try {
            const response = await apiClient.post('/contact', data)
            return response.data
        } catch (error) {
            console.error('Contact form error:', error)
            throw error
        }
    }

    async trackVisit(data: {
        visitorId: string;
        sessionId: string;
        deviceType: string;
        browser: string;
        referrer: string;
        pagePath: string;
    }) {
        try {
            const response = await apiClient.post('/track-visit', data)
            return response.data
        } catch (error) {
            console.error('Track visit error:', error)
        }
    }

    async trackDuration(data: { sessionId: string; duration: number }) {
        try {
            const response = await apiClient.post('/track-duration', data)
            return response.data
        } catch (error) {
            // Silently fail for duration tracking as it happens in background
        }
    }
}

export const portfolioAPI = new PortfolioAPI()
export default portfolioAPI

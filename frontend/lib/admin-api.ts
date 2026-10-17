// Admin API client for backend management
import type {
    ApiResponse,
    LoginResponse,
    TokenResponse,
    DashboardData,
    PersonalInfo,
    SkillCategory,
    Project,
    Experience,
    Education,
    Certification,
    Achievements,
    Testimonial,
    BlogPost,
    ContactMessage,
    AiLead,
    AnalyticsSummary
} from './admin-types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

class AdminApiClient {
    private baseUrl: string
    private token: string | null = null
    private refreshToken: string | null = null
    private refreshPromise: Promise<string> | null = null

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('admin_token')
            this.refreshToken = localStorage.getItem('admin_refresh_token')
        }
    }

    setTokens(accessToken: string, refreshToken?: string) {
        this.token = accessToken
        if (typeof window !== 'undefined') {
            localStorage.setItem('admin_token', accessToken)
            if (refreshToken) {
                this.refreshToken = refreshToken
                localStorage.setItem('admin_refresh_token', refreshToken)
            }
        }
    }

    setToken(token: string) {
        this.setTokens(token)
    }

    getToken(): string | null {
        return this.token || (typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null)
    }

    getRefreshToken(): string | null {
        return this.refreshToken || (typeof window !== 'undefined' ? localStorage.getItem('admin_refresh_token') : null)
    }

    clearTokens() {
        this.token = null
        this.refreshToken = null
        if (typeof window !== 'undefined') {
            localStorage.removeItem('admin_token')
            localStorage.removeItem('admin_refresh_token')
        }
    }

    clearToken() {
        this.clearTokens()
    }

    /**
     * Refresh access token seamlessly using the 1-day refresh token.
     * Prevents race conditions by caching in-flight refresh promise.
     */
    async refreshAccessToken(): Promise<string> {
        if (this.refreshPromise) {
            return this.refreshPromise
        }

        const currentRefreshToken = this.getRefreshToken()
        if (!currentRefreshToken) {
            this.clearTokens()
            throw new Error('No refresh token available')
        }

        this.refreshPromise = (async () => {
            try {
                const response = await fetch(`${this.baseUrl}/admin/refresh`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken: currentRefreshToken }),
                })

                if (!response.ok) {
                    const err = await response.json().catch(() => ({ error: 'Refresh failed' }))
                    throw new Error(err.error || 'Failed to refresh access token')
                }

                const data = await response.json()
                const newAccessToken = data.accessToken || data.token
                const newRefreshToken = data.refreshToken || currentRefreshToken

                if (!newAccessToken) {
                    throw new Error('Invalid token response from refresh endpoint')
                }

                this.setTokens(newAccessToken, newRefreshToken)
                return newAccessToken
            } catch (err) {
                this.clearTokens()
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('admin-auth-expired'))
                }
                throw err
            } finally {
                this.refreshPromise = null
            }
        })()

        return this.refreshPromise
    }

    private async request<T = any>(endpoint: string, options?: RequestInit, isRetry: boolean = false): Promise<T> {
        const url = `${this.baseUrl}/admin${endpoint}`
        const currentToken = this.getToken()

        const config: RequestInit = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(currentToken && { 'Authorization': `Bearer ${currentToken}` }),
                ...options?.headers,
            },
            ...options,
        }

        try {
            const response = await fetch(url, config)

            // Transparently refresh token on 401 Unauthorized (15 min access expiry)
            if (
                response.status === 401 &&
                !isRetry &&
                !endpoint.includes('/login') &&
                !endpoint.includes('/refresh') &&
                this.getRefreshToken()
            ) {
                try {
                    const newToken = await this.refreshAccessToken()
                    const retriedHeaders = {
                        ...(options?.headers || {}),
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${newToken}`,
                    }
                    return await this.request<T>(endpoint, { ...options, headers: retriedHeaders }, true)
                } catch (refreshError) {
                    throw new Error('Session expired. Please log in again.')
                }
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Request failed' }))
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error(`Admin API request failed: ${url}`, error)
            throw error
        }
    }

    // Authentication
    async login(username: string, password: string): Promise<LoginResponse> {
        const response = await this.request<LoginResponse>('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        })

        if (response.success && (response.accessToken || response.token)) {
            const accessTok = response.accessToken || response.token
            this.setTokens(accessTok, response.refreshToken)
        }

        return response
    }

    async verifyToken(): Promise<TokenResponse> {
        return this.request<TokenResponse>('/verify')
    }

    async logout() {
        try {
            const token = this.getToken()
            const refreshToken = this.getRefreshToken()
            if (token || refreshToken) {
                await fetch(`${this.baseUrl}/admin/logout`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` }),
                    },
                    body: JSON.stringify({ refreshToken }),
                }).catch(() => {})
            }
        } finally {
            this.clearTokens()
        }
    }

    // Dashboard
    async getDashboard(): Promise<DashboardData> {
        return this.request<DashboardData>('/dashboard')
    }

    // Personal Info
    async getPersonalInfo(): Promise<PersonalInfo> {
        return this.request<PersonalInfo>('/personal-info')
    }

    async updatePersonalInfo(data: Partial<PersonalInfo>): Promise<ApiResponse<PersonalInfo>> {
        return this.request<ApiResponse<PersonalInfo>>('/personal-info', {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    // Skills
    async getSkills(): Promise<Record<string, SkillCategory>> {
        return this.request<Record<string, SkillCategory>>('/skills')
    }

    async updateSkillsCategory(category: string, data: SkillCategory): Promise<ApiResponse<SkillCategory>> {
        return this.request<ApiResponse<SkillCategory>>(`/skills/${category}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    async addSkill(category: string, skill: { name: string; level: number; years: number }): Promise<ApiResponse> {
        return this.request<ApiResponse>(`/skills/${category}/skill`, {
            method: 'POST',
            body: JSON.stringify(skill),
        })
    }

    // Projects
    async getProjects(): Promise<Project[]> {
        return this.request<Project[]>('/projects')
    }

    async addProject(project: Omit<Project, 'id'>): Promise<ApiResponse<Project>> {
        return this.request<ApiResponse<Project>>('/projects', {
            method: 'POST',
            body: JSON.stringify(project),
        })
    }

    async updateProject(id: number, project: Partial<Project>): Promise<ApiResponse<Project>> {
        return this.request<ApiResponse<Project>>(`/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(project),
        })
    }

    async deleteProject(id: number): Promise<ApiResponse> {
        return this.request<ApiResponse>(`/projects/${id}`, {
            method: 'DELETE',
        })
    }

    // Experience
    async getExperience(): Promise<Experience[]> {
        return this.request<Experience[]>('/experience')
    }

    async addExperience(experience: Omit<Experience, 'id'>): Promise<ApiResponse<Experience>> {
        return this.request<ApiResponse<Experience>>('/experience', {
            method: 'POST',
            body: JSON.stringify(experience),
        })
    }

    async updateExperience(id: number, experience: Partial<Experience>): Promise<ApiResponse<Experience>> {
        return this.request<ApiResponse<Experience>>(`/experience/${id}`, {
            method: 'PUT',
            body: JSON.stringify(experience),
        })
    }

    async deleteExperience(id: number): Promise<ApiResponse> {
        return this.request<ApiResponse>(`/experience/${id}`, {
            method: 'DELETE',
        })
    }

    // Education
    async getEducation(): Promise<Education[]> {
        return this.request<Education[]>('/education')
    }

    async addEducation(data: Omit<Education, 'id'>): Promise<ApiResponse<Education>> {
        return this.request<ApiResponse<Education>>('/education', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async updateEducation(id: number, data: Partial<Education>): Promise<ApiResponse<Education>> {
        return this.request<ApiResponse<Education>>(`/education/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    async deleteEducation(id: number): Promise<ApiResponse> {
        return this.request<ApiResponse>(`/education/${id}`, {
            method: 'DELETE',
        })
    }

    // Certifications
    async getCertifications(): Promise<Certification[]> {
        return this.request<Certification[]>('/certifications')
    }

    async addCertification(data: Omit<Certification, 'id'>): Promise<ApiResponse<Certification>> {
        return this.request<ApiResponse<Certification>>('/certifications', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async updateCertification(id: number, data: Partial<Certification>): Promise<ApiResponse<Certification>> {
        return this.request<ApiResponse<Certification>>(`/certifications/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    async deleteCertification(id: number): Promise<ApiResponse> {
        return this.request<ApiResponse>(`/certifications/${id}`, {
            method: 'DELETE',
        })
    }

    // Achievements
    async getAchievements(): Promise<Achievements> {
        return this.request<Achievements>('/achievements')
    }

    async updateAchievements(category: string, data: any): Promise<ApiResponse<Achievements>> {
        return this.request<ApiResponse<Achievements>>(`/achievements/${category}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    // Testimonials
    async getTestimonials(): Promise<Testimonial[]> {
        return this.request<Testimonial[]>('/testimonials')
    }

    async addTestimonial(testimonial: Omit<Testimonial, 'id'>): Promise<ApiResponse<Testimonial>> {
        return this.request<ApiResponse<Testimonial>>('/testimonials', {
            method: 'POST',
            body: JSON.stringify(testimonial),
        })
    }

    async updateTestimonial(id: number, testimonial: Partial<Testimonial>): Promise<ApiResponse<Testimonial>> {
        return this.request<ApiResponse<Testimonial>>(`/testimonials/${id}`, {
            method: 'PUT',
            body: JSON.stringify(testimonial),
        })
    }

    async deleteTestimonial(id: number): Promise<ApiResponse> {
        return this.request<ApiResponse>(`/testimonials/${id}`, {
            method: 'DELETE',
        })
    }

    // Blog Posts
    async getBlogPosts(): Promise<BlogPost[]> {
        return this.request<BlogPost[]>('/blog')
    }

    async addBlogPost(post: Omit<BlogPost, 'id'>): Promise<ApiResponse<BlogPost>> {
        return this.request<ApiResponse<BlogPost>>('/blog', {
            method: 'POST',
            body: JSON.stringify(post),
        })
    }

    async updateBlogPost(id: number, post: Partial<BlogPost>): Promise<ApiResponse<BlogPost>> {
        return this.request<ApiResponse<BlogPost>>(`/blog/${id}`, {
            method: 'PUT',
            body: JSON.stringify(post),
        })
    }

    async deleteBlogPost(id: number): Promise<ApiResponse> {
        return this.request<ApiResponse>(`/blog/${id}`, {
            method: 'DELETE',
        })
    }

    // Contact Messages (from portfolio Send Message form)
    async getContactMessages(): Promise<ContactMessage[]> {
        return this.request<ContactMessage[]>('/contacts')
    }

    async deleteContactMessage(id: number): Promise<ApiResponse> {
        return this.request<ApiResponse>(`/contacts/${id}`, {
            method: 'DELETE',
        })
    }

    // AI Chat Verified Leads (Visitors who provided personal details)
    async getAiLeads(): Promise<AiLead[]> {
        return this.request<AiLead[]>('/ai-leads')
    }

    async deleteAiLead(id: number): Promise<ApiResponse> {
        return this.request<ApiResponse>(`/ai-leads/${id}`, {
            method: 'DELETE',
        })
    }

    // Analytics
    async getAnalytics(): Promise<AnalyticsSummary> {
        return this.request<AnalyticsSummary>('/analytics')
    }

    // Generic File Upload
    async uploadFile(file: File, isRetry: boolean = false): Promise<{ success: boolean; url: string; filename: string }> {
        const formData = new FormData()
        formData.append('file', file)

        const url = `${this.baseUrl}/admin/upload`
        const currentToken = this.getToken()
        const config: RequestInit = {
            method: 'POST',
            credentials: 'include',
            headers: {
                ...(currentToken && { 'Authorization': `Bearer ${currentToken}` }),
            },
            body: formData,
        }

        try {
            const response = await fetch(url, config)

            if (response.status === 401 && !isRetry && this.getRefreshToken()) {
                try {
                    await this.refreshAccessToken()
                    return await this.uploadFile(file, true)
                } catch (refreshErr) {
                    throw new Error('Session expired. Please log in again.')
                }
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error(`File upload failed: ${url}`, error)
            throw error
        }
    }
}

export const adminApiClient = new AdminApiClient()
export default adminApiClient
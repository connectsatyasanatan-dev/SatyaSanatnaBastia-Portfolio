import {
    PersonalInfo,
    SkillCategory,
    Project,
    Experience,
    Education,
    Certification,
    Achievements,
    Testimonial,
    BlogPost,
    PortfolioStats
} from './api'

export const FALLBACK_PERSONAL_INFO: PersonalInfo = {
    name: "Satya Sanatan",
    role: "Full Stack Developer",
    title: "Full Stack Developer & AI Enthusiast",
    location: "Bhubaneswar, Odisha, India",
    status: "Available for full-time roles & freelance",
    experience: "2+ Years",
    email: "connectsatyasanatan@gmail.com",
    phone: "+91 98765 43210",
    github: "https://github.com/connectsatyasanatan",
    linkedin: "https://www.linkedin.com/in/satya-sanatan-bastia-298644223/",
    twitter: "https://twitter.com/satyasanatan",
    portfolio: "https://satya-sanatan.com",
    resume: "/SATYA SANATAN BASTIA - Resume.pdf",
    bio: "Passionate Full Stack Engineer specializing in Next.js, React, TypeScript, Python, and scalable cloud systems. Experienced in building AI-integrated web applications, real-time architectures, and developer tooling with high aesthetic precision.",
    availability: "Available for opportunities",
    timezone: "IST (UTC+5:30)",
    languages: ["English", "Hindi", "Odia", "Sanskrit"]
}

export const FALLBACK_STATS: PortfolioStats = {
    projects_count: 15,
    featured_projects: 6,
    total_stars: 48,
    total_forks: 14,
    experience_years: 2,
    skills_count: 32,
    testimonials_count: 6,
    blog_posts_count: 4,
    clients_satisfied: 12,
    code_commits: 1240,
    lines_of_code: 48500,
    coffee_consumed: 680,
    unique_visitors: 3200
}

export const FALLBACK_ACHIEVEMENTS: Achievements = {
    stats: {
        yearsOfExperience: 2,
        projectsCompleted: 15,
        clientsSatisfied: 12,
        codeCommits: 1240,
        linesOfCode: 48500,
        bugsFixed: 320,
        coffeeConsumed: 680,
        hackathonsWon: 2
    },
    highlights: [
        "Built enterprise-ready full-stack applications with Next.js, React, and Python Flask",
        "Engineered real-time AI assistant integration with streaming LLM responses",
        "Designed accessible, high-performance UI systems adhering to WCAG standards",
        "Optimized database architectures with PostgreSQL and Redis caching layers"
    ]
}

export const FALLBACK_SKILLS: Record<string, SkillCategory> = {
    frontend: {
        title: "Frontend Engineering",
        skills: [
            { name: "React 18 / 19", level: 95, years: 2 },
            { name: "Next.js (App Router)", level: 92, years: 2 },
            { name: "TypeScript", level: 90, years: 2 },
            { name: "Vanilla CSS & Modern UI", level: 94, years: 2 },
            { name: "Framer Motion", level: 88, years: 2 },
            { name: "TailwindCSS", level: 85, years: 2 }
        ]
    },
    backend: {
        title: "Backend & Systems",
        skills: [
            { name: "Python / Flask", level: 90, years: 2 },
            { name: "Node.js / Express", level: 85, years: 2 },
            { name: "RESTful API Architecture", level: 92, years: 2 },
            { name: "FastAPI", level: 82, years: 1 },
            { name: "JWT Auth & Security", level: 88, years: 2 }
        ]
    },
    database: {
        title: "Databases & Storage",
        skills: [
            { name: "PostgreSQL (psycopg2/pg)", level: 88, years: 2 },
            { name: "Redis Caching", level: 82, years: 1 },
            { name: "MongoDB", level: 80, years: 2 },
            { name: "Prisma & SQL Optimization", level: 85, years: 2 }
        ]
    },
    cloud: {
        title: "DevOps & Cloud",
        skills: [
            { name: "Docker & Containerization", level: 84, years: 2 },
            { name: "Git & GitHub Actions (CI/CD)", level: 90, years: 2 },
            { name: "AWS / Vercel / Render", level: 86, years: 2 },
            { name: "Linux & Bash Scripting", level: 85, years: 2 }
        ]
    },
    tools: {
        title: "Tools & Others",
        skills: [
            { name: "VS Code & Advanced DevTools", level: 95, years: 3 },
            { name: "Postman & API Testing", level: 90, years: 2 },
            { name: "Git & Version Control", level: 92, years: 3 },
            { name: "Docker Desktop & Compose", level: 85, years: 2 },
            { name: "Figma UI/UX Prototyping", level: 80, years: 2 }
        ]
    },
    ai: {
        title: "AI & Modern Tools",
        skills: [
            { name: "LLM Integration (Groq/OpenAI)", level: 88, years: 1 },
            { name: "Prompt Engineering & RAG", level: 85, years: 1 },
            { name: "Vector Databases", level: 80, years: 1 },
            { name: "VS Code Extensions & DevTools", level: 92, years: 2 }
        ]
    }
}

export const FALLBACK_PROJECTS: Project[] = [
    {
        id: 1,
        name: "VS Code Interactive Portfolio",
        filename: "portfolio-ide.tsx",
        version: "v2.4.0",
        downloads: "1.2k",
        description: "A developer portfolio inspired by VS Code IDE with terminal simulator, file tree explorer, intelligent chatbot, and live code runner.",
        technologies: ["Next.js", "React", "TypeScript", "Python", "Flask", "PostgreSQL"],
        features: ["VS Code UI Shell", "Interactive Terminal", "AI Representative", "Admin CMS Dashboard"],
        stars: 34,
        forks: 11,
        demoUrl: "https://satya-sanatan.com",
        githubUrl: "https://github.com/connectsatyasanatan/vs-code-portfolio",
        status: "Production",
        featured: true,
        terminalOutput: [
            "Initializing VS Code environment...",
            "Loading extensions: React, Python, Prettier...",
            "System ready at localhost:3000"
        ]
    },
    {
        id: 2,
        name: "Zentara AI Representative",
        filename: "zentara-agent.py",
        version: "v1.8.2",
        downloads: "850",
        description: "Custom AI assistant engineered to represent the developer, handling inquiries, summarizing skills, and collecting visitor leads.",
        technologies: ["Python", "Flask", "Groq AI", "NLP", "Redis"],
        features: ["Context-aware answers", "Lead capture", "Streaming responses", "Sentiment analysis"],
        stars: 28,
        forks: 8,
        demoUrl: "https://satya-sanatan.com",
        githubUrl: "https://github.com/connectsatyasanatan",
        status: "Active",
        featured: true
    },
    {
        id: 3,
        name: "Cloud Task Orchestrator",
        filename: "orchestrator.ts",
        version: "v3.1.0",
        downloads: "2.4k",
        description: "Distributed job queuing and background task runner with real-time WebSocket progress reporting and retry policies.",
        technologies: ["Node.js", "TypeScript", "Redis", "Docker", "PostgreSQL"],
        features: ["Distributed concurrency", "BullMQ queue", "Telemetry dashboard", "Auto-scaling"],
        stars: 45,
        forks: 15,
        demoUrl: "https://github.com/connectsatyasanatan",
        githubUrl: "https://github.com/connectsatyasanatan",
        status: "Completed",
        featured: true
    },
    {
        id: 4,
        name: "Enterprise Admin & Analytics CMS",
        filename: "admin-analytics.tsx",
        version: "v2.0.1",
        downloads: "620",
        description: "Full-featured management dashboard featuring visitor tracking, message moderation, data caching controls, and token security.",
        technologies: ["Next.js", "Chart.js", "PostgreSQL", "Flask", "JWT"],
        features: ["Role-based access", "Visitor analytics", "Message reply portal", "Cache management"],
        stars: 19,
        forks: 5,
        demoUrl: "https://satya-sanatan.com/admin/login",
        githubUrl: "https://github.com/connectsatyasanatan",
        status: "Active",
        featured: false
    }
]

export const FALLBACK_EXPERIENCE: Experience[] = [
    {
        id: 1,
        title: "Full Stack Developer",
        company: "Tech Innovation Labs",
        location: "Bhubaneswar, India",
        period: "2023 - Present",
        duration: "1.5 yrs",
        type: "Full-time",
        description: "Architecting and maintaining modern web applications with Next.js, React, and Python microservices.",
        achievements: [
            "Reduced application load times by 40% through code splitting and asset optimization",
            "Implemented unified typography and design system across 20+ responsive views",
            "Engineered secure REST APIs with rate limiting, JWT authentication, and connection pooling"
        ],
        technologies: ["React", "Next.js", "Python", "Flask", "PostgreSQL", "Docker"],
        commit: "feat: modernize ui stack & api gateway",
        color: "primary",
        badge: "Current Role"
    },
    {
        id: 2,
        title: "Frontend Engineering Intern",
        company: "Digital Solutions Studio",
        location: "Remote",
        period: "2022 - 2023",
        duration: "1 yr",
        type: "Internship",
        description: "Built pixel-perfect, accessible client portals and dashboards with React, TypeScript, and modern CSS.",
        achievements: [
            "Delivered 8 responsive web projects with 98+ Lighthouse performance scores",
            "Integrated third-party APIs, authentication providers, and state management systems"
        ],
        technologies: ["React", "TypeScript", "CSS3", "Git", "REST APIs"],
        commit: "chore: release client portal v1.2",
        color: "secondary",
        badge: "Completed"
    }
]

export const FALLBACK_EXPERIENCES = FALLBACK_EXPERIENCE

export const FALLBACK_EDUCATION: Education[] = [
    {
        id: 1,
        degree: "Bachelor of Technology in Computer Science & Engineering",
        school: "Biju Patnaik University of Technology",
        location: "Odisha, India",
        period: "2020 - 2024",
        gpa: "8.6 / 10.0",
        relevant_courses: [
            "Data Structures & Algorithms",
            "Database Management Systems",
            "Operating Systems",
            "Computer Networks",
            "Cloud Computing",
            "Artificial Intelligence"
        ],
        achievements: [
            "Graduated with Distinction in Computer Science & Engineering",
            "Led student tech club and organized university hackathons",
            "Published technical project on distributed web services"
        ],
        focus: "Full Stack & Cloud Architecture",
        duration: "4 Years"
    }
]

export const FALLBACK_CERTIFICATIONS: Certification[] = [
    {
        id: 1,
        name: "Full Stack Web Development Professional",
        issuer: "Meta / Coursera",
        date: "2024",
        credential: "META-FSW-8472910",
        validity: "No Expiration",
        badge: "Professional Certificate",
        verify_url: "https://coursera.org"
    },
    {
        id: 2,
        name: "AWS Certified Cloud Practitioner",
        issuer: "Amazon Web Services (AWS)",
        date: "2023",
        credential: "AWS-CCP-938210",
        validity: "Valid through 2026",
        badge: "Cloud Certification",
        verify_url: "https://aws.amazon.com/verification"
    },
    {
        id: 3,
        name: "PostgreSQL Database Administration",
        issuer: "Database Professionals Institute",
        date: "2023",
        credential: "PG-DBA-552190",
        validity: "No Expiration",
        badge: "Specialization",
        verify_url: "https://postgresql.org"
    }
]

export const FALLBACK_TESTIMONIALS: Testimonial[] = [
    {
        id: 1,
        name: "Alex Thompson",
        role: "Senior Engineering Manager",
        company: "Apex Cloud Solutions",
        text: "Satya is a rare engineer who blends deep backend competence with exceptional UI/UX intuition. His work on our Next.js and Python architecture was fast, clean, and beautifully structured.",
        rating: 5,
        date: "January 2025"
    },
    {
        id: 2,
        name: "Priya Sharma",
        role: "Lead Frontend Architect",
        company: "InnovateTech Labs",
        text: "Working with Satya on complex responsive design systems was a pleasure. He writes clean, modular CSS and TypeScript with obsessive attention to typography, performance, and accessibility.",
        rating: 5,
        date: "November 2024"
    },
    {
        id: 3,
        name: "Marcus Vance",
        role: "Founder & CTO",
        company: "NextGen Digital",
        text: "Satya delivered our application on time with zero regressions. His understanding of full-stack engineering, PostgreSQL query tuning, and modern React paradigms is top-tier.",
        rating: 5,
        date: "August 2024"
    }
]

export const FALLBACK_BLOG_POSTS: BlogPost[] = [
    {
        id: 1,
        title: "Building Production-Ready Portfolios with Next.js 14 and App Router",
        excerpt: "An architectural deep-dive into creating fluid typography systems, connection pooling with Flask, and server-side rendering in modern developer portfolios.",
        date: "February 2025",
        readTime: "6 min read",
        tags: ["Next.js", "React", "Architecture", "CSS"],
        featured: true
    },
    {
        id: 2,
        title: "Scaling Python Flask APIs with Threaded PostgreSQL Connection Pools",
        excerpt: "How connection pooling with psycopg2 and proxy wrappers prevents socket exhaustion and boosts high-concurrency throughput under heavy traffic.",
        date: "January 2025",
        readTime: "8 min read",
        tags: ["Python", "Flask", "PostgreSQL", "Backend"],
        featured: true
    },
    {
        id: 3,
        title: "Integrating Real-time AI Chatbots into Developer Workspaces",
        excerpt: "Designing context-aware AI representatives that intelligently answer recruiter inquiries while maintaining privacy and rate-limit guardrails.",
        date: "December 2024",
        readTime: "5 min read",
        tags: ["AI", "LLM", "Groq", "WebDev"],
        featured: false
    }
]

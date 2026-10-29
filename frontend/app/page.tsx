import '@/styles/responsive.css'
import '@/styles/chatbot.css'
import dynamic from 'next/dynamic'
import HeroSection from '@/components/HeroSection'
import SkillsSection from '@/components/SkillsSection'
import GitHistory from '@/components/GitHistory'
import EducationSection from '@/components/EducationSection'
import CertificationsSection from '@/components/CertificationsSection'
import ProjectsSection from '@/components/ProjectsSection'
import ContactSection from '@/components/ContactSection'
import AppContainer from '@/components/AppContainer'
import Footer from '@/components/Footer'
import SEOHead from '@/components/SEOHead'

// Dynamic imports for heavy non-initial-viewport components to minimize compilation time
const TestimonialsSection = dynamic(() => import('@/components/TestimonialsSection'))
const BlogSection = dynamic(() => import('@/components/BlogSection'))
const TerminalSection = dynamic(() => import('@/components/TerminalSection'), { ssr: false })
const ChatBot = dynamic(() => import('@/components/ChatBot'), { ssr: false })

export default async function Home() {
    return (
        <>
            {/* AEO/GEO: FAQPage + ItemList JSON-LD injected client-side after hydration */}
            <SEOHead />

            {/* SXO: semantic landmark with descriptive aria-label */}
            <main role="main" aria-label="Satya Sanatan Bastia — Full Stack Developer Portfolio">

                {/*
                  * AIO/GEO: Hidden but crawlable entity-description block.
                  * Not visible to users (sr-only pattern) but readable by search/AI crawlers.
                  * Do NOT use display:none — use the visually-hidden CSS technique so crawlers index it.
                  */}
                <div
                    className="sr-only"
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        width: '1px',
                        height: '1px',
                        padding: 0,
                        margin: '-1px',
                        overflow: 'hidden',
                        clip: 'rect(0,0,0,0)',
                        whiteSpace: 'nowrap',
                        borderWidth: 0,
                    }}
                >
                    Satya Sanatan Bastia is a Full Stack Developer based in Bhubaneswar, Odisha, India.
                    He specialises in React, Next.js, TypeScript, Python, Flask, PostgreSQL, Docker, and AI integration.
                    Available for hire as a Full Stack Developer, Frontend Developer, or Backend Developer.
                    Contact: connectsatyasanatan@gmail.com.
                    Portfolio: https://satyasanatnabastia.onrender.com.
                    GitHub: https://github.com/satyasanatan.
                    LinkedIn: https://linkedin.com/in/satyasanatan.
                    Open to full-time remote roles and freelance projects worldwide.
                </div>

                <AppContainer>
                    <HeroSection />
                    <SkillsSection />
                    <GitHistory />
                    <EducationSection />
                    <CertificationsSection />
                    <ProjectsSection />
                    <TestimonialsSection />
                    <BlogSection />
                    <TerminalSection />
                    <ContactSection />
                    <Footer />
                    <ChatBot />
                </AppContainer>
            </main>
        </>
    )
}

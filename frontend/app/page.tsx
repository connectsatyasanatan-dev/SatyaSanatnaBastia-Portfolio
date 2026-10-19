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

// Dynamic imports for heavy non-initial-viewport components to minimize compilation time
const TestimonialsSection = dynamic(() => import('@/components/TestimonialsSection'))
const BlogSection = dynamic(() => import('@/components/BlogSection'))
const TerminalSection = dynamic(() => import('@/components/TerminalSection'), { ssr: false })
const ChatBot = dynamic(() => import('@/components/ChatBot'), { ssr: false })

export default async function Home() {
    return (
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
    )
}

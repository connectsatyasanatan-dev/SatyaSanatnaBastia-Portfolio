'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Send, X, ChevronDown, User,
    Zap, Code2, Briefcase, Mail, Star,
    Mic, MicOff, RotateCcw, Copy, Check, Sparkles,
    Calendar, CheckCircle2, Clock
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────
export interface ProjectBlueprint {
    isScoping: boolean;
    projectType: string;
    estimatedTime: string;
    phases?: { phase: string; time: string }[];
}

interface Message {
    id: string;
    text: string;
    isBot: boolean;
    timestamp: Date;
    isStreaming?: boolean;
    suggestions?: string[];
    copied?: boolean;
    isFallback?: boolean;
    blueprint?: ProjectBlueprint;
}

interface HistoryItem {
    role: 'user' | 'assistant';
    content: string;
}

interface Chip {
    label: string;
    icon: React.ReactNode;
    query: string;
}

// ── Tooltip messages ──────────────────────────────────────
const TOOLTIP_MESSAGES = [
    { emoji: '👋', line1: 'Hey there!', line2: "Ask me anything about Satya" },
    { emoji: '💼', line1: 'Looking to hire?', line2: "I'll tell you everything you need" },
    { emoji: '🚀', line1: "Explore Satya's projects", line2: 'React, Python, AI & more' },
    { emoji: '⚡', line1: 'Satya is available!', line2: 'Open to full-time & freelance' },
    { emoji: '🧠', line1: 'Curious about his skills?', line2: 'From frontend to AI - ask me!' },
];

// ── Quick chips ───────────────────────────────────────────
const CHIPS: Chip[] = [
    { label: '🚀 Scope Project', icon: <Sparkles size={12} />, query: 'I would like a project scope and delivery blueprint for a new digital product' },
    { label: 'Projects', icon: <Code2 size={12} />, query: 'Tell me about your projects' },
    { label: 'Skills', icon: <Zap size={12} />, query: 'What is your tech stack?' },
    { label: 'Experience', icon: <Briefcase size={12} />, query: 'Tell me about your experience' },
    { label: 'Hire Me', icon: <Star size={12} />, query: 'Are you available for hire?' },
    { label: 'Contact', icon: <Mail size={12} />, query: 'How can I contact you?' },
];

// ── Client-side conversational backup (smooth, polite, zero technical error exposure) ────────
function buildClientFallback(msg?: string): string {
    const m = (msg || '').toLowerCase();
    if (m.includes('project') || m.includes('work') || m.includes('built')) {
        return "Satya has engineered standout full-stack projects! From this interactive VS Code portfolio to distributed task runners and AI integrations. Feel free to explore the **Projects** section on this page to test the live demos!";
    }
    if (m.includes('skill') || m.includes('tech') || m.includes('python') || m.includes('react')) {
        return "Satya specializes in **Next.js, React, TypeScript, Python, and PostgreSQL**. He focuses on building production-ready web apps with clean architecture and fluid UI/UX design. Check out the **Skills** section for an interactive breakdown!";
    }
    if (m.includes('hire') || m.includes('contact') || m.includes('email') || m.includes('reach')) {
        return "Satya is **actively available for new opportunities**! You can email him directly at [connectsatyasanatan@gmail.com](mailto:connectsatyasanatan@gmail.com) or scroll down to the **Contact** section at the bottom of this page to connect directly!";
    }
    if (m.includes('resume') || m.includes('cv')) {
        return "You can view or download **Satya's official Resume** directly via [Resume.pdf](/resume.pdf) or by clicking the **Resume** button in the top navigation bar!";
    }
    return "I'm right here! 👋 Feel free to ask me anything about Satya's **projects**, **tech stack**, **experience**, or how to get in touch for collaboration. What would you like to explore?";
}


// ── Smart follow-up suggestions ───────────────────────────
function extractSuggestions(text: string): string[] {
    const t = text.toLowerCase();
    const s: string[] = [];
    if (t.includes('project')) s.push('Show me your best project');
    if (t.includes('skill') || t.includes('tech')) s.push('What is your strongest skill?');
    if (t.includes('experience') || t.includes('company')) s.push('Tell me more about your experience');
    if (t.includes('ai') || t.includes('ml')) s.push('What AI tools do you use?');
    if (t.includes('contact') || t.includes('hire')) s.push('What is your availability?');
    return s.slice(0, 2);
}

// ── Markdown renderer ─────────────────────────────────────
function RenderMessage({ text }: { text: string }) {
    return (
        <div className="cb-msg-body">
            {text.split('\n').map((line, i) => {
                if (!line.trim()) return <br key={i} />;
                const parts = line.split(/(\*\*[^*]+\*\*)/g);
                const rendered = parts.map((part, j) =>
                    part.startsWith('**') && part.endsWith('**')
                        ? <strong key={j}>{part.slice(2, -2)}</strong>
                        : <span key={j}>{part}</span>
                );
                if (line.trim().startsWith('•') || line.trim().startsWith('-'))
                    return <div key={i} className="cb-bullet">{rendered}</div>;
                return <div key={i}>{rendered}</div>;
            })}
        </div>
    );
}

// ── Zentara Avatar ────────────────────────────────────────
function ZentaraAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const dims: Record<string, number> = { sm: 18, md: 26, lg: 44 };
    const d = dims[size];
    return (
        <img
            src="/images/Polished Bearded Avatar in Hoodie.png"
            alt="AI Assistant"
            style={{ width: d, height: d, objectFit: 'cover', borderRadius: '50%', display: 'block' }}
        />
    );
}

// ── Project Scoping & Force-Connect Lock-In Gate ───────────
function ProjectScopingCard({
    blueprint,
    sessionId,
    onSuccess,
}: {
    blueprint: ProjectBlueprint;
    sessionId: string;
    onSuccess: (text: string) => void;
}) {
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [slot, setSlot] = useState('Tomorrow Afternoon (IST)');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = contact.trim();
        if (!trimmed) {
            setError('Please enter your email or phone number');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
            const res = await fetch(`${baseUrl}/chat/lock-lead`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim() || 'Prospective Client',
                    email: trimmed.includes('@') ? trimmed : '',
                    phone: !trimmed.includes('@') ? trimmed : '',
                    preferredSlot: slot,
                    projectType: blueprint.projectType,
                    estimatedTime: blueprint.estimatedTime,
                    sessionId,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setIsLocked(true);
                onSuccess(`🎉 SPRINT LOCKED! Satya will connect with you on ${trimmed} for your ${slot} discovery session.`);
            } else {
                setError(data.error || 'Failed to submit request');
            }
        } catch {
            // Offline/direct mailto fallback
            window.open(
                `mailto:connectsatyasanatan@gmail.com?subject=Project%20Scoping%20-%20${encodeURIComponent(blueprint.projectType)}&body=Name:%20${encodeURIComponent(name)}%0AContact:%20${encodeURIComponent(contact)}%0APreferred%20Slot:%20${encodeURIComponent(slot)}%0AProject:%20${encodeURIComponent(blueprint.projectType)}%20(${encodeURIComponent(blueprint.estimatedTime)})`,
                '_blank'
            );
            setIsLocked(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLocked) {
        return (
            <div className="cb-blueprint-success">
                <div className="cb-blueprint-success-title">
                    <CheckCircle2 size={15} /> Sprint Timeline & Call Registered!
                </div>
                <div className="cb-blueprint-success-desc">
                    Your Project Blueprint and consultation request have been securely noted. Satya will review your technical specifications and connect with you at your chosen slot via email/WhatsApp! 🚀
                </div>
            </div>
        );
    }

    return (
        <div className="cb-blueprint-card">
            <div className="cb-blueprint-header">
                <div className="cb-blueprint-title">
                    <Sparkles size={14} /> Project Architecture Blueprint
                </div>
                <span className="cb-blueprint-badge">Target: {blueprint.estimatedTime}</span>
            </div>

            <div className="cb-blueprint-type">
                🎯 Scope: <span>{blueprint.projectType}</span>
            </div>

            {blueprint.phases && blueprint.phases.length > 0 && (
                <div className="cb-blueprint-phases">
                    {blueprint.phases.map((p, i) => (
                        <div key={i} className="cb-blueprint-phase">
                            <span className="cb-blueprint-phase-title">{p.phase}</span>
                            <span className="cb-blueprint-phase-time">{p.time}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="cb-blueprint-gate">
                <div className="cb-blueprint-gate-title">
                    <Calendar size={13} /> Lock In Timeline & Schedule 15-Min Scoping Call
                </div>
                <div className="cb-blueprint-gate-desc">
                    Preliminary architecture blueprint is prepared. To lock in this delivery timeline and conduct formal architecture sign-off, schedule a direct 15-minute scoping consultation with Satya:
                </div>

                <form className="cb-blueprint-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="cb-blueprint-input"
                        placeholder="Your Name or Company"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type="text"
                        className="cb-blueprint-input"
                        placeholder="Email or WhatsApp Number *"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        required
                    />
                    <select
                        className="cb-blueprint-select"
                        value={slot}
                        onChange={(e) => setSlot(e.target.value)}
                    >
                        <option value="Tomorrow Afternoon (IST / Flexible)">Tomorrow Afternoon (IST / Flexible)</option>
                        <option value="Today Evening (IST)">Today Evening (IST)</option>
                        <option value="This Weekend (IST)">This Weekend (IST)</option>
                        <option value="Flexible (Email Consultation First)">Flexible (Email Consultation First)</option>
                    </select>

                    {error && <div style={{ color: '#f87171', fontSize: 10 }}>{error}</div>}

                    <button type="submit" className="cb-blueprint-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : '🔒 Lock In Timeline & Schedule Call'}
                    </button>

                    <a
                        className="cb-blueprint-alt"
                        href={`mailto:connectsatyasanatan@gmail.com?subject=Project%20Scoping%20Inquiry%20-%20${encodeURIComponent(blueprint.projectType)}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Or email directly: connectsatyasanatan@gmail.com
                    </a>
                </form>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────
export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [userSentiment, setUserSentiment] = useState<'frustrated' | 'neutral' | 'positive'>('neutral');

    // Tooltip state
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipIdx, setTooltipIdx] = useState(0);
    const [hasSpeech, setHasSpeech] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            setHasSpeech(true);
        }
    }, []);

    const [sessionId] = useState(() => {
        if (typeof window !== 'undefined') {
            let sid = sessionStorage.getItem('portfolio_chat_sid');
            if (!sid) {
                sid = 'cs_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
                sessionStorage.setItem('portfolio_chat_sid', sid);
            }
            return sid;
        }
        return '';
    });

    const messagesRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const recognitionRef = useRef<unknown>(null);
    const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const MAX_CHARS = 300;

    // ── Tooltip logic ─────────────────────────────────────
    useEffect(() => {
        // Show after 2.5s
        const show = setTimeout(() => setShowTooltip(true), 2500);
        // Auto-hide after 8s
        const hide = setTimeout(() => setShowTooltip(false), 8500);
        return () => { clearTimeout(show); clearTimeout(hide); };
    }, []);

    // Rotate tooltip message every 3s while visible
    useEffect(() => {
        if (!showTooltip) return;
        tooltipTimer.current = setInterval(() => {
            setTooltipIdx(i => (i + 1) % TOOLTIP_MESSAGES.length);
        }, 3000);
        return () => { if (tooltipTimer.current) clearInterval(tooltipTimer.current); };
    }, [showTooltip]);

    // ── Scroll ────────────────────────────────────────────
    const scrollToBottom = useCallback((smooth = true) => {
        messagesRef.current?.scrollTo({
            top: messagesRef.current.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto',
        });
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

    const handleScroll = () => {
        if (!messagesRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = messagesRef.current;
        setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 80);
    };

    // ── Open chat ─────────────────────────────────────────
    useEffect(() => {
        if (isOpen && inputRef.current) inputRef.current.focus();
        if (isOpen && !hasOpened) {
            setHasOpened(true);
            const hour = new Date().getHours();
            let timeGreeting = 'Hey';
            if (hour >= 5 && hour < 12) timeGreeting = 'Good morning';
            else if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
            else if (hour >= 17 && hour < 21) timeGreeting = 'Good evening';
            else timeGreeting = 'Good night';

            setTimeout(() => {
                streamBotMessage(
                    `${timeGreeting}! 👋 I'm **Zentara**, Satya's personal AI assistant - here to give you the full picture on his work, skills, and how to collaborate.\n\nWhat would you like to explore?`,
                    []
                );
            }, 350);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

// ── Client-side Scoping Blueprint Helper ──────────────────
function getClientBlueprint(msg: string): ProjectBlueprint | undefined {
    const m = msg.toLowerCase();
    const isScoping = ['scope', 'blueprint', 'timeline', 'estimate', 'quotation', 'price', 'cost', 'banana hai', 'banwana hai', '3d', 'project', 'build', 'website', 'saas', 'app'].some(k => m.includes(k));
    if (!isScoping) return undefined;

    let projectType = "Custom Modern Web Application";
    if (m.includes("3d")) projectType = "Next-Gen 3D Interactive Web Experience";
    else if (m.includes("saas")) projectType = "Full-Stack Scalable SaaS Platform";
    else if (m.includes("ai") || m.includes("bot")) projectType = "AI-Powered Enterprise Intelligence System";
    else if (m.includes("ecommerce") || m.includes("store")) projectType = "High-Conversion E-Commerce Portal";

    return {
        isScoping: true,
        projectType,
        estimatedTime: "3–4 Weeks",
        phases: [
            { phase: "Phase 1: Architecture & Interactive UI/3D Prototype", time: "Days 1–7" },
            { phase: "Phase 2: Core Engineering & Scalable Backend DB", time: "Days 8–18" },
            { phase: "Phase 3: 60fps Optimization, QA & Production Launch", time: "Days 19–25" }
        ]
    };
}

    // ── Stream message ────────────────────────────────────
    const streamBotMessage = (
        fullText: string,
        suggestions: string[] = [],
        isFallback = false,
        blueprint?: ProjectBlueprint
    ) => {
        const id = Date.now().toString();
        setMessages(prev => [...prev, {
            id, text: '', isBot: true, timestamp: new Date(),
            isStreaming: true, suggestions: [], isFallback, canRetry: false,
            blueprint,
        }]);
        setIsTyping(false);
        let i = 0;
        const tick = () => {
            i += 2;
            const done = i >= fullText.length;
            setMessages(prev => prev.map(m =>
                m.id === id
                    ? { ...m, text: fullText.slice(0, Math.min(i, fullText.length)), isStreaming: !done, suggestions: done ? suggestions : [] }
                    : m
            ));
            if (!done) streamRef.current = setTimeout(tick, 10);
        };
        streamRef.current = setTimeout(tick, 10);
    };

    // ── API call (Connected directly to Flask Backend AI Engine) ─────
    const getBotResponse = async (userMsg: string): Promise<{
        response: string;
        suggestions: string[];
        isFallback: boolean;
        sentiment: string;
        blueprint?: ProjectBlueprint;
    }> => {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 65000);
            const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
            const res = await fetch(`${baseUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, history, hour: new Date().getHours(), sessionId }),
                signal: controller.signal,
            });
            clearTimeout(timeout);
            if (res.ok) {
                const data = await res.json();
                const aiSuggestions = (data.suggestions && data.suggestions.length > 0)
                    ? data.suggestions
                    : extractSuggestions(data.response);
                return {
                    response: data.response,
                    suggestions: aiSuggestions,
                    isFallback: Boolean(data.fallback),
                    sentiment: data.sentiment || 'neutral',
                    blueprint: data.blueprint || getClientBlueprint(userMsg),
                };
            }
        } catch {
            // silently fall through to smart fallback
        }
        // If fetch fails completely (e.g. temporary network glitch)
        return {
            response: buildClientFallback(userMsg),
            suggestions: ["View Projects", "What is your tech stack?", "Contact Satya"],
            isFallback: false,
            sentiment: 'neutral',
            blueprint: getClientBlueprint(userMsg),
        };
    };

    // ── Smart Action or Send ──────────────────────────────
    const handleActionOrSend = (actionText: string) => {
        const lower = actionText.toLowerCase();
        if (lower.includes('download resume') || lower === 'resume') {
            window.open('/SATYA SANATAN BASTIA - Resume.pdf', '_blank');
            return;
        }
        if (lower.includes('project') || lower === 'projects') {
            const el = document.getElementById('projects-section') || document.getElementById('projects');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        if (lower.includes('contact') || lower === 'contact') {
            const el = document.getElementById('contact-section') || document.getElementById('contact');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        if (lower.includes('skill') || lower === 'skills') {
            const el = document.getElementById('skills-section') || document.getElementById('skills');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        if (lower.includes('experience')) {
            const el = document.getElementById('git-history-section') || document.getElementById('experience-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        sendMessage(actionText);
    };

    // ── Send message ──────────────────────────────────────
    const sendMessage = async (text?: string) => {
        const msg = (text ?? input).trim();
        if (!msg || isTyping) return;
        if (streamRef.current) clearTimeout(streamRef.current);

        setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, isBot: false, timestamp: new Date() }]);
        setHistory(prev => [...prev, { role: 'user', content: msg }]);
        setInput('');
        setCharCount(0);
        setIsTyping(true);

        const { response, suggestions, isFallback, sentiment, blueprint } = await getBotResponse(msg);
        setUserSentiment(sentiment as 'frustrated' | 'neutral' | 'positive');

        // If API failed entirely, use client-side smart fallback
        const finalResponse = response || buildClientFallback(msg);
        const finalSuggestions = response ? suggestions : extractSuggestions(finalResponse);

        setHistory(prev => [...prev, { role: 'assistant', content: finalResponse }]);
        streamBotMessage(finalResponse, finalSuggestions, isFallback, blueprint);
    };

    // ── Input ─────────────────────────────────────────────
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val.length <= MAX_CHARS) { setInput(val); setCharCount(val.length); }
    };

    // ── Clear chat ────────────────────────────────────────
    const clearChat = () => {
        if (streamRef.current) clearTimeout(streamRef.current);
        setMessages([]); setHistory([]); setIsTyping(false);
        setTimeout(() => streamBotMessage("Chat cleared! 🔄 Ready for a fresh conversation.\n\nWhat would you like to know?"), 200);
    };

    // ── Copy message ──────────────────────────────────────
    const copyMessage = (id: string, text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setMessages(prev => prev.map(m => m.id === id ? { ...m, copied: true } : m));
            setTimeout(() => setMessages(prev => prev.map(m => m.id === id ? { ...m, copied: false } : m)), 2000);
        });
    };

    // ── Voice input ───────────────────────────────────────
    const toggleVoice = () => {
        const hasSR = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
        if (!hasSR) return;
        if (isListening) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (recognitionRef.current as any)?.stop();
            setIsListening(false); return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rec: any = new SR();
        rec.lang = 'en-US'; rec.interimResults = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rec.onresult = (e: any) => { setInput(e.results[0][0].transcript); setCharCount(e.results[0][0].transcript.length); setIsListening(false); };
        rec.onerror = () => setIsListening(false);
        rec.onend = () => setIsListening(false);
        recognitionRef.current = rec;
        rec.start(); setIsListening(true);
    };

    const tip = TOOLTIP_MESSAGES[tooltipIdx];

    // ── Render ────────────────────────────────────────────
    return (
        <>
            {/* ── Tooltip Popup ── */}
            {showTooltip && !isOpen && (
                <div
                    className="cb-tooltip"
                    onClick={() => { setIsOpen(true); setShowTooltip(false); }}
                    role="button"
                    aria-label="Open Zentara chat"
                >
                    <div className="cb-tooltip-avatar">
                        <ZentaraAvatar size="md" />
                        <span className="cb-tooltip-dot" />
                    </div>
                    <div className="cb-tooltip-body">
                        <div className="cb-tooltip-name">
                            <Sparkles size={11} />
                            Zentara · Satya's AI
                        </div>
                        <div className="cb-tooltip-msg">
                            <span className="cb-tooltip-emoji">{tip.emoji}</span>
                            <span>
                                <strong>{tip.line1}</strong>
                                <br />{tip.line2}
                            </span>
                        </div>
                    </div>
                    <button
                        className="cb-tooltip-close"
                        onClick={e => { e.stopPropagation(); setShowTooltip(false); }}
                        aria-label="Dismiss"
                    >
                        <X size={11} />
                    </button>
                    <div className="cb-tooltip-tail" />
                </div>
            )}

            {/* ── FAB Button ── */}
            <button
                className={`cb-fab ${isOpen ? 'cb-fab--open' : ''}`}
                onClick={() => { setIsOpen(v => !v); setShowTooltip(false); }}
                aria-label="Toggle Zentara AI assistant"
            >
                {isOpen
                    ? <X size={22} />
                    : <>
                        <div className="cb-fab-inner">
                            <ZentaraAvatar size="lg" />
                        </div>
                        <span className="cb-fab-ring" />
                        <span className="cb-fab-ring cb-fab-ring--delay" />
                    </>
                }
            </button>

            {/* ── Chat Window ── */}
            <div className={`cb-window ${isOpen ? 'cb-window--open' : ''}`} role="dialog" aria-label="Zentara AI Chat">

                {/* Header */}
                <div className="cb-header">
                    <div className="cb-header-glow" />
                    <div className="cb-header-left">
                        <div className="cb-avatar">
                            <ZentaraAvatar size="md" />
                            <span className="cb-avatar-dot" />
                        </div>
                        <div>
                            <div className="cb-header-name">
                                <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} />
                                Zentara
                            </div>
                            <div className="cb-header-status">
                                <span className="cb-status-dot" />
                                {userSentiment === 'frustrated'
                                    ? 'Here to help 💙'
                                    : userSentiment === 'positive'
                                        ? 'Loving the energy! ✨'
                                        : 'Online · Satya\'s AI Assistant'}
                            </div>
                        </div>
                    </div>
                    <div className="cb-header-actions">
                        <button className="cb-icon-btn" onClick={clearChat} aria-label="Clear chat" title="Clear chat">
                            <RotateCcw size={14} />
                        </button>
                        <button className="cb-close" onClick={() => setIsOpen(false)} aria-label="Close">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="cb-messages" ref={messagesRef} onScroll={handleScroll}>
                    {messages.length === 0 && (
                        <div className="cb-empty">
                            <div className="cb-empty-icon">
                                <ZentaraAvatar size="lg" />
                            </div>
                            <p>Zentara - Satya's AI</p>
                            <span>Ask me anything about Satya</span>
                        </div>
                    )}

                    {messages.map(msg => (
                        <div key={msg.id} className={`cb-msg ${msg.isBot ? 'cb-msg--bot' : 'cb-msg--user'}`}>
                            {msg.isBot && (
                                <div className="cb-msg-avatar">
                                    <ZentaraAvatar size="sm" />
                                </div>
                            )}
                            <div className="cb-msg-wrap">
                                <div className="cb-msg-bubble">
                                    {msg.isBot ? <RenderMessage text={msg.text} /> : <span>{msg.text}</span>}
                                    {msg.isStreaming && <span className="cb-cursor" />}
                                    <div className="cb-msg-footer">
                                        <span className="cb-msg-time">
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {msg.isBot && !msg.isStreaming && msg.text && (
                                            <button className="cb-copy-btn" onClick={() => copyMessage(msg.id, msg.text)} aria-label="Copy">
                                                {msg.copied ? <Check size={11} /> : <Copy size={11} />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {msg.isBot && !msg.isStreaming && msg.blueprint && (
                                    <ProjectScopingCard
                                        blueprint={msg.blueprint}
                                        sessionId={sessionId}
                                        onSuccess={(feedbackText) => {
                                            sendMessage(feedbackText);
                                        }}
                                    />
                                )}
                                {msg.isBot && !msg.isStreaming && msg.suggestions && msg.suggestions.length > 0 && (
                                    <div className="cb-suggestions">
                                        {msg.suggestions.map((s, i) => (
                                            <button key={i} className="cb-suggestion" onClick={() => handleActionOrSend(s)}>{s}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {!msg.isBot && (
                                <div className="cb-msg-avatar cb-msg-avatar--user"><User size={14} /></div>
                            )}
                        </div>
                    ))}

                    {isTyping && (
                        <div className="cb-msg cb-msg--bot">
                            <div className="cb-msg-avatar"><ZentaraAvatar size="sm" /></div>
                            <div className="cb-msg-bubble cb-typing-bubble">
                                <span /><span /><span />
                            </div>
                        </div>
                    )}
                </div>

                {showScrollBtn && (
                    <button className="cb-scroll-btn" onClick={() => scrollToBottom()} aria-label="Scroll to bottom">
                        <ChevronDown size={16} />
                    </button>
                )}

                {/* Chips */}
                <div className="cb-chips">
                    {CHIPS.map(chip => (
                        <button key={chip.label} className="cb-chip" onClick={() => sendMessage(chip.query)}>
                            {chip.icon}{chip.label}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div className="cb-input-row">
                    {hasSpeech && (
                        <button
                            className={`cb-voice-btn ${isListening ? 'cb-voice-btn--active' : ''}`}
                            onClick={toggleVoice}
                            aria-label={isListening ? 'Stop' : 'Voice input'}
                        >
                            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                        </button>
                    )}
                    <div className="cb-input-wrap">
                        <input
                            ref={inputRef}
                            className="cb-input"
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                            placeholder={isListening ? 'Listening...' : 'Ask Zentara anything...'}
                            aria-label="Chat input"
                            disabled={isListening}
                        />
                        {charCount > 200 && (
                            <span className={`cb-char-count ${charCount > 270 ? 'cb-char-count--warn' : ''}`}>
                                {MAX_CHARS - charCount}
                            </span>
                        )}
                    </div>
                    <button className="cb-send" onClick={() => sendMessage()} disabled={!input.trim() || isTyping} aria-label="Send">
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </>
    );
}

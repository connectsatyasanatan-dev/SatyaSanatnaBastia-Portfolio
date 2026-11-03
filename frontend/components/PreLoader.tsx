'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFestiveTheme } from '@/hooks/useFestiveTheme'
import { DiyaLamp, BULB_COLORS } from '@/components/DiwaliDecoration'
import PreLoaderFireworks from '@/components/PreLoaderFireworks'

interface PreLoaderProps {
    onLoadingComplete: () => void;
}

const languageSequences = [
    { text: "Satya Sanatan's Portfolio", lang: 'en', fontFamily: 'var(--font-display)' },
    { text: 'सत्य सनातनस्य कृतिसञ्चिका', lang: 'sa', fontFamily: '"Noto Serif Devanagari", serif' },
    { text: 'ସତ୍ୟ ସନାତନଙ୍କ କୃତି ସଂଚିକା', lang: 'or', fontFamily: '"Noto Sans Oriya", serif' },
]

const typingSpeed = 70

const logs = [
    "BOOTING_CORE_ENGINE",
    "LOADING_REACT_COMPONENTS",
    "INJECTING_NEURAL_STREAMS",
    "CALIBRATING_UX_INTERFACE",
    "SYNCING_DATABASE_STATE",
    "PREPARING_WORKSPACE",
    "READY_TO_LAUNCH"
]

const PreLoader: React.FC<PreLoaderProps> = ({ onLoadingComplete }) => {
    const [showContent, setShowContent] = useState(true)
    const [currentLog, setCurrentLog] = useState('SYSTEM_INIT')
    const [seqIndex, setSeqIndex] = useState(0)
    const [displayText, setDisplayText] = useState('')
    const [phase, setPhase] = useState<'typing' | 'erasing' | 'done' | 'flying' | 'landed'>('typing')
    const [flyCoords, setFlyCoords] = useState<{ x: number; y: number; scale: number } | null>(null)
    const avatarRef = useRef<HTMLDivElement>(null)

    const isFlying = phase === 'flying' || phase === 'landed'
    const current = languageSequences[seqIndex]
    const isLastSeq = seqIndex === languageSequences.length - 1

    const { activeFestival, isFestiveActive, isMounted } = useFestiveTheme()
    const showFestive = isMounted && isFestiveActive
    const showDiwali = showFestive && activeFestival === 'diwali'
    const showNewYear = showFestive && activeFestival === 'newyear'
    const showChristmas = showFestive && activeFestival === 'christmas'
    const showHoli = showFestive && activeFestival === 'holi'

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.body.classList.add('is-preloading')
        }
        return () => {
            if (typeof document !== 'undefined') {
                document.body.classList.remove('is-preloading')
            }
        }
    }, [])

    useEffect(() => {
        let elapsed = 0
        const totalMs = languageSequences.reduce(
            (acc, seq) => acc + seq.text.length * typingSpeed + seq.text.length * typingSpeed * 0.5 + 1100 + 350,
            0
        )
        const logInterval = setInterval(() => {
            elapsed += 600
            const logIdx = Math.min(Math.floor((elapsed / totalMs) * logs.length), logs.length - 1)
            setCurrentLog(logs[logIdx])
        }, 600)
        return () => clearInterval(logInterval)
    }, [])

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>
        let interval: ReturnType<typeof setInterval>

        if (phase === 'typing') {
            let idx = 0
            setDisplayText('')
            interval = setInterval(() => {
                idx++
                setDisplayText(current.text.slice(0, idx))
                if (idx >= current.text.length) {
                    clearInterval(interval)
                    timeout = setTimeout(() => setPhase(isLastSeq ? 'done' : 'erasing'), 1100)
                }
            }, typingSpeed)
        }

        if (phase === 'erasing') {
            let idx = current.text.length
            interval = setInterval(() => {
                idx--
                setDisplayText(current.text.slice(0, idx))
                if (idx <= 0) {
                    clearInterval(interval)
                    timeout = setTimeout(() => { setSeqIndex(i => i + 1); setPhase('typing') }, 300)
                }
            }, typingSpeed * 0.45)
        }

        if (phase === 'done') {
            setCurrentLog('SYSTEM_READY // DOCKING_AI')
            timeout = setTimeout(() => {
                if (typeof window !== 'undefined' && avatarRef.current) {
                    const avatarRect = avatarRef.current.getBoundingClientRect()
                    const avatarCenterX = avatarRect.left + avatarRect.width / 2
                    const avatarCenterY = avatarRect.top + avatarRect.height / 2

                    const fabInner = document.querySelector('.cb-fab-inner') as HTMLElement | null
                    const fabBtn = document.querySelector('.cb-fab') as HTMLElement | null
                    const targetEl = fabInner || fabBtn

                    let targetX = 0
                    let targetY = 0
                    let targetScale = 0.48

                    if (targetEl) {
                        const targetRect = targetEl.getBoundingClientRect()
                        const targetCenterX = targetRect.left + targetRect.width / 2
                        const targetCenterY = targetRect.top + targetRect.height / 2
                        targetX = targetCenterX - avatarCenterX
                        targetY = targetCenterY - avatarCenterY
                        targetScale = targetRect.width / avatarRect.width
                    } else {
                        const isMobile = window.innerWidth <= 768
                        const targetRight = isMobile ? 16 : 28
                        const targetBottom = isMobile ? 90 : 98
                        const fabSize = 56
                        const innerSize = 44
                        const targetCenterX = window.innerWidth - targetRight - (fabSize / 2)
                        const targetCenterY = window.innerHeight - targetBottom - (fabSize / 2)
                        targetX = targetCenterX - avatarCenterX
                        targetY = targetCenterY - avatarCenterY
                        targetScale = innerSize / avatarRect.width
                    }

                    setFlyCoords({ x: targetX, y: targetY, scale: targetScale })
                    setPhase('flying')
                }
            }, 600)
        }

        if (phase === 'flying') {
            timeout = setTimeout(() => {
                setPhase('landed')
                if (typeof document !== 'undefined') {
                    document.body.classList.remove('is-preloading')
                }
                setShowContent(false)
                onLoadingComplete()
            }, 950)
        }

        return () => { clearInterval(interval); clearTimeout(timeout) }
    }, [phase, seqIndex])

    return (
        <>
            <style>{`
                .preloader-root {
                    position: fixed;
                    inset: 0;
                    z-index: 99999;
                    background: #0b1212;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    transition: background 0.7s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .preloader-root--flying {
                    background: rgba(11, 18, 18, 0) !important;
                    pointer-events: none !important;
                }

                .preloader-fadeable {
                    transition: opacity 0.4s ease, transform 0.4s ease;
                }

                .preloader-fadeable--hidden {
                    opacity: 0 !important;
                    transform: translateY(16px) scale(0.96) !important;
                    pointer-events: none !important;
                }

                .preloader-glow {
                    position: absolute;
                    width: min(480px, 80vw);
                    height: min(480px, 80vw);
                    border-radius: 50%;
                    background: radial-gradient(circle, goldenrod 0%, transparent 70%);
                    filter: blur(72px);
                    z-index: 0;
                    pointer-events: none;
                }

                .preloader-center {
                    position: relative;
                    z-index: 1;
                    text-align: center;
                    width: 100%;
                    max-width: 780px;
                    padding: 0 clamp(16px, 5vw, 48px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .preloader-avatar-stage {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: clamp(14px, 3vw, 22px);
                }

                .preloader-avatar-aura {
                    position: absolute;
                    top: 42%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 140px;
                    height: 140px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(34, 211, 238, 0.22) 0%, rgba(218, 165, 32, 0.08) 50%, transparent 70%);
                    filter: blur(20px);
                    z-index: 0;
                    pointer-events: none;
                    animation: auraPulse 3s ease-in-out infinite alternate;
                }

                /* HUD corner brackets */
                .preloader-reticle {
                    position: absolute;
                    width: 9px;
                    height: 9px;
                    border-color: rgba(34, 211, 238, 0.7);
                    border-style: solid;
                    z-index: 3;
                    pointer-events: none;
                    transition: opacity 0.35s ease, transform 0.35s ease;
                }
                .preloader-reticle--hidden {
                    opacity: 0 !important;
                    transform: scale(1.4) !important;
                }
                .reticle-tl { top: -6px; left: -6px; border-width: 1.5px 0 0 1.5px; }
                .reticle-tr { top: -6px; right: -6px; border-width: 1.5px 1.5px 0 0; }
                .reticle-bl { bottom: 22px; left: -6px; border-width: 0 0 1.5px 1.5px; }
                .reticle-br { bottom: 22px; right: -6px; border-width: 0 1.5px 1.5px 0; }

                /* Minimalist orbital SVG ring */
                .preloader-orbit-svg {
                    position: absolute;
                    top: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: clamp(98px, 18vw, 116px);
                    height: clamp(98px, 18vw, 116px);
                    z-index: 1;
                    pointer-events: none;
                    transform-origin: center;
                    animation: orbitSpin 8s linear infinite;
                    transition: opacity 0.35s ease, transform 0.35s ease;
                }
                .preloader-orbit-svg--hidden {
                    opacity: 0 !important;
                    transform: translateX(-50%) scale(1.3) !important;
                }

                .preloader-orbit-track {
                    stroke: rgba(255, 255, 255, 0.08);
                    fill: none;
                    stroke-width: 1;
                }

                .preloader-orbit-runner {
                    stroke: #22d3ee;
                    fill: none;
                    stroke-width: 2;
                    stroke-linecap: round;
                    stroke-dasharray: 22 280;
                    filter: drop-shadow(0 0 4px #22d3ee);
                }

                /* Avatar core */
                .preloader-avatar-core {
                    position: relative;
                    width: clamp(82px, 15vw, 100px);
                    height: clamp(82px, 15vw, 100px);
                    border-radius: 50%;
                    overflow: hidden;
                    z-index: 999999;
                    background: #091014;
                    box-shadow:
                        0 0 0 1px rgba(255, 255, 255, 0.12),
                        0 0 0 2px rgba(34, 211, 238, 0.18),
                        0 16px 36px rgba(0, 0, 0, 0.7);
                }

                .preloader-landing-ripple {
                    position: absolute;
                    top: 42%;
                    left: 50%;
                    width: 56px;
                    height: 56px;
                    margin-left: -28px;
                    margin-top: -28px;
                    border-radius: 50%;
                    border: 2px solid #22d3ee;
                    box-shadow: 0 0 25px #22d3ee, inset 0 0 10px #22d3ee;
                    pointer-events: none;
                    z-index: 999999;
                }

                .preloader-avatar-photo {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }

                /* Biometric laser scanline */
                .preloader-scanline {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 38%;
                    background: linear-gradient(180deg, transparent 0%, rgba(34, 211, 238, 0.08) 50%, rgba(34, 211, 238, 0.45) 90%, rgba(255, 255, 255, 0.7) 100%);
                    box-shadow: 0 2px 6px rgba(34, 211, 238, 0.5);
                    pointer-events: none;
                    animation: cyberScan 2.4s ease-in-out infinite;
                }

                .preloader-lens-glare {
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 45%);
                    pointer-events: none;
                }

                /* Micro Identity Badge */
                .preloader-id-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 10px;
                    padding: 3px 10px;
                    background: rgba(10, 18, 26, 0.85);
                    border: 1px solid rgba(34, 211, 238, 0.25);
                    border-radius: 999px;
                    backdrop-filter: blur(8px);
                    font-family: var(--font-mono);
                    font-size: 9.5px;
                    letter-spacing: 1.6px;
                    color: rgba(226, 232, 240, 0.85);
                    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
                    z-index: 2;
                    transition: opacity 0.35s ease, transform 0.35s ease;
                }

                .preloader-id-pill--hidden {
                    opacity: 0 !important;
                    transform: translateY(-8px) scale(0.9) !important;
                }

                .id-pill-dot {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: #22d3ee;
                    box-shadow: 0 0 6px #22d3ee;
                    animation: dotPulse 1.6s ease-in-out infinite alternate;
                }

                @keyframes cyberScan {
                    0% { transform: translateY(-100%); opacity: 0; }
                    15% { opacity: 1; }
                    85% { opacity: 1; }
                    100% { transform: translateY(270%); opacity: 0; }
                }

                @keyframes orbitSpin {
                    from { transform: translateX(-50%) rotate(0deg); }
                    to { transform: translateX(-50%) rotate(360deg); }
                }

                @keyframes auraPulse {
                    0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.6; }
                    100% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
                }

                @keyframes dotPulse {
                    0% { opacity: 0.4; transform: scale(0.85); }
                    100% { opacity: 1; transform: scale(1.2); }
                }

                .preloader-title-wrap {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: clamp(3rem, 8vw, 5rem);
                    width: 100%;
                }

                .preloader-title {
                    color: goldenrod;
                    font-size: clamp(1.3rem, 5vw, 2.5rem);
                    font-weight: 700;
                    letter-spacing: 2px;
                    text-shadow: 0 0 28px rgba(218,165,32,0.5), 0 0 60px rgba(218,165,32,0.15);
                    margin: 0;
                    line-height: 1.4;
                    word-break: break-word;
                    overflow-wrap: break-word;
                    max-width: 100%;
                }

                .preloader-cursor {
                    display: inline-block;
                    margin-left: 6px;
                    width: 3px;
                    height: clamp(1.3rem, 5vw, 2.5rem);
                    background: goldenrod;
                    vertical-align: middle;
                    flex-shrink: 0;
                    border-radius: 2px;
                    box-shadow: 0 0 10px rgba(218,165,32,0.8);
                }

                .preloader-divider {
                    height: 1px;
                    width: 100%;
                    background: linear-gradient(90deg, transparent 0%, rgba(218,165,32,0.8) 35%, goldenrod 50%, rgba(218,165,32,0.8) 65%, transparent 100%);
                    margin-top: clamp(16px, 3vw, 28px);
                    box-shadow: 0 0 12px rgba(218,165,32,0.6);
                    transform-origin: center;
                }

                .preloader-subtitle {
                    color: white;
                    margin-top: clamp(12px, 2vw, 20px);
                    font-size: clamp(0.6rem, 1.5vw, 0.8rem);
                    letter-spacing: clamp(3px, 1vw, 6px);
                    text-transform: uppercase;
                    font-family: var(--font-mono);
                    opacity: 0.45;
                }

                .preloader-status {
                    position: absolute;
                    bottom: clamp(20px, 4vh, 40px);
                    left: clamp(16px, 4vw, 40px);
                    right: clamp(16px, 4vw, 40px);
                    font-family: var(--font-mono);
                    font-size: clamp(9px, 1.5vw, 11px);
                    color: rgba(255,255,255,0.25);
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .preloader-status-text {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .preloader-bar-track {
                    width: 100%;
                    max-width: clamp(140px, 30vw, 220px);
                    height: 2px;
                    background: rgba(255,255,255,0.08);
                    border-radius: 2px;
                    overflow: hidden;
                }

                /* Landscape phone */
                @media (max-height: 480px) and (orientation: landscape) {
                    .preloader-title { font-size: clamp(1rem, 4vw, 1.6rem); }
                    .preloader-subtitle { display: none; }
                    .preloader-status { bottom: 12px; }
                }

                /* Very small screens */
                @media (max-width: 320px) {
                    .preloader-title { font-size: 1.1rem; letter-spacing: 0; }
                    .preloader-cursor { height: 1.1rem; }
                }

                /* ── Festive Seasonal Theme Overlays for PreLoader ── */
                .preloader-root--diwali {
                    background: radial-gradient(ellipse at 50% 20%, #190c29 0%, #0d071a 50%, #06040e 100%) !important;
                }

                .preloader-glow--diwali {
                    background: radial-gradient(circle, #ff9933 0%, rgba(255, 107, 26, 0.28) 45%, transparent 70%) !important;
                    filter: blur(80px);
                }

                .preloader-diwali-topbar {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 48px;
                    z-index: 10;
                    pointer-events: none;
                    user-select: none;
                    overflow: visible;
                }

                .preloader-festive-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 14px;
                    padding: 5px 16px;
                    background: linear-gradient(135deg, rgba(255, 153, 51, 0.18), rgba(255, 107, 26, 0.12));
                    border: 1px solid rgba(255, 193, 7, 0.45);
                    border-radius: 999px;
                    backdrop-filter: blur(10px);
                    font-family: var(--font-mono);
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 1px;
                    color: #ffe082;
                    box-shadow: 0 0 20px rgba(255, 153, 51, 0.35);
                    z-index: 2;
                }

                .preloader-diwali-corner {
                    position: absolute;
                    bottom: clamp(24px, 5vh, 44px);
                    z-index: 12;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    pointer-events: none;
                    user-select: none;
                }

                .preloader-diwali-corner--left {
                    left: clamp(16px, 4vw, 48px);
                }

                .preloader-diwali-corner--right {
                    right: clamp(16px, 4vw, 48px);
                }

                .preloader-diya-label {
                    font-family: var(--font-mono);
                    font-size: 10px;
                    letter-spacing: 1.2px;
                    color: #ffca28;
                    text-shadow: 0 0 8px rgba(255, 193, 7, 0.6);
                    background: rgba(10, 8, 20, 0.75);
                    padding: 3px 9px;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 193, 7, 0.25);
                    backdrop-filter: blur(6px);
                }

                .preloader-avatar-core--diwali {
                    box-shadow:
                        0 0 0 1px rgba(255, 215, 0, 0.45),
                        0 0 0 2px rgba(255, 153, 51, 0.55),
                        0 0 35px rgba(255, 153, 51, 0.5),
                        0 16px 36px rgba(0, 0, 0, 0.8) !important;
                }

                .preloader-orbit-runner--diwali {
                    stroke: #ff9933 !important;
                    filter: drop-shadow(0 0 6px #ff9933) !important;
                }

                .preloader-reticle--diwali {
                    border-color: rgba(255, 193, 7, 0.85) !important;
                }

                .preloader-id-pill--diwali {
                    border-color: rgba(255, 193, 7, 0.4) !important;
                    color: #ffe082 !important;
                    background: rgba(26, 15, 36, 0.88) !important;
                }

                .id-pill-dot--diwali {
                    background: #ffb300 !important;
                    box-shadow: 0 0 8px #ffb300 !important;
                }

                /* ── Firecracker burst animations in PreLoader ── */
                .preloader-fireworks-layer {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 1;
                    overflow: hidden;
                    user-select: none;
                }

                .preloader-burst-origin {
                    position: absolute;
                    width: 0;
                    height: 0;
                    pointer-events: none;
                }

                .preloader-burst-flash {
                    position: absolute;
                    left: -24px;
                    top: -24px;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    pointer-events: none;
                    filter: blur(4px);
                    animation: burstFlashAnim 0.45s ease-out forwards;
                }

                .preloader-burst-spark {
                    position: absolute;
                    left: 0;
                    top: 0;
                    border-radius: 50%;
                    pointer-events: none;
                    animation: burstSparkAnim 1.3s cubic-bezier(0.12, 0.8, 0.32, 1) forwards;
                    will-change: transform, opacity;
                }

                @keyframes burstFlashAnim {
                    0% { transform: scale(0.2); opacity: 0; }
                    25% { transform: scale(1.3); opacity: 1; }
                    100% { transform: scale(2.4); opacity: 0; }
                }

                @keyframes burstSparkAnim {
                    0% {
                        transform: translate(0, 0) scale(1.4);
                        opacity: 1;
                    }
                    45% {
                        opacity: 0.95;
                    }
                    75% {
                        opacity: 0.6;
                        transform: translate(calc(var(--tx) * 0.9), calc(var(--ty) * 0.9)) scale(0.9);
                    }
                    100% {
                        transform: translate(var(--tx), var(--ty)) scale(0.2);
                        opacity: 0;
                    }
                }
            `}</style>

            <AnimatePresence>
                {showContent && (
                    <motion.div
                        className={`preloader-root ${showDiwali ? 'preloader-root--diwali' : ''} ${isFlying ? 'preloader-root--flying' : ''}`}
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
                    >
                        {/* Festive Firecracker / Fireworks Burst Layer */}
                        <PreLoaderFireworks active={Boolean(showDiwali)} isFlying={isFlying} />
                        {/* Top Hanging Fairy Lights Strand across PreLoader */}
                        {showDiwali && (
                            <div className={`preloader-diwali-topbar preloader-fadeable ${isFlying ? 'preloader-fadeable--hidden' : ''}`} aria-hidden="true">
                                <div className="diwali-wire" />
                                <div className="diwali-lights-strand">
                                    {Array.from({ length: 24 }).map((_, i) => {
                                        const colorType = BULB_COLORS[i % BULB_COLORS.length]
                                        return (
                                            <div key={i} className="diwali-bulb-wrap">
                                                <div className="diwali-bulb-cord" />
                                                <div className="diwali-bulb-socket" />
                                                <div className={`diwali-bulb diwali-bulb--${colorType}`} />
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Ambient Deep Floating Embers */}
                        {showDiwali && (
                            <div className={`diwali-embers-wrap preloader-fadeable ${isFlying ? 'preloader-fadeable--hidden' : ''}`} aria-hidden="true">
                                {[
                                    { left: '8%', size: 3, delay: '0s', duration: '14s' },
                                    { left: '22%', size: 3.5, delay: '2.5s', duration: '17s' },
                                    { left: '42%', size: 2.5, delay: '6s', duration: '15s' },
                                    { left: '60%', size: 3.5, delay: '1s', duration: '18s' },
                                    { left: '78%', size: 4, delay: '4s', duration: '16s' },
                                    { left: '92%', size: 2.5, delay: '3s', duration: '13s' },
                                ].map((ember, idx) => (
                                    <div
                                        key={idx}
                                        className="diwali-ember"
                                        style={{
                                            left: ember.left,
                                            width: `${ember.size}px`,
                                            height: `${ember.size}px`,
                                            animationDelay: ember.delay,
                                            animationDuration: ember.duration,
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Bottom Corner Glowing Diyas */}
                        {showDiwali && (
                            <>
                                <div className={`preloader-diwali-corner preloader-diwali-corner--left preloader-fadeable ${isFlying ? 'preloader-fadeable--hidden' : ''}`} aria-hidden="true">
                                    <div className="diwali-diya-aura" />
                                    <DiyaLamp />
                                    <span className="preloader-diya-label">🪔 Shubh Deepawali</span>
                                </div>
                                <div className={`preloader-diwali-corner preloader-diwali-corner--right preloader-fadeable ${isFlying ? 'preloader-fadeable--hidden' : ''}`} aria-hidden="true">
                                    <div className="diwali-diya-aura" />
                                    <DiyaLamp />
                                    <span className="preloader-diya-label">✨ Happy Diwali</span>
                                </div>
                            </>
                        )}

                        {/* Pulsing radial glow */}
                        <motion.div
                            className={`preloader-glow ${showDiwali ? 'preloader-glow--diwali' : ''} preloader-fadeable ${isFlying ? 'preloader-fadeable--hidden' : ''}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.6, opacity: 0.12 }}
                            transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                        />

                        {/* Center content */}
                        <div className="preloader-center">

                            {/* Festive Seasonal Greeting Badge */}
                            {showFestive && !isFlying && (
                                <motion.div
                                    className="preloader-festive-badge preloader-fadeable"
                                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                >
                                    {showDiwali && (
                                        <>
                                            <span>🪔</span>
                                            <span>Shubh Deepawali // Festival of Lights</span>
                                            <span>✨</span>
                                        </>
                                    )}
                                    {showNewYear && (
                                        <>
                                            <span>✨</span>
                                            <span>Happy New Year Celebration</span>
                                            <span>🥂</span>
                                        </>
                                    )}
                                    {showChristmas && (
                                        <>
                                            <span>🎄</span>
                                            <span>Merry Christmas & Happy Holidays</span>
                                            <span>❄️</span>
                                        </>
                                    )}
                                    {showHoli && (
                                        <>
                                            <span>🎨</span>
                                            <span>Happy Holi // Festival of Colors</span>
                                            <span>🌸</span>
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {/* Modern HUD Avatar Stage */}
                            <motion.div
                                className="preloader-avatar-stage"
                                initial={{ scale: 0.85, opacity: 0, y: -8 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            >
                                {!isFlying && (
                                    <>
                                        <div className="preloader-avatar-aura" />
                                        <span className={`preloader-reticle reticle-tl ${showDiwali ? 'preloader-reticle--diwali' : ''}`} />
                                        <span className={`preloader-reticle reticle-tr ${showDiwali ? 'preloader-reticle--diwali' : ''}`} />
                                        <span className={`preloader-reticle reticle-bl ${showDiwali ? 'preloader-reticle--diwali' : ''}`} />
                                        <span className={`preloader-reticle reticle-br ${showDiwali ? 'preloader-reticle--diwali' : ''}`} />

                                        <svg className="preloader-orbit-svg" viewBox="0 0 120 120">
                                            <circle cx="60" cy="60" r="54" className="preloader-orbit-track" />
                                            <circle cx="60" cy="60" r="54" className={`preloader-orbit-runner ${showDiwali ? 'preloader-orbit-runner--diwali' : ''}`} />
                                        </svg>
                                    </>
                                )}

                                <motion.div
                                    ref={avatarRef}
                                    className={`preloader-avatar-core ${showDiwali ? 'preloader-avatar-core--diwali' : ''}`}
                                    animate={
                                        isFlying && flyCoords
                                            ? {
                                                x: flyCoords.x,
                                                y: flyCoords.y,
                                                scale: flyCoords.scale,
                                                boxShadow: showDiwali
                                                    ? '0 0 32px rgba(255, 179, 0, 0.95), 0 0 60px rgba(255, 107, 26, 0.5)'
                                                    : '0 0 32px rgba(34, 211, 238, 0.95), 0 0 60px rgba(34, 211, 238, 0.4)',
                                            }
                                            : {
                                                x: 0,
                                                y: 0,
                                                scale: 1,
                                            }
                                    }
                                    transition={
                                        isFlying
                                            ? {
                                                duration: 0.95,
                                                ease: [0.16, 1, 0.3, 1],
                                            }
                                            : { duration: 0.2 }
                                    }
                                >
                                    <img
                                        src="/images/Polished Bearded Avatar in Hoodie.png"
                                        alt="Satya Sanatan"
                                        className="preloader-avatar-photo"
                                    />
                                    {!isFlying && (
                                        <>
                                            <div className="preloader-scanline" />
                                            <div className="preloader-lens-glare" />
                                        </>
                                    )}
                                </motion.div>

                                {!isFlying && (
                                    <div className={`preloader-id-pill ${showDiwali ? 'preloader-id-pill--diwali' : ''}`}>
                                        <span className={`id-pill-dot ${showDiwali ? 'id-pill-dot--diwali' : ''}`} />
                                        <span>DEV // SATYA</span>
                                    </div>
                                )}
                            </motion.div>

                            {/* Title + cursor */}
                            <div className={`preloader-title-wrap preloader-fadeable ${isFlying ? 'preloader-fadeable--hidden' : ''}`}>
                                <motion.h2
                                    key={`font-${seqIndex}`}
                                    className="preloader-title"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    lang={current.lang}
                                    style={{
                                        fontFamily: current.fontFamily,
                                        letterSpacing: current.lang === 'en' ? '2px' : '0.5px',
                                    }}
                                >
                                    {displayText}
                                </motion.h2>

                                <motion.span
                                    className="preloader-cursor"
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ duration: 0.75, repeat: Infinity, ease: 'easeInOut' }}
                                />
                            </div>

                            {/* Divider */}
                            <motion.div
                                className={`preloader-divider preloader-fadeable ${isFlying ? 'preloader-fadeable--hidden' : ''}`}
                                initial={{ scaleX: 0, opacity: 0 }}
                                animate={{ scaleX: 1, opacity: 1 }}
                                transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                            />

                            {/* Subtitle */}
                            <motion.p
                                className={`preloader-subtitle preloader-fadeable ${isFlying ? 'preloader-fadeable--hidden' : ''}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.45 }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                            >
                                Initializing Environment...
                            </motion.p>
                        </div>

                        {/* Bottom status */}
                        <div className={`preloader-status preloader-fadeable ${isFlying ? 'preloader-fadeable--hidden' : ''}`}>
                            <div className="preloader-status-text">
                                SYSTEM_STATUS:{' '}
                                <span style={{ color: showDiwali ? '#ffb300' : 'var(--primary)', opacity: 0.9 }}>{currentLog}</span>
                            </div>
                            <div className="preloader-bar-track">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: languageSequences.length * 4.5, ease: 'linear' }}
                                    style={{
                                        height: '100%',
                                        background: showDiwali ? 'linear-gradient(90deg, #ff9933, #ffd166, #ff9933)' : 'var(--primary)',
                                        boxShadow: showDiwali ? '0 0 10px rgba(255, 179, 0, 0.6)' : undefined,
                                        borderRadius: '2px'
                                    }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default PreLoader

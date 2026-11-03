'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useFestiveTheme } from '@/hooks/useFestiveTheme';

// Repeating festive bulb color sequence from screenshot
export const BULB_COLORS = ['gold', 'saffron', 'ruby', 'cyan', 'amber'] as const;

// Minimalist Vector Diya Lamp SVG
export function DiyaLamp() {
    return (
        <svg
            className="diwali-diya-svg"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            {/* Animated Diya Flame */}
            <g className="diwali-flame">
                <path
                    d="M12 1.5C12 1.5 8 6.5 8 10C8 12.2 10.07 14 12 14C13.93 14 16 12.2 16 10C16 6.5 12 1.5 12 1.5Z"
                    fill="url(#dwFlameTop)"
                />
                <path
                    d="M12 5C12 5 9.8 8 9.8 10.2C9.8 11.4 10.8 12.4 12 12.4C13.2 12.4 14.2 11.4 14.2 10.2C14.2 8 12 5 12 5Z"
                    fill="#FFFDE7"
                />
            </g>
            <path
                d="M4 14C4 18 7.5 21 12 21C16.5 21 20 18 20 14H4Z"
                fill="url(#dwBaseTop)"
            />
            <ellipse cx="12" cy="14" rx="8" ry="1.8" fill="url(#dwRimTop)" />
            <circle cx="12" cy="13.2" r="0.9" fill="#FFB300" />
            <defs>
                <linearGradient id="dwFlameTop" x1="12" y1="1.5" x2="12" y2="14" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFF59D" />
                    <stop offset="0.4" stopColor="#FFB300" />
                    <stop offset="1" stopColor="#FF5722" />
                </linearGradient>
                <linearGradient id="dwBaseTop" x1="12" y1="14" x2="12" y2="21" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E64A19" />
                    <stop offset="1" stopColor="#871C0C" />
                </linearGradient>
                <linearGradient id="dwRimTop" x1="4" y1="14" x2="20" y2="14" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFD54F" />
                    <stop offset="0.5" stopColor="#FFF9C4" />
                    <stop offset="1" stopColor="#FFB300" />
                </linearGradient>
            </defs>
        </svg>
    );
}

const GOLD_PALETTE = ['#ffd166', '#ffb703', '#ff9933', '#ffe066', '#fff9c4'];

interface Sparkle {
    id: number;
    x: number;
    y: number;
    angle: number;
    speed: number;
    color: string;
    size: number;
}

export default function DiwaliDecoration() {
    const [isMounted, setIsMounted] = useState(false);
    const [sparkles, setSparkles] = useState<Sparkle[]>([]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Interactive sparkle burst on Diya click
    const triggerDiyaSparkle = useCallback((e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const newSparkles: Sparkle[] = Array.from({ length: 16 }).map((_, i) => ({
            id: Date.now() + i + Math.random(),
            x: cx,
            y: cy,
            angle: (Math.PI * 2 / 16) * i + (Math.random() - 0.5) * 0.4,
            speed: 2 + Math.random() * 3.5,
            color: GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
            size: 2 + Math.random() * 2.5,
        }));

        setSparkles(prev => [...prev, ...newSparkles].slice(-48));

        setTimeout(() => {
            setSparkles(prev => prev.filter(s => !newSparkles.some(ns => ns.id === s.id)));
        }, 1200);
    }, []);

    const { activeFestival, isFestiveActive } = useFestiveTheme();

    if (!isMounted || !isFestiveActive || activeFestival !== 'diwali') return null;

    // Number of fairy bulbs to span across top wire
    const bulbCount = 22;

    // 7 gentle ambient embers for deep background
    const embers = [
        { left: '10%', size: 3, delay: '0s', duration: '15s' },
        { left: '24%', size: 3.5, delay: '3.5s', duration: '18s' },
        { left: '40%', size: 2.5, delay: '7s', duration: '14s' },
        { left: '56%', size: 3.5, delay: '1.5s', duration: '19s' },
        { left: '72%', size: 4, delay: '5s', duration: '16s' },
        { left: '86%', size: 2.5, delay: '2.5s', duration: '14s' },
        { left: '4%', size: 3.5, delay: '6s', duration: '20s' },
    ];

    return (
        <>
            {/* ── Top Hanging Festive Fairy Lights & Corner Diyas ─────────── */}
            <div className="diwali-decor-container">
                {/* Golden Suspension Wire */}
                <div className="diwali-wire" />

                {/* Left Corner Diya (Clickable celebration Easter Egg) */}
                <button
                    type="button"
                    className="diwali-corner-diya diwali-corner-diya--left"
                    onClick={triggerDiyaSparkle}
                    title="Shubh Deepawali ✨ (Click to celebrate)"
                    aria-label="Diwali Diya"
                >
                    <div className="diwali-diya-aura" />
                    <DiyaLamp />
                    <span className="diwali-diya-badge">🪔 Shubh Deepawali</span>
                </button>

                {/* Hanging Fairy Lights Strand (User-Favoured Design) */}
                <div className="diwali-lights-strand" aria-hidden="true">
                    {Array.from({ length: bulbCount }).map((_, i) => {
                        const colorType = BULB_COLORS[i % BULB_COLORS.length];
                        return (
                            <div key={i} className="diwali-bulb-wrap">
                                <div className="diwali-bulb-cord" />
                                <div className="diwali-bulb-socket" />
                                <div className={`diwali-bulb diwali-bulb--${colorType}`} />
                            </div>
                        );
                    })}
                </div>

                {/* Right Corner Diya */}
                <button
                    type="button"
                    className="diwali-corner-diya diwali-corner-diya--right"
                    onClick={triggerDiyaSparkle}
                    title="Happy Diwali ✨ (Click to celebrate)"
                    aria-label="Diwali Diya"
                >
                    <div className="diwali-diya-aura" />
                    <DiyaLamp />
                    <span className="diwali-diya-badge">✨ Happy Diwali</span>
                </button>
            </div>

            {/* ── Interactive Sparkle Burst Layer ─────────────────────── */}
            {sparkles.length > 0 && (
                <div className="diwali-sparkle-container" aria-hidden="true">
                    {sparkles.map(sp => {
                        const dist = 32;
                        const tx = Math.cos(sp.angle) * dist;
                        const ty = Math.sin(sp.angle) * dist;
                        return (
                            <span
                                key={sp.id}
                                className="diwali-sparkle-dot"
                                style={{
                                    left: `${sp.x}px`,
                                    top: `${sp.y}px`,
                                    width: `${sp.size}px`,
                                    height: `${sp.size}px`,
                                    backgroundColor: sp.color,
                                    boxShadow: `0 0 6px ${sp.color}`,
                                    ['--tx' as string]: `${tx}px`,
                                    ['--ty' as string]: `${ty}px`,
                                }}
                            />
                        );
                    })}
                </div>
            )}

            {/* ── Deep Background Ambient Golden Embers ────────────────── */}
            <div className="diwali-embers-wrap" aria-hidden="true">
                {embers.map((ember, idx) => (
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
        </>
    );
}

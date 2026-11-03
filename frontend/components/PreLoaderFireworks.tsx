'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Particle {
    id: number;
    angle: number;
    speed: number;
    color: string;
    size: number;
    tx: number;
    ty: number;
}

interface Burst {
    id: number;
    x: number;
    y: number;
    color: string;
    particles: Particle[];
    createdAt: number;
}

const BURST_PALETTES = [
    { main: '#ffd166', colors: ['#ffd166', '#ffb703', '#fff9c4', '#ff9933', '#ffffff'] }, // Golden Anar
    { main: '#ff2a85', colors: ['#ff2a85', '#ff70a6', '#ffd166', '#ffffff', '#ff0054'] }, // Ruby Magenta
    { main: '#06f9f9', colors: ['#06f9f9', '#70e000', '#ffd166', '#ffffff', '#38bdf8'] }, // Emerald Cyan
    { main: '#ff7b00', colors: ['#ff7b00', '#ffaa00', '#ffd166', '#fff3b0', '#ffffff'] }, // Saffron Gold
    { main: '#a855f7', colors: ['#a855f7', '#c084fc', '#ffd166', '#ffffff', '#e879f9'] }, // Royal Purple
];

const PRESET_SPOTS = [
    { x: 18, y: 22 },
    { x: 82, y: 18 },
    { x: 26, y: 34 },
    { x: 74, y: 30 },
    { x: 50, y: 15 },
    { x: 14, y: 28 },
    { x: 86, y: 25 },
];

export default function PreLoaderFireworks({
    active,
    isFlying,
}: {
    active: boolean;
    isFlying: boolean;
}) {
    const [bursts, setBursts] = useState<Burst[]>([]);
    const spotIndexRef = useRef(0);

    const createBurst = (xPercent: number, yPercent: number) => {
        const palette = BURST_PALETTES[Math.floor(Math.random() * BURST_PALETTES.length)];
        const particleCount = 18;

        const particles: Particle[] = Array.from({ length: particleCount }).map((_, i) => {
            const angle = (Math.PI * 2 / particleCount) * i + (Math.random() - 0.5) * 0.35;
            const distance = 36 + Math.random() * 48; // radial travel distance
            const gravity = 10 + Math.random() * 8; // slight downward drop
            const color = palette.colors[Math.floor(Math.random() * palette.colors.length)];
            const size = 2.5 + Math.random() * 2.5;

            return {
                id: i,
                angle,
                speed: distance,
                color,
                size,
                tx: Math.cos(angle) * distance,
                ty: Math.sin(angle) * distance + gravity,
            };
        });

        const newBurst: Burst = {
            id: Date.now() + Math.random(),
            x: xPercent,
            y: yPercent,
            color: palette.main,
            particles,
            createdAt: Date.now(),
        };

        setBursts(prev => [...prev.slice(-3), newBurst]);

        // Cleanup burst after animation completes (1.4s)
        setTimeout(() => {
            setBursts(prev => prev.filter(b => b.id !== newBurst.id));
        }, 1400);
    };

    // Auto-fire bursts at aesthetic intervals
    useEffect(() => {
        if (!active || isFlying) {
            setBursts([]);
            return;
        }

        // Trigger an initial burst shortly after load
        const initialTimer = setTimeout(() => {
            const spot = PRESET_SPOTS[spotIndexRef.current % PRESET_SPOTS.length];
            spotIndexRef.current++;
            createBurst(spot.x, spot.y);
        }, 350);

        // Recurring bursts every 1.8s - 2.4s
        const interval = setInterval(() => {
            const spot = PRESET_SPOTS[spotIndexRef.current % PRESET_SPOTS.length];
            spotIndexRef.current++;
            // Add a tiny random offset (+/- 4%) so it feels natural
            const x = Math.min(88, Math.max(12, spot.x + (Math.random() - 0.5) * 8));
            const y = Math.min(38, Math.max(12, spot.y + (Math.random() - 0.5) * 6));
            createBurst(x, y);
        }, 2000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, [active, isFlying]);

    if (!active || isFlying) return null;

    return (
        <div className="preloader-fireworks-layer" aria-hidden="true">
            {bursts.map(burst => (
                <div
                    key={burst.id}
                    className="preloader-burst-origin"
                    style={{ left: `${burst.x}%`, top: `${burst.y}%` }}
                >
                    {/* Central burst flash flare */}
                    <div
                        className="preloader-burst-flash"
                        style={{
                            background: `radial-gradient(circle, ${burst.color} 0%, rgba(255, 255, 255, 0.9) 35%, transparent 70%)`,
                        }}
                    />

                    {/* Radial chrysanthemum sparks */}
                    {burst.particles.map(p => (
                        <span
                            key={p.id}
                            className="preloader-burst-spark"
                            style={{
                                width: `${p.size}px`,
                                height: `${p.size}px`,
                                backgroundColor: p.color,
                                boxShadow: `0 0 6px ${p.color}, 0 0 12px ${p.color}`,
                                ['--tx' as string]: `${p.tx}px`,
                                ['--ty' as string]: `${p.ty}px`,
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}


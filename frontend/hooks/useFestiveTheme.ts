'use client';

import { useState, useEffect, useCallback } from 'react';

export interface FestiveThemeState {
    activeFestival: string;
    isEnabled: boolean;
    isFestiveActive: boolean;
    isMounted: boolean;
    isLoading: boolean;
    refresh: () => void;
}

const STORAGE_KEY = 'portfolio_festive_theme';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const DEFAULT_CONFIG = {
    activeFestival: 'diwali',
    enabled: true,
};

export function useFestiveTheme(): FestiveThemeState {
    const [isMounted, setIsMounted] = useState(false);
    const [state, setState] = useState({
        activeFestival: DEFAULT_CONFIG.activeFestival,
        isEnabled: DEFAULT_CONFIG.enabled,
        isLoading: true,
    });

    const syncTheme = useCallback(async () => {
        if (typeof window === 'undefined') return;

        try {
            const res = await fetch(`${API_URL}/festive-theme`, {
                headers: { 'Accept': 'application/json' },
                cache: 'no-store',
            });
            if (res.ok) {
                const data = await res.json();
                const activeFestival = data.activeFestival ?? 'none';
                const isEnabled = Boolean(data.enabled);

                setState({ activeFestival, isEnabled, isLoading: false });

                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeFestival, enabled: isEnabled }));
                } catch {}
                return;
            }
        } catch {
            // Silently fall back to cached / default state — zero console errors
        }

        // Fallback to localStorage if API unavailable
        try {
            const cached = localStorage.getItem(STORAGE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                setState({
                    activeFestival: parsed.activeFestival ?? DEFAULT_CONFIG.activeFestival,
                    isEnabled: Boolean(parsed.enabled),
                    isLoading: false,
                });
                return;
            }
        } catch {}

        setState(prev => ({ ...prev, isLoading: false }));
    }, []);

    useEffect(() => {
        setIsMounted(true);

        // Immediate hydrate from local cache on mount
        try {
            const cached = localStorage.getItem(STORAGE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                setState({
                    activeFestival: parsed.activeFestival ?? DEFAULT_CONFIG.activeFestival,
                    isEnabled: Boolean(parsed.enabled),
                    isLoading: false,
                });
            }
        } catch {}

        syncTheme();

        const handleCustomChange = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail) {
                const activeFestival = detail.activeFestival ?? 'none';
                const isEnabled = Boolean(detail.enabled);
                setState({ activeFestival, isEnabled, isLoading: false });
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeFestival, enabled: isEnabled }));
                } catch {}
            } else {
                syncTheme();
            }
        };

        window.addEventListener('festive-theme-changed', handleCustomChange);
        const handleStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) syncTheme();
        };
        window.addEventListener('storage', handleStorage);

        return () => {
            window.removeEventListener('festive-theme-changed', handleCustomChange);
            window.removeEventListener('storage', handleStorage);
        };
    }, [syncTheme]);

    return {
        activeFestival: state.activeFestival,
        isEnabled: state.isEnabled,
        isFestiveActive: isMounted && state.isEnabled && state.activeFestival !== 'none',
        isMounted,
        isLoading: state.isLoading,
        refresh: syncTheme,
    };
}

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

const DEFAULT_CONFIG = {
    activeFestival: 'diwali',
    enabled: true,
};

function getApiEndpoint(): string {
    if (typeof window !== 'undefined') {
        const envUrl = process.env.NEXT_PUBLIC_API_URL;
        // If NEXT_PUBLIC_API_URL is a valid remote URL or relative path, use it; avoid hardcoded localhost in browser prod
        if (envUrl && !envUrl.startsWith('http://localhost') && !envUrl.startsWith('http://127.0.0.1')) {
            return `${envUrl.replace(/\/$/, '')}/festive-theme`;
        }
        return '/api/festive-theme';
    }
    const backend = process.env.BACKEND_URL || 'http://127.0.0.1:5000';
    return `${backend.replace(/\/$/, '')}/api/festive-theme`;
}

interface SharedState {
    activeFestival: string;
    isEnabled: boolean;
    isLoading: boolean;
    hasFetched: boolean;
}

// Module-level reactive singleton store shared across PreLoader, DiwaliDecoration, and Admin
let sharedState: SharedState = {
    activeFestival: DEFAULT_CONFIG.activeFestival,
    isEnabled: DEFAULT_CONFIG.enabled,
    isLoading: true,
    hasFetched: false,
};

const listeners = new Set<(state: SharedState) => void>();

function notifyListeners() {
    listeners.forEach(fn => {
        try {
            fn({ ...sharedState });
        } catch {}
    });
}

function updateSharedState(partial: Partial<SharedState>, saveToStorage = true) {
    sharedState = { ...sharedState, ...partial };
    if (saveToStorage && typeof window !== 'undefined') {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    activeFestival: sharedState.activeFestival,
                    enabled: sharedState.isEnabled,
                    updatedAt: Date.now(),
                })
            );
        } catch {}
    }
    notifyListeners();
}

let activeFetchPromise: Promise<void> | null = null;

async function fetchLiveTheme(): Promise<void> {
    if (typeof window === 'undefined') return;

    if (activeFetchPromise) {
        return activeFetchPromise;
    }

    activeFetchPromise = (async () => {
        try {
            const endpoint = getApiEndpoint();
            const res = await fetch(`${endpoint}?_t=${Date.now()}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                },
                cache: 'no-store',
            });

            if (res.ok) {
                const data = await res.json();
                const activeFestival = data.activeFestival ?? 'none';
                const isEnabled = Boolean(data.enabled);

                updateSharedState({
                    activeFestival,
                    isEnabled,
                    isLoading: false,
                    hasFetched: true,
                });
                return;
            }
        } catch (err) {
            // Silently fall back to cached / default state on network glitch
        } finally {
            activeFetchPromise = null;
        }

        updateSharedState({ isLoading: false, hasFetched: true });
    })();

    return activeFetchPromise;
}

export function useFestiveTheme(): FestiveThemeState {
    const [isMounted, setIsMounted] = useState(false);
    const [localState, setLocalState] = useState<SharedState>(sharedState);

    useEffect(() => {
        setIsMounted(true);

        // 1. Initial hydration from localStorage if not yet fetched
        if (!sharedState.hasFetched) {
            try {
                const cached = localStorage.getItem(STORAGE_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    updateSharedState(
                        {
                            activeFestival: parsed.activeFestival ?? DEFAULT_CONFIG.activeFestival,
                            isEnabled: Boolean(parsed.enabled),
                        },
                        false
                    );
                }
            } catch {}
        }

        // 2. Subscribe to reactive singleton updates
        const listener = (nextState: SharedState) => {
            setLocalState(nextState);
        };
        listeners.add(listener);
        setLocalState({ ...sharedState });

        // 3. Immediately trigger fresh live sync from database
        fetchLiveTheme();

        // 4. Cross-tab & intra-window real-time event listeners
        const handleCustomEvent = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail) {
                const activeFestival = detail.activeFestival ?? 'none';
                const isEnabled = Boolean(detail.enabled);
                updateSharedState({ activeFestival, isEnabled, isLoading: false, hasFetched: true });
            } else {
                fetchLiveTheme();
            }
        };

        const handleStorageEvent = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                try {
                    if (e.newValue) {
                        const parsed = JSON.parse(e.newValue);
                        updateSharedState({
                            activeFestival: parsed.activeFestival ?? DEFAULT_CONFIG.activeFestival,
                            isEnabled: Boolean(parsed.enabled),
                            isLoading: false,
                        });
                    }
                } catch {
                    fetchLiveTheme();
                }
            }
        };

        window.addEventListener('festive-theme-changed', handleCustomEvent);
        window.addEventListener('storage', handleStorageEvent);

        return () => {
            listeners.delete(listener);
            window.removeEventListener('festive-theme-changed', handleCustomEvent);
            window.removeEventListener('storage', handleStorageEvent);
        };
    }, []);

    const isFestiveActive = isMounted && localState.isEnabled && localState.activeFestival !== 'none';

    return {
        activeFestival: localState.activeFestival,
        isEnabled: localState.isEnabled,
        isFestiveActive,
        isMounted,
        isLoading: localState.isLoading,
        refresh: fetchLiveTheme,
    };
}

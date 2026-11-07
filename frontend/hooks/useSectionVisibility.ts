'use client';

import { useState, useEffect, useCallback } from 'react';

export type SectionId =
    | 'hero'
    | 'skills'
    | 'experience'
    | 'education'
    | 'certifications'
    | 'projects'
    | 'testimonials'
    | 'blog'
    | 'terminal'
    | 'contact';

export const SECTION_ORDER: SectionId[] = [
    'hero',
    'skills',
    'experience',
    'education',
    'certifications',
    'projects',
    'testimonials',
    'blog',
    'terminal',
    'contact',
];

export const DEFAULT_SECTION_VISIBILITY: Record<SectionId, boolean> = {
    hero: true,
    skills: true,
    experience: true,
    education: true,
    certifications: true,
    projects: true,
    testimonials: true,
    blog: true,
    terminal: true,
    contact: true,
};

const STORAGE_KEY = 'portfolio_section_visibility';
const EVENT_NAME = 'section-visibility-changed';

function getApiEndpoint(): string {
    if (typeof window !== 'undefined') {
        const envUrl = process.env.NEXT_PUBLIC_API_URL;
        if (envUrl && !envUrl.startsWith('http://localhost') && !envUrl.startsWith('http://127.0.0.1')) {
            return `${envUrl.replace(/\/$/, '')}/section-visibility`;
        }
        return '/api/section-visibility';
    }
    const backend = process.env.BACKEND_URL || 'http://127.0.0.1:5000';
    return `${backend.replace(/\/$/, '')}/api/section-visibility`;
}

interface SharedVisibilityState {
    visibility: Record<string, boolean>;
    isLoading: boolean;
    hasFetched: boolean;
}

// Module-level reactive singleton store
let sharedState: SharedVisibilityState = {
    visibility: { ...DEFAULT_SECTION_VISIBILITY },
    isLoading: true,
    hasFetched: false,
};

const listeners = new Set<(state: SharedVisibilityState) => void>();

function notifyListeners() {
    listeners.forEach((fn) => {
        try {
            fn({ ...sharedState, visibility: { ...sharedState.visibility } });
        } catch {}
    });
}

export function updateSharedVisibility(
    newVisibility: Record<string, boolean>,
    saveToStorage = true,
    broadcast = true
) {
    const merged: Record<string, boolean> = {
        ...DEFAULT_SECTION_VISIBILITY,
        ...sharedState.visibility,
        ...newVisibility,
    };
    sharedState = {
        ...sharedState,
        visibility: merged,
        isLoading: false,
        hasFetched: true,
    };

    if (saveToStorage && typeof window !== 'undefined') {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    visibility: merged,
                    updatedAt: Date.now(),
                })
            );
        } catch {}
    }

    notifyListeners();

    if (broadcast && typeof window !== 'undefined') {
        try {
            window.dispatchEvent(
                new CustomEvent(EVENT_NAME, {
                    detail: { visibility: merged },
                })
            );
        } catch {}
    }
}

let activeFetchPromise: Promise<void> | null = null;

async function fetchLiveVisibility(): Promise<void> {
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
                    Accept: 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    Pragma: 'no-cache',
                },
                cache: 'no-store',
            });

            if (res.ok) {
                const data = await res.json();
                if (data && typeof data.visibility === 'object' && data.visibility !== null) {
                    updateSharedVisibility(data.visibility, true, false);
                    return;
                }
            }
        } catch {
            // Keep current/cached state if network fails
        } finally {
            sharedState.isLoading = false;
            sharedState.hasFetched = true;
            notifyListeners();
            activeFetchPromise = null;
        }
    })();

    return activeFetchPromise;
}

export function useSectionVisibility() {
    const [state, setState] = useState<SharedVisibilityState>(() => ({
        visibility: { ...sharedState.visibility },
        isLoading: sharedState.isLoading,
        hasFetched: sharedState.hasFetched,
    }));
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        // 1. Hydrate from localStorage immediately to eliminate flicker
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && typeof parsed.visibility === 'object' && parsed.visibility !== null) {
                    updateSharedVisibility(parsed.visibility, false, false);
                }
            }
        } catch {}

        // 2. Subscribe to singleton state updates
        const listener = (next: SharedVisibilityState) => {
            setState({
                visibility: { ...next.visibility },
                isLoading: next.isLoading,
                hasFetched: next.hasFetched,
            });
        };
        listeners.add(listener);

        // 3. Listen to cross-tab / cross-component storage and custom events
        const handleCustomEvent = (event: Event) => {
            const ce = event as CustomEvent;
            if (ce.detail && ce.detail.visibility) {
                updateSharedVisibility(ce.detail.visibility, false, false);
            }
        };

        const handleStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                try {
                    const parsed = JSON.parse(e.newValue);
                    if (parsed && parsed.visibility) {
                        updateSharedVisibility(parsed.visibility, false, false);
                    }
                } catch {}
            }
        };

        window.addEventListener(EVENT_NAME, handleCustomEvent);
        window.addEventListener('storage', handleStorage);

        // 4. Always fetch live state from DB in background
        fetchLiveVisibility();

        return () => {
            listeners.delete(listener);
            window.removeEventListener(EVENT_NAME, handleCustomEvent);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    const isSectionVisible = useCallback(
        (id: string): boolean => {
            // If mounted and section explicitly disabled (false), return false
            if (state.visibility[id] !== undefined) {
                return Boolean(state.visibility[id]);
            }
            // Unknown or default section is visible
            return true;
        },
        [state.visibility]
    );

    const refresh = useCallback(async () => {
        sharedState.isLoading = true;
        notifyListeners();
        await fetchLiveVisibility();
    }, []);

    const updateLocalVisibility = useCallback((newVis: Record<string, boolean>) => {
        updateSharedVisibility(newVis, true, true);
    }, []);

    return {
        visibility: state.visibility,
        isSectionVisible,
        isMounted,
        isLoading: state.isLoading,
        refresh,
        updateLocalVisibility,
    };
}


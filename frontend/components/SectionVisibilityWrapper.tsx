'use client';

import React from 'react';
import { useSectionVisibility } from '@/hooks/useSectionVisibility';

interface SectionVisibilityWrapperProps {
    sectionId: string;
    children: React.ReactNode;
}

export default function SectionVisibilityWrapper({ sectionId, children }: SectionVisibilityWrapperProps) {
    const { isSectionVisible, isMounted } = useSectionVisibility();

    // SSR-safe guard: allows initial HTML to hydrate without React mismatch error,
    // then cleanly unmounts the section if disabled in admin settings.
    if (isMounted && !isSectionVisible(sectionId)) {
        return null;
    }

    return <>{children}</>;
}


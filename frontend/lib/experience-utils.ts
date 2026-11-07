export const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const

export type MonthName = typeof MONTHS[number]

export const CURRENT_YEAR = new Date().getFullYear()

// Generate years from 25 years ago to 10 years ahead
export const YEARS = Array.from({ length: 36 }, (_, i) => String(CURRENT_YEAR - 25 + i))

/**
 * Robustly determines if an experience entry represents an active / current role.
 * A role is ONLY active if it explicitly says 'Present' / 'Current' / 'Now' OR
 * if it doesn't have an explicit past end-date range and has an active badge.
 *
 * If a role has an explicit end month/year (e.g. "May 2025 – Oct 2026"), it is strictly
 * classified as a completed past role, never active.
 */
export function isRoleActive(period?: string, badge?: string): boolean {
    const p = (period || '').trim().toLowerCase()
    if (!p) {
        return Boolean(badge && /\b(current|active)\b/i.test(badge))
    }

    // Direct match for present / current / ongoing keywords
    if (/\b(present|current|now|ongoing)\b/i.test(p)) {
        return true
    }

    // Check if period has an end part separated by - or – or — or "to"
    const separatorMatch = p.match(/\s*(?:[-–—]|(?:\bto\b))\s*/)
    if (separatorMatch && separatorMatch.index !== undefined) {
        const endPart = p.slice(separatorMatch.index + separatorMatch[0].length).trim()
        if (/\b(present|current|now|ongoing)\b/i.test(endPart)) {
            return true
        }
        // If end part contains a year (e.g. 2026, 2025) or month name, it's an explicit closed end date
        if (/\b(19\d\d|20\d\d)\b/.test(endPart) || MONTHS.some(m => new RegExp(`\\b${m}\\b`, 'i').test(endPart))) {
            return false
        }
    }

    // Fallback: check badge only if no explicit closed date range was found
    if (badge && /\b(current|active)\b/i.test(badge)) {
        return true
    }

    return false
}

/**
 * Parses a period string like "May 2025 – Oct 2026" or "May 2024 – Present" into constituent parts.
 */
export function parsePeriod(periodStr = '') {
    const isPresent = isRoleActive(periodStr)
    const normalized = periodStr.replace(/,/g, ' ').replace(/\s+/g, ' ').trim()
    
    // Split by separator (-, –, —, "to")
    const parts = normalized.split(/\s*(?:[-–—]|(?:\bto\b))\s*/)
    const startPart = (parts[0] || '').trim()
    const endPart = (parts[1] || '').trim()

    let startMonth: MonthName = 'Jan'
    let startYear = String(CURRENT_YEAR - 1)
    let endMonth: MonthName = MONTHS[new Date().getMonth()]
    let endYear = String(CURRENT_YEAR)

    // Detect start month
    for (const m of MONTHS) {
        if (new RegExp(`\\b${m}`, 'i').test(startPart)) {
            startMonth = m
            break
        }
    }
    // Detect start year
    const startYearMatch = startPart.match(/\b(19\d\d|20\d\d)\b/)
    if (startYearMatch) {
        startYear = startYearMatch[1]
    }

    if (!isPresent && endPart) {
        // Detect end month
        for (const m of MONTHS) {
            if (new RegExp(`\\b${m}`, 'i').test(endPart)) {
                endMonth = m
                break
            }
        }
        // Detect end year
        const endYearMatch = endPart.match(/\b(19\d\d|20\d\d)\b/)
        if (endYearMatch) {
            endYear = endYearMatch[1]
        }
    } else {
        const now = new Date()
        endMonth = MONTHS[now.getMonth()]
        endYear = String(now.getFullYear())
    }

    return { startMonth, startYear, endMonth, endYear, isPresent }
}

/**
 * Calculates duration in inclusive months between start date and end date (or current date if isPresent).
 * Returns LinkedIn-style formatting: "1 year 6 months", "1 year", "6 months", etc.
 */
export function calculateDuration(
    startMonth: string,
    startYear: string,
    endMonth: string,
    endYear: string,
    isPresent: boolean
): string {
    const sMonthIdx = MONTHS.indexOf(startMonth as MonthName)
    const sYearNum = parseInt(startYear, 10)
    if (sMonthIdx === -1 || isNaN(sYearNum)) return ''

    let eMonthIdx: number
    let eYearNum: number

    if (isPresent) {
        const now = new Date()
        eMonthIdx = now.getMonth()
        eYearNum = now.getFullYear()
    } else {
        eMonthIdx = MONTHS.indexOf(endMonth as MonthName)
        eYearNum = parseInt(endYear, 10)
        if (eMonthIdx === -1 || isNaN(eYearNum)) return ''
    }

    // Inclusive calculation: e.g. May 2025 to Oct 2026 is (2026-2025)*12 + (9-4) + 1 = 18 months
    const totalMonths = (eYearNum - sYearNum) * 12 + (eMonthIdx - sMonthIdx) + 1
    if (totalMonths <= 0) {
        return '1 month'
    }

    const years = Math.floor(totalMonths / 12)
    const months = totalMonths % 12

    const parts: string[] = []
    if (years > 0) {
        parts.push(`${years} ${years === 1 ? 'year' : 'years'}`)
    }
    if (months > 0) {
        parts.push(`${months} ${months === 1 ? 'month' : 'months'}`)
    }

    return parts.join(' ') || '1 month'
}


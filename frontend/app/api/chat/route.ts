import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Next.js Chat API Proxy
 * Forwards requests to the centralized Flask Backend AI Engine (Zentara).
 * Zero duplicate database fetches, centralized rate-limiting and secrets management.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const flaskBase = (
            process.env.FLASK_API_URL ||
            (process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api` : null) ||
            'http://127.0.0.1:5000/api'
        ).replace(/\/$/, '');

        const response = await fetch(`${flaskBase}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (err: unknown) {
        return NextResponse.json(
            {
                response:
                    "Satya's AI assistant is temporarily synchronizing. Feel free to explore his projects and tech stack on this page, or reach out directly!",
                fallback: true,
                suggestions: ["Explore Projects", "Check Skills", "Contact Satya"],
            },
            { status: 200 }
        );
    }
}

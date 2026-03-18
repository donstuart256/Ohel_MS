import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json([
        { id: 1, month: '2026-03-01', processed_at: '2026-03-02T10:30:00Z', processed_by: 1 },
        { id: 2, month: '2026-02-01', processed_at: '2026-02-02T09:15:00Z', processed_by: 1 },
        { id: 3, month: '2026-01-01', processed_at: '2026-01-03T08:00:00Z', processed_by: 1 },
    ])
}

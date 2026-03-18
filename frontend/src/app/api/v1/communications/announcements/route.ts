import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json([
        { id: 1, title: 'Term 1 2026 Begins', content: 'Classes commence on Monday 10th March.', target_roles: ['ALL'], is_published: true, created_at: '2026-03-10T08:00:00Z', author_name: 'School Admin' },
        { id: 2, title: 'Maintenance Window', content: 'Portal offline Saturday night for database upgrades.', target_roles: ['ADMIN'], is_published: true, created_at: '2026-03-17T12:00:00Z', author_name: 'IT Admin' },
        { id: 3, title: 'Sports Day Postponed', content: 'Sports Day moved to 28th March due to weather.', target_roles: ['ALL'], is_published: true, created_at: '2026-03-18T09:00:00Z', author_name: 'School Admin' },
    ])
}

export async function POST() {
    return NextResponse.json({ id: 4, title: 'New Announcement' }, { status: 201 })
}

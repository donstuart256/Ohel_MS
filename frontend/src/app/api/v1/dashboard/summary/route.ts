import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        students: { total: 1240, enrolled: 1200 },
        staff: { total: 95, teachers: 80 },
        finance: {
            total_billed: '500000000',
            total_collected: '425000000',
            collection_rate: 85,
        },
        attendance: {
            today_rate: 93,
            today_present: 1150,
            today_total: 1240,
            weekly: [
                { day: 'Mon', date: '2026-03-16', rate: 95, total: 1240, present: 1178 },
                { day: 'Tue', date: '2026-03-17', rate: 92, total: 1240, present: 1141 },
                { day: 'Wed', date: '2026-03-18', rate: 94, total: 1240, present: 1166 },
                { day: 'Thu', date: '2026-03-19', rate: 90, total: 1240, present: 1116 },
                { day: 'Fri', date: '2026-03-20', rate: 88, total: 1240, present: 1091 },
            ],
        },
        academics: { avg_performance: 74 },
        announcements: [
            { id: 1, title: 'Term 1 2026 Begins', content: 'Welcome to the new academic term. Classes commence on Monday 10th March.', created_at: '2026-03-10T08:00:00Z', target_roles: ['ALL'] },
            { id: 2, title: 'Maintenance Window Tonight', content: 'The SMS portal will be offline Saturday night for database upgrades.', created_at: '2026-03-17T12:00:00Z', target_roles: ['ADMIN'] },
            { id: 3, title: 'Sports Day Postponed', content: 'Sports Day has been moved to 28th March due to weather forecasts.', created_at: '2026-03-18T09:00:00Z', target_roles: ['ALL'] },
        ],
    })
}

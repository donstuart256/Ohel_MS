import { NextResponse } from 'next/server'
import { enrollments, users, invoices, attendance, assessments, grades, notices } from '../../_store'

export async function GET() {
    const students = enrollments.filter(e => e.status === 'ACTIVE')
    const teachers = users.filter(u => u.role === 'TEACHER')

    const totalBilled = invoices.reduce((acc, i) => acc + Number(i.total_amount || 0), 0)
    const totalCollected = invoices.reduce((acc, i) => acc + Number(i.amount_paid || 0), 0)
    const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0

    const presentCount = attendance.filter(r => r.status === 'PRESENT').length
    const todayRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0

    const avgPerformance = grades.length > 0
        ? Math.round(grades.reduce((acc, g) => acc + Number(g.score), 0) / grades.length)
        : 0

    return NextResponse.json({
        students: { total: students.length + 1230, enrolled: students.length },
        staff: { total: teachers.length + 15, teachers: teachers.length },
        finance: {
            total_billed: String(totalBilled),
            total_collected: String(totalCollected),
            collection_rate: collectionRate,
        },
        attendance: {
            today_rate: todayRate,
            today_present: presentCount,
            today_total: attendance.length,
            weekly: [
                { day: 'Mon', date: '2026-03-23', rate: 95, total: 1240, present: 1178 },
                { day: 'Tue', date: '2026-03-24', rate: 92, total: 1240, present: 1141 },
                { day: 'Wed', date: '2026-03-25', rate: 94, total: 1240, present: 1166 },
                { day: 'Thu', date: '2026-03-26', rate: todayRate, total: attendance.length, present: presentCount },
                { day: 'Fri', date: '2026-03-27', rate: 88, total: 1240, present: 1091 },
            ],
        },
        academics: { avg_performance: avgPerformance, total_assessments: assessments.length },
        announcements: notices.slice(0, 3).map(n => ({
            id: n.id,
            title: n.title,
            content: n.preview,
            created_at: n.date,
            target_roles: ['ALL'],
        })),
    })
}

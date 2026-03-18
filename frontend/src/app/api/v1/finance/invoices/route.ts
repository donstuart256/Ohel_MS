import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json([
        { id: 1, student: 1, student_name: 'Jordan Smith', fee_structure: 1, total_amount: '2500000', amount_paid: '2500000', balance: '0', status: 'PAID', due_date: '2026-02-28', created_at: '2026-01-10T08:00:00Z', payments: [] },
        { id: 2, student: 2, student_name: 'Sarah Jenkins', fee_structure: 1, total_amount: '2500000', amount_paid: '0', balance: '2500000', status: 'UNPAID', due_date: '2026-02-28', created_at: '2026-01-10T08:00:00Z', payments: [] },
        { id: 3, student: 3, student_name: 'Maria Garcia', fee_structure: 1, total_amount: '2500000', amount_paid: '1200000', balance: '1300000', status: 'PARTIAL', due_date: '2026-02-28', created_at: '2026-01-10T08:00:00Z', payments: [] },
        { id: 4, student: 4, student_name: 'Donald J. Tom', fee_structure: 1, total_amount: '2500000', amount_paid: '0', balance: '2500000', status: 'UNPAID', due_date: '2026-02-28', created_at: '2026-01-10T08:00:00Z', payments: [] },
        { id: 5, student: 5, student_name: 'Anna Baker', fee_structure: 1, total_amount: '2500000', amount_paid: '2500000', balance: '0', status: 'PAID', due_date: '2026-02-28', created_at: '2026-01-10T08:00:00Z', payments: [] },
    ])
}

export async function POST() {
    return NextResponse.json({ id: 6, status: 'UNPAID' }, { status: 201 })
}

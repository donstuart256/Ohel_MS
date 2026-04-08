import { NextRequest, NextResponse } from 'next/server'
import { invoices, nextId } from '../../_store'

export async function GET() {
    return NextResponse.json({ results: invoices })
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    const newInvoice = {
        id: nextId('invoices'),
        student: body.student || 0,
        student_name: body.student_name || 'Unknown',
        fee_structure: body.fee_structure || 1,
        total_amount: body.total_amount || '0',
        amount_paid: body.amount_paid || '0',
        balance: body.balance || body.total_amount || '0',
        status: body.status || 'UNPAID',
        due_date: body.due_date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
    }
    invoices.unshift(newInvoice)
    return NextResponse.json(newInvoice, { status: 201 })
}

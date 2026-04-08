import { NextRequest, NextResponse } from 'next/server'
import { invoices, payments, nextId } from '../../../../_store'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const body = await request.json()
    const idx = invoices.findIndex((inv: { id: number }) => inv.id === Number(id))
    if (idx === -1) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    const invoice = invoices[idx]
    const amount = Number(body.amount) || 0
    if (amount <= 0) return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 })

    const newPaid = Number(invoice.amount_paid) + amount
    const total = Number(invoice.total_amount)
    const newBalance = Math.max(0, total - newPaid)
    const newStatus = newPaid >= total ? 'PAID' : 'PARTIAL'

    invoices[idx] = {
        ...invoice,
        amount_paid: String(newPaid),
        balance: String(newBalance),
        status: newStatus,
    }

    const payment = {
        id: nextId('payments'),
        invoice_id: Number(id),
        student_name: invoice.student_name,
        amount: String(amount),
        method: body.method || 'CASH',
        reference: body.reference || '',
        date: new Date().toISOString(),
    }
    payments.push(payment)

    return NextResponse.json({ invoice: invoices[idx], payment }, { status: 200 })
}

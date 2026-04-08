import { NextRequest, NextResponse } from 'next/server'
import { invoices } from '../../../_store'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const body = await request.json()
    const idx = invoices.findIndex(inv => inv.id === Number(id))
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    invoices[idx] = { ...invoices[idx], ...body }
    return NextResponse.json(invoices[idx])
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const idx = invoices.findIndex(inv => inv.id === Number(id))
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    invoices.splice(idx, 1)
    return new NextResponse(null, { status: 204 })
}

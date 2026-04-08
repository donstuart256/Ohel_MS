import { NextRequest, NextResponse } from 'next/server'
import { subjects } from '../../../_store'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const body = await request.json()
    const idx = subjects.findIndex(s => s.id === Number(id))
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    subjects[idx] = { ...subjects[idx], ...body }
    return NextResponse.json(subjects[idx])
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const idx = subjects.findIndex(s => s.id === Number(id))
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    subjects.splice(idx, 1)
    return new NextResponse(null, { status: 204 })
}

import { NextRequest, NextResponse } from 'next/server'
import { sections } from '../../../_store'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const body = await request.json()
    const idx = sections.findIndex(s => s.id === Number(id))
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    sections[idx] = { ...sections[idx], ...body }
    return NextResponse.json(sections[idx])
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const idx = sections.findIndex(s => s.id === Number(id))
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    sections.splice(idx, 1)
    return new NextResponse(null, { status: 204 })
}

import { NextRequest, NextResponse } from 'next/server'
import { enrollments } from '../../../_store'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const body = await request.json()
    const idx = enrollments.findIndex(e => e.id === Number(id))
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    enrollments[idx] = { ...enrollments[idx], ...body }
    return NextResponse.json(enrollments[idx])
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const idx = enrollments.findIndex(e => e.id === Number(id))
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    enrollments.splice(idx, 1)
    return new NextResponse(null, { status: 204 })
}

import { NextRequest, NextResponse } from 'next/server'
import { books } from '../../../_store'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const body = await request.json()
    const idx = books.findIndex(b => b.id === Number(id))
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    books[idx] = { ...books[idx], ...body }
    return NextResponse.json(books[idx])
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const idx = books.findIndex(b => b.id === Number(id))
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    books.splice(idx, 1)
    return new NextResponse(null, { status: 204 })
}

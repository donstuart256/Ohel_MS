import { NextRequest, NextResponse } from 'next/server'
import { timetable } from '../../../_store'

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const idx = timetable.findIndex(s => s.id === Number(id))
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    timetable.splice(idx, 1)
    return new NextResponse(null, { status: 204 })
}

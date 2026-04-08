import { NextRequest, NextResponse } from 'next/server'
import { sections, nextId } from '../../_store'

export async function GET() {
    return NextResponse.json({ results: sections })
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    const newSection = {
        id: nextId('sections'),
        name: body.name || 'New Class',
        level: body.level || 'PRIMARY',
        class_teacher: body.class_teacher || '',
        capacity: Number(body.capacity) || 40,
        enrolled: Number(body.enrolled) || 0,
    }
    sections.push(newSection)
    return NextResponse.json(newSection, { status: 201 })
}

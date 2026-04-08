import { NextRequest, NextResponse } from 'next/server'
import { subjects, nextId } from '../../_store'

export async function GET() {
    return NextResponse.json({ results: subjects })
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    const newSubject = {
        id: nextId('subjects'),
        name: body.name || 'Untitled Subject',
        code: body.code || '',
        category: body.category || 'CORE',
        description: body.description || '',
    }
    subjects.push(newSubject)
    return NextResponse.json(newSubject, { status: 201 })
}

import { NextRequest, NextResponse } from 'next/server'
import { assessments, nextId } from '../../_store'

export async function GET() {
    return NextResponse.json({ results: assessments })
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    const newAssessment = {
        id: nextId('assessments'),
        title: body.title || 'Untitled Assessment',
        subject: body.subject || 0,
        subject_name: body.subject_name || '',
        section: body.section || 0,
        section_name: body.section_name || '',
        type: body.type || 'QUIZ',
        date: body.date || new Date().toISOString().split('T')[0],
        max_score: Number(body.max_score) || 100,
    }
    assessments.unshift(newAssessment)
    return NextResponse.json(newAssessment, { status: 201 })
}

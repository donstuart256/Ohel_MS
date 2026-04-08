import { NextRequest, NextResponse } from 'next/server'
import { grades, nextId } from '../../_store'

export async function GET() {
    return NextResponse.json({ results: grades })
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    // Support bulk grade submission (array of grades)
    if (Array.isArray(body)) {
        const newGrades = body.map((g: any) => ({
            id: nextId('grades'),
            student: g.student || 0,
            student_name: g.student_name || 'Unknown',
            assessment: g.assessment || 0,
            assessment_title: g.assessment_title || '',
            score: String(g.score || 0),
        }))
        grades.unshift(...newGrades)
        return NextResponse.json(newGrades, { status: 201 })
    }
    
    const newGrade = {
        id: nextId('grades'),
        student: body.student || 0,
        student_name: body.student_name || 'Unknown',
        assessment: body.assessment || 0,
        assessment_title: body.assessment_title || '',
        score: String(body.score || 0),
    }
    grades.unshift(newGrade)
    return NextResponse.json(newGrade, { status: 201 })
}

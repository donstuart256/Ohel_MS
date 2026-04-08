import { NextRequest, NextResponse } from 'next/server'
import { enrollments, nextId } from '../../_store'

export async function GET() {
    return NextResponse.json(enrollments)
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    const newEnrollment = {
        id: nextId('enrollments'),
        student: body.student || nextId('students'),
        student_name: body.student_name || `${body.first_name || ''} ${body.last_name || ''}`.trim(),
        section_name: body.section_name || 'P.7 Blue',
        section: body.section || body.section_id || 1,
        academic_year: body.academic_year || body.academic_year_id || 1,
        academic_year_name: body.academic_year_name || '2026',
        status: body.status || 'ACTIVE',
    }
    enrollments.unshift(newEnrollment)
    return NextResponse.json(newEnrollment, { status: 201 })
}

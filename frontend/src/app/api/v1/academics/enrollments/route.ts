import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json([
        { id: 1, student: 1, student_name: 'Jordan Smith', section_name: 'P.6 Blue', academic_year_name: '2026', status: 'ACTIVE' },
        { id: 2, student: 2, student_name: 'Sarah Jenkins', section_name: 'S.2 West', academic_year_name: '2026', status: 'ACTIVE' },
        { id: 3, student: 3, student_name: 'Maria Garcia', section_name: 'Year 1 CS', academic_year_name: '2026', status: 'PENDING' },
        { id: 4, student: 4, student_name: 'Donald J. Tom', section_name: 'P.1 Green', academic_year_name: '2026', status: 'ACTIVE' },
        { id: 5, student: 5, student_name: 'Anna Baker', section_name: 'S.6 PCM', academic_year_name: '2026', status: 'ACTIVE' },
        { id: 6, student: 6, student_name: 'Isaac Kato', section_name: 'S.4 East', academic_year_name: '2026', status: 'ACTIVE' },
        { id: 7, student: 7, student_name: 'Namuli Sharon', section_name: 'S.1 South', academic_year_name: '2026', status: 'ACTIVE' },
    ])
}

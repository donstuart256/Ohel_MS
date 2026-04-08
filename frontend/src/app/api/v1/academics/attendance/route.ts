import { NextRequest, NextResponse } from 'next/server'
import { attendance, nextId } from '../../_store'

export async function GET() {
    return NextResponse.json({ results: attendance })
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    // Support bulk attendance marking (array of records)
    if (Array.isArray(body)) {
        const newRecords = body.map((r: any) => ({
            id: nextId('attendance'),
            student: r.student || 0,
            student_name: r.student_name || 'Unknown',
            section: r.section || 1,
            section_name: r.section_name || 'P.7 Blue',
            date: r.date || new Date().toISOString().split('T')[0],
            status: r.status || 'PRESENT',
            marked_by: r.marked_by || 1,
            remarks: r.remarks || '',
        }))
        attendance.unshift(...newRecords)
        return NextResponse.json(newRecords, { status: 201 })
    }

    const newRecord = {
        id: nextId('attendance'),
        student: body.student || 0,
        student_name: body.student_name || 'Unknown',
        section: body.section || 1,
        section_name: body.section_name || 'P.7 Blue',
        date: body.date || new Date().toISOString().split('T')[0],
        status: body.status || 'PRESENT',
        marked_by: body.marked_by || 1,
        remarks: body.remarks || '',
    }
    attendance.unshift(newRecord)
    return NextResponse.json(newRecord, { status: 201 })
}

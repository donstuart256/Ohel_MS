import { NextRequest, NextResponse } from 'next/server'
import { timetable, nextId } from '../../_store'

export async function GET() {
    return NextResponse.json({ results: timetable })
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    
    // Conflict check: same section + day + overlapping time
    const conflict = timetable.find(s =>
        s.section === (body.section || 1) &&
        s.day === body.day &&
        s.start_time === body.start_time
    )
    if (conflict) {
        return NextResponse.json(
            { error: `Time conflict: ${conflict.subject_name} is already scheduled for ${conflict.day} at ${conflict.start_time}` },
            { status: 409 }
        )
    }

    const newSlot = {
        id: nextId('timetable'),
        section: body.section || 1,
        section_name: body.section_name || 'P.7 Blue',
        subject: body.subject || 0,
        subject_name: body.subject_name || '',
        teacher: body.teacher || 0,
        teacher_name: body.teacher_name || '',
        day: body.day || 'MON',
        start_time: body.start_time || '08:00:00',
        end_time: body.end_time || '08:40:00',
    }
    timetable.push(newSlot)
    return NextResponse.json(newSlot, { status: 201 })
}

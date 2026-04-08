import { NextRequest, NextResponse } from 'next/server'
import { messages, nextId } from '../../_store'

export async function GET() {
    return NextResponse.json({ results: messages })
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    const newMessage = {
        id: nextId('messages'),
        from: body.from || 1,
        from_name: body.from_name || 'System Administrator',
        to: body.to || 0,
        to_name: body.to_name || 'Unknown',
        subject: body.subject || 'No Subject',
        body: body.body || '',
        read: false,
        created_at: new Date().toISOString(),
    }
    messages.unshift(newMessage)
    return NextResponse.json(newMessage, { status: 201 })
}

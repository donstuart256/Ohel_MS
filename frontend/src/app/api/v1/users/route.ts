import { NextRequest, NextResponse } from 'next/server'
import { users, nextId } from '../_store'

export async function GET() {
    return NextResponse.json({ results: users })
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    const newUser = {
        id: nextId('users'),
        username: body.username || `${body.first_name?.toLowerCase()}.${body.last_name?.toLowerCase()}`,
        first_name: body.first_name || '',
        last_name: body.last_name || '',
        email: body.email || '',
        role: body.role || 'STUDENT',
        phone_number: body.phone_number || '',
    }
    users.push(newUser)
    return NextResponse.json(newUser, { status: 201 })
}

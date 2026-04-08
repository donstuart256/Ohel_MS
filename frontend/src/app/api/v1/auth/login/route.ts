import { NextRequest, NextResponse } from 'next/server'

// Demo login — accepts any credentials, returns JWT tokens directly for demo mode
export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => ({}))
    const { username, password } = body as any

    if (!username || !password) {
        return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    // Accept any credentials for demo — in production this hits Django backend
    return NextResponse.json({
        access: 'demo_access_token_' + Date.now(),
        refresh: 'demo_refresh_token_' + Date.now(),
        user: {
            id: 1,
            username,
            first_name: 'System',
            last_name: 'Administrator',
            role: 'ADMIN',
            email: username.includes('@') ? username : `${username}@edupro.ug`,
        }
    })
}

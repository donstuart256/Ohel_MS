import { NextRequest, NextResponse } from 'next/server'

// Mock MFA verify — always succeeds with mock tokens
export async function POST(request: NextRequest) {
    return NextResponse.json({
        access: 'mock_access_token_xyz',
        refresh: 'mock_refresh_token_xyz',
    })
}

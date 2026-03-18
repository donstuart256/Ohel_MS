import { NextRequest, NextResponse } from 'next/server'

// Mock login — always returns mfa_required so the MFA flow can be tested
export async function POST(request: NextRequest) {
    return NextResponse.json({
        mfa_required: true,
        mfa_token: 'mock_signed_mfa_token_abc123',
        message: 'OTP sent to your registered device.',
    })
}

import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        results: [
            { id: 1, name: "St. Mary's Hostel", gender_served: 'GIRLS', warden_name: 'Sarah Nalwanga' },
            { id: 2, name: "St. Joseph's Hall", gender_served: 'BOYS', warden_name: 'Patrick Kiguli' },
            { id: 3, name: 'Unity Hostel', gender_served: 'MIXED', warden_name: 'Agnes Akampurira' },
        ]
    })
}

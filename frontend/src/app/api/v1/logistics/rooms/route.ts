import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        results: [
            { id: 1, hostel: 1, hostel_name: "St. Mary's Hostel", room_number: '01', capacity: 6, occupancy: 5, fee_per_term: '400000', is_full: false },
            { id: 2, hostel: 1, hostel_name: "St. Mary's Hostel", room_number: '02', capacity: 4, occupancy: 4, fee_per_term: '500000', is_full: true },
            { id: 3, hostel: 1, hostel_name: "St. Mary's Hostel", room_number: '03', capacity: 8, occupancy: 6, fee_per_term: '350000', is_full: false },
            { id: 4, hostel: 2, hostel_name: "St. Joseph's Hall", room_number: '01', capacity: 6, occupancy: 4, fee_per_term: '450000', is_full: false },
            { id: 5, hostel: 2, hostel_name: "St. Joseph's Hall", room_number: '02', capacity: 5, occupancy: 5, fee_per_term: '400000', is_full: true },
            { id: 6, hostel: 2, hostel_name: "St. Joseph's Hall", room_number: '03', capacity: 7, occupancy: 3, fee_per_term: '380000', is_full: false },
            { id: 7, hostel: 3, hostel_name: 'Unity Hostel', room_number: '01', capacity: 4, occupancy: 2, fee_per_term: '600000', is_full: false },
            { id: 8, hostel: 3, hostel_name: 'Unity Hostel', room_number: '02', capacity: 6, occupancy: 6, fee_per_term: '500000', is_full: true },
            { id: 9, hostel: 3, hostel_name: 'Unity Hostel', room_number: '03', capacity: 5, occupancy: 1, fee_per_term: '550000', is_full: false },
        ]
    })
}

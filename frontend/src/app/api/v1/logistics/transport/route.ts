import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        results: [
            {
                id: 1, name: 'Route A — Kampala North', vehicle_number: 'UAX 001A',
                driver_name: 'James Katongole', driver_phone: '+256770123456',
                monthly_fee: '250000',
                stops: [
                    { id: 1, stop_name: 'Main Gate (Route A)', pickup_time: '06:30:00' },
                    { id: 2, stop_name: 'Junction A (Route A)', pickup_time: '06:40:00' },
                    { id: 3, stop_name: 'Ntinda Market', pickup_time: '06:50:00' },
                    { id: 4, stop_name: 'Bukoto Trading Centre', pickup_time: '07:00:00' },
                    { id: 5, stop_name: 'Wandegeya Terminal', pickup_time: '07:10:00' },
                ]
            },
            {
                id: 2, name: 'Route B — Kampala East', vehicle_number: 'UAX 002B',
                driver_name: 'Peter Ssenyonga', driver_phone: '+256780654321',
                monthly_fee: '200000',
                stops: [
                    { id: 6, stop_name: 'Main Gate (Route B)', pickup_time: '06:30:00' },
                    { id: 7, stop_name: 'Kireka Junction', pickup_time: '06:40:00' },
                    { id: 8, stop_name: 'Bweyogerere Market', pickup_time: '06:50:00' },
                    { id: 9, stop_name: 'Namboole Stadium', pickup_time: '07:00:00' },
                    { id: 10, stop_name: 'Naalya Terminal', pickup_time: '07:10:00' },
                ]
            },
            {
                id: 3, name: 'Route C — Entebbe Road', vehicle_number: 'UAX 003C',
                driver_name: 'Moses Lubega', driver_phone: '+256750987654',
                monthly_fee: '300000',
                stops: [
                    { id: 11, stop_name: 'Main Gate (Route C)', pickup_time: '06:20:00' },
                    { id: 12, stop_name: 'Kajjansi Junction', pickup_time: '06:35:00' },
                    { id: 13, stop_name: 'Abayita Ababiri', pickup_time: '06:50:00' },
                    { id: 14, stop_name: 'Entebbe Town', pickup_time: '07:05:00' },
                ]
            },
            {
                id: 4, name: 'Route D — Mukono Direction', vehicle_number: 'UAX 004D',
                driver_name: 'Samuel Opio', driver_phone: '+256760111222',
                monthly_fee: '180000',
                stops: [
                    { id: 15, stop_name: 'Main Gate (Route D)', pickup_time: '06:30:00' },
                    { id: 16, stop_name: 'Seeta Junction', pickup_time: '06:45:00' },
                    { id: 17, stop_name: 'Mukono Town Centre', pickup_time: '07:00:00' },
                ]
            },
            {
                id: 5, name: 'Route E — Jinja Road', vehicle_number: 'UAX 005E',
                driver_name: 'Andrew Wasswa', driver_phone: '+256770555888',
                monthly_fee: '220000',
                stops: [
                    { id: 18, stop_name: 'Main Gate (Route E)', pickup_time: '06:30:00' },
                    { id: 19, stop_name: 'Lugogo Mall', pickup_time: '06:40:00' },
                    { id: 20, stop_name: 'Bugolobi Market', pickup_time: '06:50:00' },
                    { id: 21, stop_name: 'Luzira Trading Centre', pickup_time: '07:00:00' },
                    { id: 22, stop_name: 'Port Bell Terminal', pickup_time: '07:10:00' },
                ]
            },
        ]
    })
}

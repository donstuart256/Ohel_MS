import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json([
        { id: 1, title: 'Introduction to Physics', author: 'Dr. James Okot', isbn: '978-0-13-468599-1', quantity: 5, available_quantity: 3 },
        { id: 2, title: 'Modern Ugandan History', author: 'Prof. Sarah Namuli', isbn: '978-9970-02-543-2', quantity: 3, available_quantity: 0 },
        { id: 3, title: 'Advanced Calculus', author: 'Jane Doe', isbn: '978-0-07-128727-7', quantity: 8, available_quantity: 6 },
        { id: 4, title: 'Literature: The Pearl', author: 'John Steinbeck', isbn: '978-0-14-017737-1', quantity: 12, available_quantity: 10 },
        { id: 5, title: 'Chemistry for UCE', author: 'Mutebi & Ssekitoleko', isbn: null, quantity: 20, available_quantity: 15 },
    ])
}

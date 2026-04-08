import { NextRequest, NextResponse } from 'next/server'
import { books, nextId } from '../../_store'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.toLowerCase() || ''
    
    const filtered = search
        ? books.filter(b =>
            b.title.toLowerCase().includes(search) ||
            b.author.toLowerCase().includes(search) ||
            (b.isbn && b.isbn.toLowerCase().includes(search))
        )
        : books

    return NextResponse.json(filtered)
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    const newBook = {
        id: nextId('books'),
        title: body.title || 'Untitled',
        author: body.author || 'Unknown',
        isbn: body.isbn || '',
        publisher: body.publisher || '',
        published_year: Number(body.published_year) || new Date().getFullYear(),
        quantity: Number(body.quantity) || 1,
        available_quantity: Number(body.available_quantity ?? body.quantity) || 1,
    }
    books.unshift(newBook)
    return NextResponse.json(newBook, { status: 201 })
}

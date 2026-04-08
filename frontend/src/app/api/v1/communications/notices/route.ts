import { NextRequest, NextResponse } from 'next/server'
import { notices, nextId } from '../../_store'

export async function GET() {
    return NextResponse.json({ results: notices })
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    const newNotice = {
        id: nextId('notices'),
        title: body.title || 'Untitled Notice',
        author: body.author || 'System Administrator',
        date: body.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        preview: (body.content || body.preview || '').substring(0, 120) + '...',
        fullText: body.content || body.fullText || '',
        tags: body.tags || ['General'],
        image: body.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=60',
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${(body.author || 'Admin').split(' ').pop()}`,
    }
    notices.unshift(newNotice)
    return NextResponse.json(newNotice, { status: 201 })
}

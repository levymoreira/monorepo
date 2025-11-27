import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAccessToken, extractTokenFromRequest } from '@/lib/auth/jwt'

// GET /api/posts/[id]/chat - Get all chat messages for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const token = extractTokenFromRequest(request as any)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verify post exists and belongs to user
    const post = await db.post.findFirst({
      where: {
        id,
        userId: payload.sub,
        deletedAt: null
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const messages = await db.postChatMessage.findMany({
      where: {
        postId: id,
        deletedAt: null
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    return NextResponse.json({ error: 'Failed to fetch chat messages' }, { status: 500 })
  }
}

// POST /api/posts/[id]/chat - Add a new chat message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const token = extractTokenFromRequest(request as any)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verify post exists and belongs to user
    const post = await db.post.findFirst({
      where: {
        id,
        userId: payload.sub,
        deletedAt: null
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const body = await request.json()
    const { role, content } = body

    if (!role || !content) {
      return NextResponse.json(
        { error: 'Role and content are required' },
        { status: 400 }
      )
    }

    if (!['user', 'assistant'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be either "user" or "assistant"' },
        { status: 400 }
      )
    }

    const message = await db.postChatMessage.create({
      data: {
        postId: id,
        userId: payload.sub,
        role,
        content,
        status: 'sent'
      }
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating chat message:', error)
    return NextResponse.json({ error: 'Failed to create chat message' }, { status: 500 })
  }
}

// DELETE /api/posts/[id]/chat - Clear all chat messages (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const token = extractTokenFromRequest(request as any)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verify post exists and belongs to user
    const post = await db.post.findFirst({
      where: {
        id,
        userId: payload.sub,
        deletedAt: null
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Soft delete all chat messages for this post
    await db.postChatMessage.updateMany({
      where: {
        postId: id,
        deletedAt: null
      },
      data: {
        deletedAt: new Date()
      }
    })

    return NextResponse.json({ message: 'Chat messages cleared successfully' })
  } catch (error) {
    console.error('Error clearing chat messages:', error)
    return NextResponse.json({ error: 'Failed to clear chat messages' }, { status: 500 })
  }
}
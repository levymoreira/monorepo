import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAccessToken, extractTokenFromRequest } from '@/lib/auth/jwt'

// PUT /api/posts/[id]/chat/[messageId] - Update a specific chat message
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const { id, messageId } = await params

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

    // Verify message exists and belongs to this post
    const existingMessage = await db.postChatMessage.findFirst({
      where: {
        id: messageId,
        postId: id,
        userId: payload.sub,
        deletedAt: null
      }
    })

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const updatedMessage = await db.postChatMessage.update({
      where: { id: messageId },
      data: {
        content,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error('Error updating chat message:', error)
    return NextResponse.json({ error: 'Failed to update chat message' }, { status: 500 })
  }
}

// DELETE /api/posts/[id]/chat/[messageId] - Soft delete a specific chat message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const { id, messageId } = await params

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

    // Verify message exists and belongs to this post
    const existingMessage = await db.postChatMessage.findFirst({
      where: {
        id: messageId,
        postId: id,
        userId: payload.sub,
        deletedAt: null
      }
    })

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Soft delete the message
    await db.postChatMessage.update({
      where: { id: messageId },
      data: {
        deletedAt: new Date()
      }
    })

    return NextResponse.json({ message: 'Chat message deleted successfully' })
  } catch (error) {
    console.error('Error deleting chat message:', error)
    return NextResponse.json({ error: 'Failed to delete chat message' }, { status: 500 })
  }
}
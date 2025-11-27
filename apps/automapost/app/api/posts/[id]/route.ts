import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAccessToken, extractTokenFromRequest } from '@/lib/auth/jwt'

// GET /api/posts/[id] - Get a specific post
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

    const post = await db.post.findFirst({
      where: {
        id,
        userId: payload.sub,
        deletedAt: null
      },
      include: {
        chatMessages: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

// PUT /api/posts/[id] - Update a post
export async function PUT(
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

    // Check if post exists and belongs to user
    const existingPost = await db.post.findFirst({
      where: {
        id,
        userId: payload.sub,
        deletedAt: null
      }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      content,
      firstComment,
      scheduledTo,
      status,
      providers,
      authProviderIds
    } = body
    
    console.log('PUT /api/posts/[id] - Request body:', { content, firstComment, scheduledTo, status, providers, authProviderIds })

    // Validate auth providers if updated
    if (authProviderIds && authProviderIds.length > 0) {
      const validProviders = await db.authProvider.findMany({
        where: {
          id: { in: authProviderIds },
          userId: payload.sub
        }
      })

      if (validProviders.length !== authProviderIds.length) {
        return NextResponse.json(
          { error: 'Invalid auth provider selection' },
          { status: 400 }
        )
      }
    }

    const updatedPost = await db.post.update({
      where: { id },
      data: {
        ...(content !== undefined && { content }),
        ...(firstComment !== undefined && { firstComment }),
        ...(scheduledTo !== undefined && { scheduledTo }),
        ...(status !== undefined && { status }),
        ...(providers !== undefined && { providers }),
        ...(authProviderIds !== undefined && { authProviderIds })
      },
      include: {
        chatMessages: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

// DELETE /api/posts/[id] - Soft delete a post
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

    // Check if post exists and belongs to user
    const existingPost = await db.post.findFirst({
      where: {
        id,
        userId: payload.sub,
        deletedAt: null
      }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Soft delete the post
    console.log(`DELETE /api/posts/${id} - Soft deleting post for user ${payload.sub}`)
    
    await db.post.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    })

    console.log(`DELETE /api/posts/${id} - Post successfully soft deleted`)
    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
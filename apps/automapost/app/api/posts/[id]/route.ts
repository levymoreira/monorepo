import { NextRequest, NextResponse } from 'next/server'
import { db, posts, postChatMessages, authProviders } from '@/lib/db'
import { eq, and, isNull, inArray, asc } from 'drizzle-orm'
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

    const [post] = await db.select()
      .from(posts)
      .where(and(
        eq(posts.id, id),
        eq(posts.userId, payload.sub),
        isNull(posts.deletedAt)
      ))
      .limit(1)

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Fetch chat messages
    const chatMessages = await db.select()
      .from(postChatMessages)
      .where(and(
        eq(postChatMessages.postId, id),
        isNull(postChatMessages.deletedAt)
      ))
      .orderBy(asc(postChatMessages.createdAt))

    return NextResponse.json({ ...post, chatMessages })
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
    const [existingPost] = await db.select()
      .from(posts)
      .where(and(
        eq(posts.id, id),
        eq(posts.userId, payload.sub),
        isNull(posts.deletedAt)
      ))
      .limit(1)

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
      const validProviders = await db.select()
        .from(authProviders)
        .where(and(
          inArray(authProviders.id, authProviderIds),
          eq(authProviders.userId, payload.sub)
        ))

      if (validProviders.length !== authProviderIds.length) {
        return NextResponse.json(
          { error: 'Invalid auth provider selection' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (content !== undefined) updateData.content = content
    if (firstComment !== undefined) updateData.firstComment = firstComment
    if (scheduledTo !== undefined) updateData.scheduledTo = scheduledTo
    if (status !== undefined) updateData.status = status
    if (providers !== undefined) updateData.providers = providers
    if (authProviderIds !== undefined) updateData.authProviderIds = authProviderIds

    const [updatedPost] = await db.update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning()

    // Fetch chat messages
    const chatMessages = await db.select()
      .from(postChatMessages)
      .where(and(
        eq(postChatMessages.postId, id),
        isNull(postChatMessages.deletedAt)
      ))
      .orderBy(asc(postChatMessages.createdAt))

    return NextResponse.json({ ...updatedPost, chatMessages })
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
    const [existingPost] = await db.select()
      .from(posts)
      .where(and(
        eq(posts.id, id),
        eq(posts.userId, payload.sub),
        isNull(posts.deletedAt)
      ))
      .limit(1)

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Soft delete the post
    console.log(`DELETE /api/posts/${id} - Soft deleting post for user ${payload.sub}`)
    
    await db.update(posts)
      .set({ deletedAt: new Date() })
      .where(eq(posts.id, id))

    console.log(`DELETE /api/posts/${id} - Post successfully soft deleted`)
    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
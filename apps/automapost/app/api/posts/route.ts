import { NextRequest, NextResponse } from 'next/server'
import { db, posts, users, postChatMessages, messageQueue, authProviders } from '@/lib/db'
import { eq, and, isNull, desc, inArray, asc } from 'drizzle-orm'
import { verifyAccessToken, extractTokenFromRequest } from '@/lib/auth/jwt'
import { generateInitialMessage } from '@/lib/ai-service'

// GET /api/posts - List all posts for the user (not soft-deleted)
export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request as any)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    const conditions = [
      eq(posts.userId, payload.sub),
      isNull(posts.deletedAt)
    ]
    
    if (status) {
      conditions.push(eq(posts.status, status.toUpperCase() as any))
    }

    const userPosts = await db.select()
      .from(posts)
      .where(and(...conditions))
      .orderBy(desc(posts.createdAt))

    // Fetch chat messages for each post
    const postsWithMessages = await Promise.all(
      userPosts.map(async (post) => {
        const messages = await db.select()
          .from(postChatMessages)
          .where(and(
            eq(postChatMessages.postId, post.id),
            isNull(postChatMessages.deletedAt)
          ))
          .orderBy(asc(postChatMessages.createdAt))
        
        return { ...post, chatMessages: messages }
      })
    )

    return NextResponse.json(postsWithMessages)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request as any)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { providers, authProviderIds } = body
    
    console.log('POST /api/posts - Request body:', { providers, authProviderIds })

    // Filter out null/undefined values and validate that the user owns the auth providers
    const cleanAuthProviderIds = authProviderIds?.filter((id: string | null | undefined) => id != null) || []
    console.log('POST /api/posts - Clean authProviderIds:', cleanAuthProviderIds)
    if (cleanAuthProviderIds.length > 0) {
      const validProviders = await db.select()
        .from(authProviders)
        .where(and(
          inArray(authProviders.id, cleanAuthProviderIds),
          eq(authProviders.userId, payload.sub)
        ))

      if (validProviders.length !== cleanAuthProviderIds.length) {
        return NextResponse.json(
          { error: 'Invalid auth provider selection' },
          { status: 400 }
        )
      }
    }

    // Create the post
    const [post] = await db.insert(posts).values({
      userId: payload.sub,
      content: '',
      status: 'DRAFT',
      providers: providers || [],
      authProviderIds: cleanAuthProviderIds
    }).returning()

    // Auto-create initial chat message asynchronously
    createInitialChatMessage(post.id, payload.sub).catch(error => {
      console.error('Error creating initial chat message:', error);
    });

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

// Create initial chat message for new post
async function createInitialChatMessage(postId: string, userId: string) {
  try {
    // Get user context for personalization
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    
    const userPosts = await db.select()
      .from(posts)
      .where(and(
        eq(posts.userId, userId),
        eq(posts.status, 'SENT'),
        isNull(posts.deletedAt)
      ))
      .orderBy(desc(posts.createdAt))
      .limit(3)

    // Generate contextual welcome message
    const hasPublishedPosts = userPosts.length > 0;
    const userName = user?.name?.split(' ')[0] || 'there';
    
    const aiContent = await generateInitialMessage(
      postId, 
      userId, 
      hasPublishedPosts, 
      userName
    );
    
    // Save AI message directly to post_chat_messages
    const [assistantMessage] = await db.insert(postChatMessages).values({
      postId,
      userId,
      role: 'assistant',
      content: aiContent,
      metadata: { 
        type: 'welcome',
        actions: ['suggest_content', 'improve_post', 'schedule_post']
      },
      status: 'sent'
    }).returning()

    // Queue for delivery to client
    await db.insert(messageQueue).values({
      userId,
      postId,
      messageId: assistantMessage.id
    })
  } catch (error) {
    console.error('Error creating initial chat message:', error);
  }
}
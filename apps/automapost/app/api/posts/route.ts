import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
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

    const posts = await db.post.findMany({
      where: {
        userId: payload.sub,
        deletedAt: null,
        ...(status && { status: status.toUpperCase() as any })
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        chatMessages: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return NextResponse.json(posts)
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
    const cleanAuthProviderIds = authProviderIds?.filter(id => id != null) || []
    console.log('POST /api/posts - Clean authProviderIds:', cleanAuthProviderIds)
    if (cleanAuthProviderIds.length > 0) {
      const validProviders = await db.authProvider.findMany({
        where: {
          id: { in: cleanAuthProviderIds },
          userId: payload.sub
        }
      })

      if (validProviders.length !== cleanAuthProviderIds.length) {
        return NextResponse.json(
          { error: 'Invalid auth provider selection' },
          { status: 400 }
        )
      }
    }

    // Create the post
    const post = await db.post.create({
      data: {
        userId: payload.sub,
        content: '',
        status: 'DRAFT',
        providers: providers || [],
        authProviderIds: cleanAuthProviderIds
      }
    })

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
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { 
        posts: { 
          take: 3, 
          orderBy: { createdAt: 'desc' },
          where: { 
            status: 'SENT',
            deletedAt: null
          }
        }
      }
    });

    // Generate contextual welcome message
    const hasPublishedPosts = (user?.posts?.length || 0) > 0;
    const userName = user?.name?.split(' ')[0] || 'there';
    
    const aiContent = await generateInitialMessage(
      postId, 
      userId, 
      hasPublishedPosts, 
      userName
    );
    
    // Save AI message directly to post_chat_messages
    const assistantMessage = await db.postChatMessage.create({
      data: {
        postId,
        userId,
        role: 'assistant',
        content: aiContent,
        metadata: { 
          type: 'welcome',
          actions: ['suggest_content', 'improve_post', 'schedule_post']
        },
        status: 'sent'
      }
    });

    // Queue for delivery to client
    await db.messageQueue.create({
      data: {
        userId,
        postId,
        messageId: assistantMessage.id
      }
    });
  } catch (error) {
    console.error('Error creating initial chat message:', error);
  }
}
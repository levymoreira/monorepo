import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken, extractTokenFromRequest } from '@/lib/auth/jwt';

// GET /api/chat/messages - Load existing messages for a post
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const token = extractTokenFromRequest(request as any);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.sub;
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    // Verify user owns the post
    const post = await db.post.findFirst({
      where: {
        id: postId,
        userId: userId,
        deletedAt: null
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get all messages for this post
    const messages = await db.postChatMessage.findMany({
      where: { 
        postId,
        deletedAt: null
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark any undelivered messages as delivered since user is loading them
    await db.messageQueue.updateMany({
      where: {
        userId,
        postId,
        delivered: false
      },
      data: {
        delivered: true,
        deliveredAt: new Date()
      }
    });

    // Format messages for client
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      metadata: msg.metadata,
      timestamp: msg.createdAt
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error('Error loading chat messages:', error);
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 });
  }
}
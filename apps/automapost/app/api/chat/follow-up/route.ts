import { NextRequest, NextResponse } from 'next/server';
import { db, posts, postChatMessages, messageQueue } from '@/lib/db';
import { eq, and, isNull, asc } from 'drizzle-orm';
import { verifyAccessToken, extractTokenFromRequest } from '@/lib/auth/jwt';
import { generateFollowUpMessage, type ChatMessage } from '@/lib/ai-service';

// POST /api/chat/follow-up - Generate follow-up message when user edits post
export async function POST(request: NextRequest) {
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
    const { postId, postContent, trigger } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    if (!postContent || postContent.trim().length === 0) {
      return NextResponse.json({ error: 'Post content required' }, { status: 400 });
    }

    // Verify user owns the post
    const [post] = await db.select()
      .from(posts)
      .where(and(
        eq(posts.id, postId),
        eq(posts.userId, userId),
        isNull(posts.deletedAt)
      ))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Process follow-up asynchronously
    processFollowUpMessage(postId, postContent.trim(), userId, trigger || 'edit').catch(error => {
      console.error('Follow-up processing error:', error);
    });

    return NextResponse.json({ 
      status: 'processing'
    });
  } catch (error) {
    console.error('Error generating follow-up:', error);
    return NextResponse.json({ error: 'Failed to generate follow-up' }, { status: 500 });
  }
}

// Process follow-up message asynchronously
async function processFollowUpMessage(postId: string, postContent: string, userId: string, trigger: string) {
  try {
    // Get conversation context
    const previousMessages = await db.select()
      .from(postChatMessages)
      .where(and(
        eq(postChatMessages.postId, postId),
        isNull(postChatMessages.deletedAt)
      ))
      .orderBy(asc(postChatMessages.createdAt))
      .limit(10);

    // Convert to format expected by AI service
    const chatMessages: ChatMessage[] = previousMessages.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      metadata: msg.metadata,
      createdAt: msg.createdAt
    }));

    // Call AI service for follow-up
    const aiResponse = await generateFollowUpMessage({
      postId,
      postContent,
      previousMessages: chatMessages
    });

    // Skip if the AI response is empty or just whitespace
    if (!aiResponse.content || !aiResponse.content.trim()) {
      console.log('Follow-up: No message to add (empty response)');
      return;
    }

    // Save AI follow-up message
    const [followUpMessage] = await db.insert(postChatMessages).values({
      postId,
      userId,
      role: 'assistant',
      content: aiResponse.content,
      metadata: {
        ...aiResponse.metadata,
        trigger,
        generatedAt: new Date()
      },
      status: 'sent'
    }).returning();

    // Queue for delivery
    await db.insert(messageQueue).values({
      userId,
      postId,
      messageId: followUpMessage.id
    });
  } catch (error) {
    console.error('Follow-up processing error:', error);
    
    // Don't send error messages for follow-ups, just log them
    // Follow-ups are less critical than direct user interactions
  }
}
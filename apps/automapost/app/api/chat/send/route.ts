import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken, extractTokenFromRequest } from '@/lib/auth/jwt';
import { generateAIResponse, type ChatMessage } from '@/lib/ai-service';

// POST /api/chat/send - Send a message and generate AI response
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
    const { postId, content } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 });
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

    // Save user message
    const userMessage = await db.postChatMessage.create({
      data: {
        postId,
        userId,
        role: 'user',
        content: content.trim(),
        status: 'sent'
      }
    });

    // Queue user message for delivery (for consistency with SSE stream)
    await db.messageQueue.create({
      data: {
        userId,
        postId,
        messageId: userMessage.id
      }
    });

    // Process AI response asynchronously
    processAIResponse(postId, content.trim(), userId).catch(error => {
      console.error('AI response processing error:', error);
    });

    return NextResponse.json({ 
      messageId: userMessage.id 
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// Process AI response asynchronously
async function processAIResponse(postId: string, userContent: string, userId: string) {
  try {
    // Get conversation context
    const previousMessages = await db.postChatMessage.findMany({
      where: { 
        postId,
        deletedAt: null
      },
      orderBy: { createdAt: 'asc' },
      take: 10
    });

    // Convert to format expected by AI service
    const chatMessages: ChatMessage[] = previousMessages.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      metadata: msg.metadata,
      createdAt: msg.createdAt
    }));

    // Call AI service
    const aiResponse = await generateAIResponse({
      messages: chatMessages,
      userContent
    });

    // Save AI response
    const assistantMessage = await db.postChatMessage.create({
      data: {
        postId,
        userId,
        role: 'assistant',
        content: aiResponse.content,
        metadata: aiResponse.metadata,
        status: 'sent'
      }
    });

    // Queue for delivery
    await db.messageQueue.create({
      data: {
        userId,
        postId,
        messageId: assistantMessage.id
      }
    });
  } catch (error) {
    console.error('AI processing error:', error);
    
    // Send error message
    try {
      const errorMessage = await db.postChatMessage.create({
        data: {
          postId,
          userId,
          role: 'system',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          status: 'sent'
        }
      });

      await db.messageQueue.create({
        data: {
          userId,
          postId,
          messageId: errorMessage.id
        }
      });
    } catch (errorSavingError) {
      console.error('Error saving error message:', errorSavingError);
    }
  }
}
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken, extractTokenFromRequest } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    console.log('=== SSE Connection Attempt ===');
    
    // Extract authentication
    const { searchParams } = new URL(request.url);
    let token = extractTokenFromRequest(request as any);
    
    // Fallback to query parameter
    if (!token) {
      token = searchParams.get('token');
    }
    
    if (!token) {
      console.log('SSE: No authentication token');
      return new Response('Unauthorized', { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      console.log('SSE: Invalid token');
      return new Response('Invalid token', { status: 401 });
    }

    const userId = payload.sub;
    const postId = searchParams.get('postId');
    
    if (!postId) {
      console.log('SSE: No postId provided');
      return new Response('Post ID required', { status: 400 });
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
      console.log('SSE: Post not found or unauthorized');
      return new Response('Post not found', { status: 404 });
    }

    console.log(`SSE: Starting stream for post ${postId}, user ${userId}`);

    // Create readable stream
    const stream = new ReadableStream({
      start(controller) {
        console.log('SSE: Stream started');
        const encoder = new TextEncoder();
        
        // Send immediate connection confirmation
        const connectMessage = 'event: connected\ndata: {"status":"connected"}\n\n';
        controller.enqueue(encoder.encode(connectMessage));
        console.log('SSE: Connection event sent');
        
        // Check for existing messages immediately
        this.checkMessages = async () => {
          try {
            const messages = await db.messageQueue.findMany({
              where: {
                userId,
                postId,
                delivered: false
              },
              include: {
                message: true
              },
              orderBy: { createdAt: 'asc' }
            });

            for (const queueItem of messages) {
              const messageData = JSON.stringify({
                id: queueItem.message.id,
                role: queueItem.message.role,
                content: queueItem.message.content,
                metadata: queueItem.message.metadata,
                timestamp: queueItem.message.createdAt
              });

              const sseMessage = `id: ${queueItem.id}\nevent: message\ndata: ${messageData}\n\n`;
              controller.enqueue(encoder.encode(sseMessage));
              console.log('SSE: Message sent:', queueItem.message.id);

              // Mark as delivered
              await db.messageQueue.update({
                where: { id: queueItem.id },
                data: { 
                  delivered: true,
                  deliveredAt: new Date()
                }
              });
            }
          } catch (error) {
            console.error('SSE: Error checking messages:', error);
          }
        };

        // Check messages immediately
        this.checkMessages();
        
        // Set up polling interval
        this.interval = setInterval(() => {
          if (request.signal.aborted) {
            console.log('SSE: Client disconnected');
            controller.close();
            clearInterval(this.interval);
            return;
          }
          this.checkMessages();
        }, 2000); // Poll every 2 seconds

        // Heartbeat every 30 seconds
        this.heartbeat = setInterval(() => {
          if (request.signal.aborted) {
            clearInterval(this.heartbeat);
            return;
          }
          const heartbeatMessage = ': heartbeat\n\n';
          controller.enqueue(encoder.encode(heartbeatMessage));
        }, 30000);
      },

      cancel() {
        console.log('SSE: Stream cancelled');
        if (this.interval) clearInterval(this.interval);
        if (this.heartbeat) clearInterval(this.heartbeat);
      }
    });

    // Set response headers
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
      'Access-Control-Allow-Credentials': 'true',
    };

    return new Response(stream, { headers });

  } catch (error) {
    console.error('SSE: Endpoint error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
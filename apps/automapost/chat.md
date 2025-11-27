# Chat System Implementation Plan

## Overview
AutomaPost requires a real-time chat system for AI-assisted post creation without WebSocket infrastructure. The chat system needs to:
- Automatically generate initial AI messages when posts are created (server-side)
- Auto-generate follow-ups when users edit posts (with 2-second debounce)
- Display AI responses with minimal latency
- Maintain conversation context and history

**Infrastructure Constraints:**
- No WebSockets or Socket.io
- Existing PostgreSQL database
- Next.js API routes
- PM2 process manager

---

## Plan 1: Server-Sent Events (SSE) + HTTP POST (Recommended)

### Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client        │ -> │   POST /chat     │ -> │   AI Service    │
│   (React)       │    │   (Send msg)     │    │   (Process)     │
│                 │    └──────────────────┘    └─────────────────┘
│                 │              ↓                       ↓
│                 │    ┌──────────────────┐    ┌─────────────────┐
│                 │ <- │   SSE Stream     │ <- │   PostgreSQL    │
│   EventSource   │    │   (Receive)      │    │   Chat Storage  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Implementation Details

#### 1. Database Schema
```sql
-- Update existing post_chats table to post_chat_messages with missing fields
ALTER TABLE post_chats RENAME TO post_chat_messages;

-- Add missing columns to post_chat_messages
ALTER TABLE post_chat_messages 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'user', 'assistant', 'system'
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB, -- For storing actions, suggestions, etc.
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'sent'; -- 'sending', 'sent', 'failed'

-- Message queue for SSE delivery
CREATE TABLE message_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  post_id UUID NOT NULL REFERENCES posts(id),
  message_id UUID NOT NULL REFERENCES post_chat_messages(id),
  delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_post_chat_messages_post ON post_chat_messages(post_id, created_at);
CREATE INDEX idx_message_queue_user_post ON message_queue(user_id, post_id, delivered, created_at);
```

#### 2. Server-Sent Events API
```typescript
// app/api/chat/stream/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { userId } = await authenticate(request);
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');
  
  if (!postId) {
    return new Response('Post ID required', { status: 400 });
  }
  
  // Set SSE headers
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable Nginx buffering
  };

  // Create transform stream
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // Heartbeat to keep connection alive
  const heartbeat = setInterval(async () => {
    try {
      await writer.write(encoder.encode(':heartbeat\n\n'));
    } catch (error) {
      clearInterval(heartbeat);
    }
  }, 30000); // Every 30 seconds

  // Poll for new messages
  const pollInterval = setInterval(async () => {
    try {
      // Check for new messages in queue
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
        // Send message via SSE
        const data = JSON.stringify({
          id: queueItem.message.id,
          role: queueItem.message.role,
          content: queueItem.message.content,
          metadata: queueItem.message.metadata,
          timestamp: queueItem.message.createdAt
        });

        await writer.write(
          encoder.encode(`id: ${queueItem.id}\nevent: message\ndata: ${data}\n\n`)
        );

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
      console.error('SSE poll error:', error);
      clearInterval(pollInterval);
      clearInterval(heartbeat);
      await writer.close();
    }
  }, 1000); // Poll every second

  // Cleanup on disconnect
  request.signal.addEventListener('abort', () => {
    clearInterval(pollInterval);
    clearInterval(heartbeat);
    writer.close();
  });

  return new Response(stream.readable, { headers });
}
```

#### 3. Post Creation with Auto Chat
```typescript
// app/api/posts/route.ts (modified)
export async function POST(request: NextRequest) {
  const { userId } = await authenticate(request);
  const { content, providers, authProviderIds } = await request.json();

  // Create post
  const post = await db.post.create({
    data: {
      userId,
      content,
      providers,
      authProviderIds,
      status: 'DRAFT'
    }
  });

  // Auto-create initial chat message
  await createInitialChatMessage(post.id, userId);

  return NextResponse.json(post);
}

async function createInitialChatMessage(postId: string, userId: string) {
  // Generate initial AI message
  const aiContent = await generateInitialMessage(postId, userId);
  
  // Save AI message directly to post_chat_messages
  const assistantMessage = await db.postChatMessage.create({
    data: {
      postId,
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
}

async function generateInitialMessage(postId: string, userId: string): Promise<string> {
  // Get user context for personalization
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { 
      posts: { 
        take: 3, 
        orderBy: { createdAt: 'desc' },
        where: { status: 'SENT' }
      }
    }
  });

  // Generate contextual welcome message
  const context = {
    hasPublishedPosts: user?.posts?.length > 0,
    userName: user?.name?.split(' ')[0] || 'there'
  };

  if (context.hasPublishedPosts) {
    return `Hi ${context.userName}! 👋 I see you've created a new post. Based on your previous content, I can help you craft something engaging. What would you like to focus on today?`;
  } else {
    return `Welcome ${context.userName}! 🎉 I'm excited to help you create your first post. Let's make it something special that resonates with your audience. What topic are you thinking about?`;
  }
}

// Chat Message Sending (User messages)
// app/api/chat/send/route.ts
export async function POST(request: NextRequest) {
  const { userId } = await authenticate(request);
  const { postId, content } = await request.json();

  if (!postId) {
    return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
  }

  // Save user message
  const userMessage = await db.postChatMessage.create({
    data: {
      postId,
      role: 'user',
      content,
      status: 'sent'
    }
  });

  // Queue for delivery
  await db.messageQueue.create({
    data: {
      userId,
      postId,
      messageId: userMessage.id
    }
  });

  // Process AI response asynchronously
  processAIResponse(postId, content, userId);

  return NextResponse.json({ 
    messageId: userMessage.id 
  });
}

// Load existing messages
// app/api/chat/messages/route.ts
export async function GET(request: NextRequest) {
  const { userId } = await authenticate(request);
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');

  if (!postId) {
    return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
  }

  // Get all messages for this post
  const messages = await db.postChatMessage.findMany({
    where: { postId },
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

  return NextResponse.json(messages.map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    metadata: msg.metadata,
    timestamp: msg.createdAt
  })));
}

async function processAIResponse(postId: string, userContent: string, userId: string) {
  try {
    // Get conversation context
    const previousMessages = await db.postChatMessage.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      take: 10
    });

    // Call AI service
    const aiResponse = await generateAIResponse({
      messages: previousMessages,
      userContent
    });

    // Save AI response
    const assistantMessage = await db.postChatMessage.create({
      data: {
        postId,
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
    const errorMessage = await db.postChatMessage.create({
      data: {
        postId,
        role: 'system',
        content: 'Sorry, I encountered an error processing your request.',
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
  }
}
```

#### 4. Client Implementation
```typescript
// hooks/useChat.tsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { debounce } from 'lodash';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: any;
  timestamp: string;
}

export function useChat(postId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Load existing messages on mount
  const loadMessages = useCallback(async () => {
    if (!postId) return;

    try {
      const response = await fetch(`/api/chat/messages?postId=${postId}`);
      const existingMessages = await response.json();
      setMessages(existingMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  // Connect to SSE stream
  const connect = useCallback(() => {
    if (!postId || eventSourceRef.current) return;

    const params = new URLSearchParams();
    params.append('postId', postId);
    
    const eventSource = new EventSource(`/api/chat/stream?${params}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('Chat connected');
    };

    eventSource.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      
      // Prevent duplicates by checking if message already exists
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) {
          return prev; // Message already exists, don't add
        }
        return [...prev, message];
      });
      setIsTyping(false);
    });

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
      eventSourceRef.current = null;
      
      // Reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    };

    return eventSource;
  }, [postId]);

  // Initialize: load messages then connect to SSE
  useEffect(() => {
    if (postId) {
      loadMessages().then(() => {
        connect();
      });
    }
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [postId, loadMessages, connect]);

  // Send message
  const sendMessage = async (content: string) => {
    if (!postId) return;

    // Optimistically add user message
    const tempId = `temp-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: tempId,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content })
      });

      const data = await response.json();

      // Replace temp message with real one
      setMessages(prev => 
        prev.map(msg => msg.id === tempId ? { ...msg, id: data.messageId } : msg)
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  // Auto-generate follow-up on post edit (debounced)
  const generateFollowUp = useRef(
    debounce(async (postContent: string) => {
      if (!postId) return;

      try {
        await fetch('/api/chat/follow-up', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            postId, 
            postContent,
            trigger: 'edit'
          })
        });
      } catch (error) {
        console.error('Failed to generate follow-up:', error);
      }
    }, 2000) // 2 second debounce
  ).current;

  return {
    messages,
    sendMessage,
    generateFollowUp,
    isConnected,
    isTyping,
    isLoading
  };
}
```

#### 5. Post Editor Integration
```typescript
// components/portal/post-editor.tsx
export function PostEditor({ postId }: { postId: string }) {
  const [content, setContent] = useState('');
  const { messages, sendMessage, generateFollowUp, isTyping } = useChat(postId);

  // Trigger follow-up on content change
  useEffect(() => {
    if (content.length > 10) {
      generateFollowUp(content);
    }
  }, [content, generateFollowUp]);

  // Note: Initial chat message is automatically created server-side
  // when the post is created. Client just connects and receives it.

  return (
    <div className="flex">
      <div className="flex-1">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post..."
        />
      </div>
      <div className="w-96">
        <ChatPanel 
          messages={messages}
          onSendMessage={sendMessage}
          isTyping={isTyping}
          postId={postId}
        />
      </div>
    </div>
  );
}
```

### Pros
✅ **Real-time updates**: SSE provides instant message delivery  
✅ **Automatic reconnection**: Built-in reconnect on connection loss  
✅ **Efficient**: One-way stream perfect for chat updates  
✅ **Native browser support**: No additional libraries needed  
✅ **Works through proxies**: Better than WebSockets for corporate networks  

### Cons
❌ **One-way communication**: Need separate POST for sending  
❌ **Connection limit**: Browsers limit concurrent SSE connections  
❌ **IE/Edge Legacy**: No support in older browsers  

## Implementation Approach

**Server-Sent Events (SSE) + HTTP POST** provides the optimal solution because:

1. **Real-time delivery**: Messages appear instantly
2. **Efficient**: One persistent connection for updates
3. **Native browser support**: No additional libraries
4. **Automatic reconnection**: Built-in resilience
5. **Simple client code**: Clean React hooks implementation

### Implementation Timeline

**Week 1**: Core infrastructure
- Database schema setup
- SSE endpoint implementation
- Basic message sending

**Week 2**: Chat features
- Auto-follow-up generation
- Post edit detection with debounce
- Message queuing system

**Week 3**: UI Integration
- React hooks development
- Post editor integration
- Chat panel component

**Week 4**: Polish & optimization
- Error handling
- Reconnection logic
- Performance tuning

This approach provides a robust, real-time chat experience without the complexity of WebSockets, perfect for AutomaPost's AI-assisted content creation workflow.
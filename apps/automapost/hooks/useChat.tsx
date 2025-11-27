'use client'

import { useEffect, useState, useCallback, useRef } from 'react';
import { debounce } from 'lodash';

export interface ChatMessage {
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
  const [isSending, setIsSending] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const maxRetries = 5;
  const retryCountRef = useRef(0);

  // Load existing messages on mount
  const loadMessages = useCallback(async () => {
    if (!postId) return;

    try {
      console.log('Loading messages for post:', postId);
      const response = await fetch(`/api/chat/messages?postId=${postId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const existingMessages = await response.json();
      console.log('Loaded messages:', existingMessages.length);
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

    console.log(`Attempting SSE connection to post: ${postId} (attempt ${retryCountRef.current + 1})`);
    
    const eventSource = new EventSource(`/api/chat/stream?postId=${postId}`, {
      withCredentials: true
    });
    
    eventSourceRef.current = eventSource;

    const connectionTimeout = setTimeout(() => {
      if (!isConnected) {
        console.log('SSE connection timed out after 15 seconds');
        eventSource.close();
        eventSourceRef.current = null;
        scheduleReconnect();
      }
    }, 15000);

    eventSource.onopen = () => {
      console.log('SSE connection opened successfully');
      clearTimeout(connectionTimeout);
      setIsConnected(true);
      retryCountRef.current = 0;
    };

    eventSource.addEventListener('connected', (event) => {
      console.log('SSE connected event received:', event.data);
      setIsConnected(true);
    });

    eventSource.addEventListener('message', (event) => {
      console.log('SSE message received:', event.data);
      try {
        const message = JSON.parse(event.data);
        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
        setIsTyping(false);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    });

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      clearTimeout(connectionTimeout);
      setIsConnected(false);
      eventSource.close();
      eventSourceRef.current = null;
      scheduleReconnect();
    };

    const scheduleReconnect = () => {
      if (retryCountRef.current < maxRetries && postId) {
        retryCountRef.current++;
        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 10000);
        console.log(`Scheduling reconnect in ${delay}ms (attempt ${retryCountRef.current})`);
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      } else {
        console.log('Max retries reached or no postId, stopping reconnection attempts');
      }
    };

  }, [postId, isConnected, maxRetries]);

  // Initialize connection
  useEffect(() => {
    if (!postId) return;

    console.log('Initializing chat for post:', postId);
    
    // Load messages first, then connect to SSE
    loadMessages().then(() => {
      connect();
    });
    
    return () => {
      console.log('Cleaning up chat connection');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      setIsConnected(false);
    };
  }, [postId]);

  // Send message
  const sendMessage = async (content: string) => {
    if (!postId) return;

    const tempId = `temp-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: tempId,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    // Set loading states
    setIsSending(true);
    setIsTyping(true);
    
    // Optimistically add message
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ postId, content })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Replace temp message with real one
      setMessages(prev => 
        prev.map(msg => msg.id === tempId ? { ...msg, id: data.messageId } : msg)
      );

      // Clear sending state after successful send
      setIsSending(false);

    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
      setIsSending(false);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  // Generate follow-up (debounced)
  const generateFollowUp = useRef(
    debounce(async (postContent: string) => {
      if (!postId || !postContent.trim()) return;

      // Show typing indicator while generating follow-up
      setIsTyping(true);

      try {
        const response = await fetch('/api/chat/follow-up', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            postId, 
            postContent,
            trigger: 'edit'
          })
        });

        if (!response.ok) {
          console.error('Follow-up request failed:', response.status);
          // Clear typing indicator on error
          setIsTyping(false);
        }
      } catch (error) {
        console.error('Failed to generate follow-up:', error);
        // Clear typing indicator on error
        setIsTyping(false);
      }
    }, 2000)
  ).current;

  return {
    messages,
    sendMessage,
    generateFollowUp,
    isConnected,
    isTyping,
    isSending,
    isLoading
  };
}
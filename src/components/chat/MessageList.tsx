import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { authFetch } from '@/lib/authFetch';
import { getAccessToken } from '@/lib/auth';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  type: 'text' | 'image' | 'button' | 'quick_reply';
  content: string;
  sender: 'customer' | 'bot' | 'agent';
  timestamp: string;
  isRead: boolean;
  buttons?: Array<{ id: string; text: string; selected?: boolean }>;
  imageUrl?: string;
  quickReplies?: string[];
  selectedOption?: string;
}

interface MessageListProps {
  conversationId: string;
}

export const MessageList = forwardRef<any, MessageListProps>(({ conversationId }, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    authFetch(`http://localhost:3001/api/chat/messages/${conversationId}`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          const loadedMessages = (data.messages || []).map((msg: any, idx: number) => ({
            id: `${msg.timestamp}_${idx}`, // Use timestamp + index for unique ID
            type: msg.type || 'text',
            content: msg.content,
            sender: msg.sender === 'user' ? 'customer' : msg.sender,
            timestamp: new Date(msg.timestamp).toLocaleTimeString(),
            isRead: msg.status === 'read',
            buttons: msg.buttons,
            imageUrl: msg.imageUrl,
            quickReplies: msg.quickReplies,
            selectedOption: msg.selectedOption,
          }));
          setMessages(loadedMessages);
          setIsInitialized(true);
          console.log(`📚 Loaded ${loadedMessages.length} initial messages`);
        }
      })
      .catch(error => {
        console.error('Error loading messages:', error);
      })
      .finally(() => setLoading(false));
  }, [conversationId]);

  // Socket.IO connection for real-time updates
  useEffect(() => {
    if (!conversationId || !isInitialized) return;
    
    const token = getAccessToken();
    if (!token) return;

    const socket = io('http://localhost:3001', {
      auth: { token },
    });
    socketRef.current = socket;

    console.log(`🔌 Connecting to chat service for conversation: ${conversationId}`);

    // Join conversation room
    socket.emit('join_conversation', { conversation_id: conversationId });

    // Listen for new messages
    socket.on('chat_message', (data) => {
      console.log(`📨 Received chat message:`, data);
      if (data.conversation_id === conversationId) {
        const newMessage: Message = {
          id: `${data.message.timestamp}_${Date.now()}`, // Unique ID for real-time messages
          type: data.message.type || 'text',
          content: data.message.content,
          sender: data.message.sender === 'user' ? 'customer' : data.message.sender,
          timestamp: new Date(data.message.timestamp).toLocaleTimeString(),
          isRead: data.message.status === 'read',
          buttons: data.message.buttons,
          imageUrl: data.message.imageUrl,
          quickReplies: data.message.quickReplies,
          selectedOption: data.message.selectedOption,
        };
        
        console.log(`📝 Adding new message to chat:`, newMessage);
        
        // Check if message already exists to prevent duplicates
        setMessages(prev => {
          const messageExists = prev.some(msg => 
            msg.content === newMessage.content && 
            msg.sender === newMessage.sender &&
            Math.abs(new Date(msg.timestamp).getTime() - new Date(newMessage.timestamp).getTime()) < 5000 // Within 5 seconds
          );
          
          if (messageExists) {
            console.log(`⚠️ Message already exists, skipping duplicate`);
            return prev;
          }
          
          return [...prev, newMessage];
        });
      }
    });

    socket.on('connect', () => {
      console.log(`✅ Connected to chat service`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Disconnected from chat service`);
    });

    socket.on('error', (error) => {
      console.error(`❌ Socket error:`, error);
    });

    return () => {
      console.log(`🔌 Disconnecting from chat service`);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId, isInitialized]);

  // Improved autoscroll: use a ref and scrollIntoView for the last message
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, conversationId, isInitialized]);

  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    },
  }));

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
      <div className="space-y-4 max-w-4xl mx-auto">
        {loading && <div className="text-center text-gray-500">Loading...</div>}
        {messages.map((message, index) => (
          <div
            key={message.id}
            ref={index === messages.length - 1 ? lastMessageRef : undefined}
          >
            <MessageBubble
              message={message}
              isLast={index === messages.length - 1}
            />
          </div>
        ))}
        {!loading && messages.length === 0 && (
          <div className="text-center text-gray-500">No messages yet.</div>
        )}
      </div>
    </ScrollArea>
  );
});
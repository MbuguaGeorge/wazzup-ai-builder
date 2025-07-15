import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Smile, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAccessToken } from '@/lib/auth';
import { io, Socket } from 'socket.io-client';
import { authFetch } from '@/lib/authFetch';

interface MessageComposerProps {
  conversationId: string;
  botId: string;
  handoffActive?: boolean;
  onMessageSent?: () => void;
  userId?: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ conversationId, botId, handoffActive, onMessageSent, userId }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    const socket = io('http://localhost:3001', {
      auth: { token },
    });
    socketRef.current = socket;
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const handleSend = async () => {
    if (message.trim() && !isSending) {
      setIsSending(true);
      const token = getAccessToken();
      const messageContent = message.trim();
      const timestamp = new Date().toISOString();
      
      const msgObj = {
        conversation_id: conversationId,
        bot_id: botId,
        message: {
          sender: 'agent',
          from: conversationId.split('_')[1] || conversationId, // Extract phone number from conversation ID
          content: messageContent,
          type: 'text',
          status: 'sent',
          timestamp: timestamp,
        },
      };
      
      try {
        // Extract user_id (phone number) from prop or conversationId
        let phone = userId;
        if (!phone && conversationId) {
          const parts = conversationId.split('_');
          if (parts.length >= 3) phone = parts.slice(2).join('_');
        }
        const response = await authFetch(`http://localhost:8000/api/flows/send_whatsapp_message/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversation_id: conversationId,
            bot_id: botId,
            message: messageContent,
            user_id: phone,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to send message');
        }
        setMessage('');
        if (onMessageSent) onMessageSent();
        console.log(`\u2705 Message sent successfully: ${messageContent}`);
      } catch (error) {
        console.error('Error sending message:', error);
        // You could show a toast notification here
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = () => {
    // Handle file upload
    console.log('File upload clicked');
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {/* File Upload Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleFileUpload}
          className="shrink-0"
          disabled={handoffActive === false}
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        {/* Message Input Container */}
        <div className="flex-1 relative">
          <div className="flex items-end border border-gray-300 rounded-lg bg-gray-50">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={handoffActive === false ? "Bot is handling this conversation..." : "Type a message..."}
              className="border-0 bg-transparent resize-none min-h-[40px] focus-visible:ring-0"
              style={{ boxShadow: 'none' }}
              disabled={handoffActive === false || isSending}
            />
            {/* Emoji Button */}
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 mr-2"
              onClick={() => console.log('Emoji picker')}
              disabled={handoffActive === false}
            >
              <Smile className="w-4 h-4 text-gray-500" />
            </Button>
          </div>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isSending || handoffActive === false}
          className={cn(
            "shrink-0",
            message.trim() && !isSending && handoffActive !== false
              ? "bg-blue-500 hover:bg-blue-600" 
              : "bg-gray-300 cursor-not-allowed"
          )}
        >
          {isSending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 max-w-4xl mx-auto">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span>Customer is typing...</span>
        </div>
      )}

      {/* Handoff Disabled Message */}
      {handoffActive === false && (
        <div className="mt-2 text-center text-gray-500 text-sm max-w-4xl mx-auto">
          <span>The bot is currently handling this conversation. Click "Take Over" to reply manually.</span>
        </div>
      )}
    </div>
  );
};
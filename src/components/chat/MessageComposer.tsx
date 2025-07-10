import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Smile, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageComposerProps {
  conversationId: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ conversationId }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
      // Here you would send the message to your backend
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
              placeholder="Type a message..."
              className="border-0 bg-transparent resize-none min-h-[40px] focus-visible:ring-0"
              style={{ boxShadow: 'none' }}
            />
            
            {/* Emoji Button */}
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 mr-2"
              onClick={() => console.log('Emoji picker')}
            >
              <Smile className="w-4 h-4 text-gray-500" />
            </Button>
          </div>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim()}
          className={cn(
            "shrink-0",
            message.trim() 
              ? "bg-blue-500 hover:bg-blue-600" 
              : "bg-gray-300 cursor-not-allowed"
          )}
        >
          <Send className="w-4 h-4" />
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

      {/* Quick Actions */}
      <div className="flex gap-2 mt-3 max-w-4xl mx-auto">
        <Button variant="outline" size="sm" className="text-xs">
          <Image className="w-3 h-3 mr-1" />
          Send Image
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          Hand off to Bot
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          Mark Resolved
        </Button>
      </div>
    </div>
  );
};
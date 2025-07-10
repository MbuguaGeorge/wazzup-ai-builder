import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, CheckCheck, Bot, User, UserCheck } from 'lucide-react';

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

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLast }) => {
  const isFromCustomer = message.sender === 'customer';
  const isFromBot = message.sender === 'bot';
  const isFromAgent = message.sender === 'agent';

  const getBubbleStyles = () => {
    if (isFromCustomer) {
      return "bg-blue-500 text-white ml-auto";
    } else if (isFromBot) {
      return "bg-gray-100 text-gray-900";
    } else {
      return "bg-green-100 text-gray-900 border border-green-200";
    }
  };

  const getSenderIcon = () => {
    if (isFromBot) return <Bot className="w-3 h-3" />;
    if (isFromAgent) return <UserCheck className="w-3 h-3" />;
    return <User className="w-3 h-3" />;
  };

  const getSenderLabel = () => {
    if (isFromBot) return "Bot";
    if (isFromAgent) return "Agent";
    return null;
  };

  return (
    <div className={cn("flex gap-2", isFromCustomer ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-xs lg:max-w-md", isFromCustomer && "order-2")}>
        {/* Sender Label */}
        {!isFromCustomer && (
          <div className="flex items-center gap-1 mb-1 ml-2">
            {getSenderIcon()}
            <span className="text-xs text-gray-500">{getSenderLabel()}</span>
          </div>
        )}

        {/* Message Bubble */}
        <div className={cn("rounded-lg px-4 py-2", getBubbleStyles())}>
          {/* Text Content */}
          <p className="text-sm leading-relaxed">{message.content}</p>

          {/* Buttons */}
          {message.type === 'button' && message.buttons && (
            <div className="mt-3 space-y-2">
              {message.buttons.map((button) => (
                <Button
                  key={button.id}
                  variant={button.selected ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "w-full justify-start text-xs",
                    button.selected && "bg-blue-600 text-white",
                    !isFromCustomer && "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  )}
                  disabled={true}
                >
                  {button.text}
                  {button.selected && <Check className="w-3 h-3 ml-2" />}
                </Button>
              ))}
            </div>
          )}

          {/* Selected Option Display */}
          {message.selectedOption && (
            <div className="mt-2 pt-2 border-t border-white/20">
              <div className="flex items-center gap-2 text-xs">
                <Check className="w-3 h-3" />
                <span>Selected: {message.selectedOption}</span>
              </div>
            </div>
          )}

          {/* Image */}
          {message.type === 'image' && message.imageUrl && (
            <div className="mt-2">
              <img 
                src={message.imageUrl} 
                alt="Shared image" 
                className="rounded max-w-full h-auto"
              />
            </div>
          )}
        </div>

        {/* Timestamp and Read Status */}
        <div className={cn(
          "flex items-center gap-1 mt-1 text-xs text-gray-500",
          isFromCustomer ? "justify-end mr-2" : "justify-start ml-2"
        )}>
          <span>{message.timestamp}</span>
          {isFromCustomer && (
            <div className="flex items-center">
              {message.isRead ? (
                <CheckCheck className="w-3 h-3 text-blue-500" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
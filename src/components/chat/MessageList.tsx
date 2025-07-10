import React from 'react';
import { MessageBubble } from './MessageBubble';
import { ScrollArea } from '@/components/ui/scroll-area';

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

export const MessageList: React.FC<MessageListProps> = ({ conversationId }) => {
  // Mock messages data
  const messages: Message[] = [
    {
      id: '1',
      type: 'text',
      content: 'Hi! I need help with my recent order.',
      sender: 'customer',
      timestamp: '9:45 AM',
      isRead: true
    },
    {
      id: '2',
      type: 'text',
      content: 'Hello! I\'d be happy to help you with your order. Can you please provide your order number?',
      sender: 'bot',
      timestamp: '9:45 AM',
      isRead: true
    },
    {
      id: '3',
      type: 'text',
      content: 'My order number is #12345',
      sender: 'customer',
      timestamp: '9:46 AM',
      isRead: true
    },
    {
      id: '4',
      type: 'button',
      content: 'I found your order! What would you like to do?',
      sender: 'bot',
      timestamp: '9:46 AM',
      isRead: true,
      buttons: [
        { id: 'track', text: 'Track Order', selected: true },
        { id: 'cancel', text: 'Cancel Order' },
        { id: 'modify', text: 'Modify Order' }
      ],
      selectedOption: 'Track Order'
    },
    {
      id: '5',
      type: 'text',
      content: 'The tracking shows it\'s delayed. This is really frustrating!',
      sender: 'customer',
      timestamp: '9:48 AM',
      isRead: true
    },
    {
      id: '6',
      type: 'text',
      content: 'I understand your frustration. Let me connect you with our support team who can help resolve this and potentially offer compensation.',
      sender: 'agent',
      timestamp: '10:23 AM',
      isRead: true
    }
  ];

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4 max-w-4xl mx-auto">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isLast={index === messages.length - 1}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
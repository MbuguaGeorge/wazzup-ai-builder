import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { User, Bot, Clock, AlertCircle } from 'lucide-react';

interface Conversation {
  id: string;
  customerName: string;
  customerPhone: string;
  lastMessage: string;
  timestamp: string;
  isUnread: boolean;
  status: 'active' | 'resolved' | 'needs_attention';
  isHandedOff: boolean;
  messageCount: number;
}

interface ConversationSidebarProps {
  botId: string;
  filter: string;
  selectedConversation: string;
  onSelectConversation: (id: string) => void;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  botId,
  filter,
  selectedConversation,
  onSelectConversation
}) => {
  // Mock data - would come from API based on botId and filter
  const conversations: Conversation[] = [
    {
      id: '1',
      customerName: 'John Doe',
      customerPhone: '+1 (555) 123-4567',
      lastMessage: 'I need help with my order',
      timestamp: '2 min ago',
      isUnread: true,
      status: 'needs_attention',
      isHandedOff: true,
      messageCount: 5
    },
    {
      id: '2',
      customerName: 'Sarah Wilson',
      customerPhone: '+1 (555) 234-5678',
      lastMessage: 'Thank you for your help!',
      timestamp: '15 min ago',
      isUnread: false,
      status: 'resolved',
      isHandedOff: false,
      messageCount: 12
    },
    {
      id: '3',
      customerName: 'Mike Johnson',
      customerPhone: '+1 (555) 345-6789',
      lastMessage: 'Can I track my shipment?',
      timestamp: '1 hour ago',
      isUnread: true,
      status: 'active',
      isHandedOff: false,
      messageCount: 3
    },
    {
      id: '4',
      customerName: 'Emma Davis',
      customerPhone: '+1 (555) 456-7890',
      lastMessage: 'What are your store hours?',
      timestamp: '3 hours ago',
      isUnread: false,
      status: 'active',
      isHandedOff: false,
      messageCount: 8
    }
  ];

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'all') return true;
    if (filter === 'active') return conv.status === 'active';
    if (filter === 'resolved') return conv.status === 'resolved';
    if (filter === 'attention') return conv.status === 'needs_attention';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'resolved': return 'bg-gray-500';
      case 'needs_attention': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {filteredConversations.map((conversation) => (
        <div
          key={conversation.id}
          className={cn(
            "p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors",
            selectedConversation === conversation.id && "bg-blue-50 border-blue-200"
          )}
          onClick={() => onSelectConversation(conversation.id)}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className={cn("absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white", getStatusColor(conversation.status))} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 truncate">
                    {conversation.customerName}
                  </h3>
                  {conversation.isHandedOff && (
                    <Badge variant="outline" className="text-xs">
                      <User className="w-3 h-3 mr-1" />
                      Human
                    </Badge>
                  )}
                  {conversation.status === 'needs_attention' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {conversation.customerPhone}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {conversation.timestamp}
              </span>
              {conversation.isUnread && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 truncate flex-1 mr-2">
              {conversation.lastMessage}
            </p>
            <Badge variant="secondary" className="text-xs">
              {conversation.messageCount}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};
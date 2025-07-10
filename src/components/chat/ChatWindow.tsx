import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';
import { User, Bot, Phone, MoreVertical, FileText, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  conversationId: string;
  botId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, botId }) => {
  const [showNotes, setShowNotes] = useState(false);
  const [internalNotes, setInternalNotes] = useState('Customer seems frustrated with shipping delay. Offered 10% discount.');

  // Mock conversation data
  const conversation = {
    id: conversationId,
    customerName: 'John Doe',
    customerPhone: '+1 (555) 123-4567',
    status: 'needs_attention',
    isHandedOff: true,
    handoffTime: '10:23 AM',
    agentName: 'Sarah (You)'
  };

  const handleHandoff = () => {
    // Handle handoff logic
    console.log('Handing off conversation to human agent');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{conversation.customerName}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-3 h-3" />
              {conversation.customerPhone}
              {conversation.isHandedOff && (
                <Badge variant="outline" className="ml-2">
                  <UserCheck className="w-3 h-3 mr-1" />
                  Handed off to {conversation.agentName} at {conversation.handoffTime}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
            className={cn(showNotes && "bg-blue-50 border-blue-200")}
          >
            <FileText className="w-4 h-4 mr-2" />
            Notes
          </Button>
          <Button variant="outline" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-1 min-h-0 overflow-y-auto">
          <MessageList conversationId={conversationId} />
          </div>
          <div className="shrink-0">
          <MessageComposer conversationId={conversationId} />
          </div>
        </div>

        {/* Internal Notes Sidebar */}
        {showNotes && (
          <div className="w-80 border-l border-gray-200 bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Internal Notes</h3>
            <Textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Add internal notes for your team..."
              className="min-h-32 mb-4"
            />
            <Button size="sm" className="w-full">
              Save Notes
            </Button>
            
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-2">Conversation Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="destructive">Needs Attention</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Started:</span>
                  <span>Today, 9:45 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Messages:</span>
                  <span>5 total</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
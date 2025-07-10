import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConversationSidebar} from '@/components/chat/ConversationSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageCircle, Bot, Filter } from 'lucide-react';

const ChatDashboard = () => {
  const [selectedBot, setSelectedBot] = useState('1');
  const [selectedConversation, setSelectedConversation] = useState('1');
  const [filter, setFilter] = useState('all');

  // Mock data - in real app this would come from API
  const bots = [
    { id: '1', name: 'Store Assistant', status: 'active', conversations: 12 },
    { id: '2', name: 'Customer Support Bot', status: 'active', conversations: 8 },
    { id: '3', name: 'Sales Bot', status: 'active', conversations: 15 }
  ];

  const selectedBotData = bots.find(bot => bot.id === selectedBot);

  return (
    <div className="bg-gray-50 h-[100%] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chat Management</h1>
            <p className="text-gray-600 mt-1">Manage customer conversations across all your bots</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedBot} onValueChange={setSelectedBot}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Bot" />
              </SelectTrigger>
              <SelectContent>
                {bots.map((bot) => (
                  <SelectItem key={bot.id} value={bot.id}>
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      {bot.name}
                      <Badge variant="secondary" className="ml-2">
                        {bot.conversations}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">
                {selectedBotData?.name} Conversations
              </h2>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
            <Tabs value={filter} onValueChange={setFilter} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
                <TabsTrigger value="attention">Critical</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ConversationSidebar 
              botId={selectedBot}
              filter={filter}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
            />
          </div>
        </div>
        <div className="flex-1 min-h-0 flex flex-col">
          {selectedConversation ? (
            <ChatWindow 
              conversationId={selectedConversation}
              botId={selectedBot}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a conversation from the sidebar to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatDashboard;
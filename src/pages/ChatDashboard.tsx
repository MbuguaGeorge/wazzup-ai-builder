import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ConversationSidebar} from '@/components/chat/ConversationSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageCircle, Bot, Search } from 'lucide-react';
import { authFetch } from '@/lib/authFetch';

const ChatDashboard = () => {
  const [selectedBot, setSelectedBot] = useState('');
  const [selectedConversation, setSelectedConversation] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    authFetch('http://localhost:8000/api/bots/')
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          const activeBots = data.filter((bot: any) => bot.whatsapp_connected && bot.status === 'active');
          setBots(activeBots);
          if (activeBots.length > 0 && !selectedBot) {
            setSelectedBot(activeBots[0].id.toString());
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedBotData = bots.find(bot => bot.id.toString() === selectedBot);

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
                  <SelectItem key={bot.id} value={bot.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      {bot.name}
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
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
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
              searchQuery={searchQuery}
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
  )
}

export default ChatDashboard;
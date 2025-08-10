import React, { useEffect, useState, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { authFetch } from '@/lib/authFetch';
import { getAccessToken } from '@/lib/auth';
import { io, Socket } from 'socket.io-client';
import { UserCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { API_BASE_URL, WEBSOCKET_URL } from '@/lib/config';

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
  userId: string;
  messages?: any[];
}

interface ConversationSidebarProps {
  botId: string;
  filter: string;
  searchQuery: string;
  selectedConversation: string;
  onSelectConversation: (id: string) => void;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  botId,
  filter,
  searchQuery,
  selectedConversation,
  onSelectConversation
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!botId) return;
    setLoading(true);
    authFetch(`${API_BASE_URL}/api/chat/conversations/${botId}`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          const conversationsWithLastMessage = await Promise.all(
            (data.conversations || []).map(async (conv: any) => {
              try {
                // Get the last message for this conversation
                const messagesRes = await authFetch(`${API_BASE_URL}/api/chat/messages/${conv.conversation_id}`);
                if (messagesRes.ok) {
                  const messagesData = await messagesRes.json();
                  const messages = messagesData.messages || [];
                  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
                  
                  return {
                    id: conv.conversation_id,
                    customerName: conv.user_id,
                    customerPhone: conv.user_id,
                    lastMessage: lastMessage ? lastMessage.content : '',
                    timestamp: new Date(conv.updatedAt).toLocaleString(),
                    isUnread: false,
                    status: 'active',
                    isHandedOff: conv.handover,
                    messageCount: conv.messages_count || messages.length,
                    userId: conv.user_id,
                    messages: messages,
                  };
                }
              } catch (error) {
                console.error('Error fetching messages for conversation:', error);
              }
              
              return {
                id: conv.conversation_id,
                customerName: conv.user_id,
                customerPhone: conv.user_id,
                lastMessage: '',
                timestamp: new Date(conv.updatedAt).toLocaleString(),
      isUnread: false,
      status: 'active',
                isHandedOff: conv.handover,
                messageCount: conv.messages_count || 0,
                userId: conv.user_id,
              };
            })
          );
          setConversations(conversationsWithLastMessage);
          console.log(`📋 Loaded ${conversationsWithLastMessage.length} conversations for bot ${botId}`);
        }
      })
      .catch(error => {
        console.error('Error loading conversations:', error);
      })
      .finally(() => setLoading(false));
  }, [botId]);

  // Socket.IO for real-time updates
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      const socket = io(`${WEBSOCKET_URL}`, {
        auth: { token },
      });
      socketRef.current = socket;

      // Listen for new chat messages
      socket.on('chat_message', (data) => {
        console.log(`📨 ConversationSidebar received chat message:`, data);
        setConversations(prev => {
          const conversationId = data.conversation_id;
          const message = data.message;
          
          // Check if conversation already exists
          const existingConversation = prev.find(conv => conv.id === conversationId);
          
          if (existingConversation) {
            // Update existing conversation
            console.log(`🔄 Updating conversation: ${conversationId} with new message`);
            return prev.map(conv => {
              if (conv.id === conversationId) {
                return {
                  ...conv,
                  lastMessage: message.content,
                  timestamp: new Date(message.timestamp).toLocaleString(),
                  messageCount: conv.messageCount + 1,
                };
              }
              return conv;
            });
          } else {
            // Create new conversation
            console.log(`🆕 Creating new conversation: ${conversationId}`);
            const newConversation: Conversation = {
              id: conversationId,
              customerName: message.from || message.sender,
              customerPhone: message.from || message.sender,
              lastMessage: message.content,
              timestamp: new Date(message.timestamp).toLocaleString(),
      isUnread: false,
      status: 'active',
      isHandedOff: false,
              messageCount: 1,
              userId: message.from || message.sender,
            };
            
            // Add new conversation to the beginning of the list
            return [newConversation, ...prev];
          }
        });
      });
      // Listen for handoff events
      socket.on('handover_request', ({ conversation_id }) => {
        setConversations(prev => prev.map(conv => conv.id === conversation_id ? { ...conv, isHandedOff: true } : conv));
      });
      socket.on('handover_end', ({ conversation_id }) => {
        setConversations(prev => prev.map(conv => conv.id === conversation_id ? { ...conv, isHandedOff: false } : conv));
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, []);

  // Fetch messages for search functionality
  useEffect(() => {
    if (searchQuery && conversations.length > 0) {
      const fetchMessagesForSearch = async () => {
        const conversationsWithMessages = await Promise.all(
          conversations.map(async (conv) => {
            try {
              const res = await authFetch(`${API_BASE_URL}/api/chat/messages/${conv.id}`);
              if (res.ok) {
                const data = await res.json();
                return { ...conv, messages: data.messages || [] };
              }
            } catch (error) {
              console.error('Error fetching messages for search:', error);
            }
            return conv;
          })
        );
        setConversations(conversationsWithMessages);
      };
      fetchMessagesForSearch();
    }
  }, [searchQuery, conversations.length]);

  const filteredConversations = conversations.filter(conv => {
    // First apply status filter
    let passesFilter = true;
    if (filter === 'all') passesFilter = true;
    else if (filter === 'active') passesFilter = conv.status === 'active';
    else if (filter === 'resolved') passesFilter = conv.status === 'resolved';
    else if (filter === 'attention') passesFilter = conv.status === 'needs_attention';
    
    if (!passesFilter) return false;

    // Then apply search filter
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    
    // Search in phone number
    if (conv.customerPhone.toLowerCase().includes(query)) return true;
    
    // Search in messages
    if (conv.messages) {
      return conv.messages.some((msg: any) => 
        msg.content && msg.content.toLowerCase().includes(query)
      );
    }
    
    return false;
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
    <ScrollArea className="flex-1">
      <div className="divide-y">
        {loading && (
          <div className="p-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full mb-2" />
            ))}
          </div>
        )}
        {filteredConversations.map((conv) => (
        <div
            key={conv.id}
          className={cn(
              'p-4 cursor-pointer hover:bg-gray-100',
              selectedConversation === conv.id && 'bg-blue-50'
          )}
            onClick={() => onSelectConversation(conv.id)}
        >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate flex items-center gap-1">
                  {conv.customerPhone.startsWith('+') ? conv.customerPhone : `+${conv.customerPhone}`}
                  {conv.isHandedOff && (
                    <span title="Handed off"><UserCheck className="w-3 h-3 text-green-600" /></span>
                  )}
                </div>
                <div className="text-xs text-gray-500 truncate">{conv.lastMessage}</div>
              </div>
              <div className={cn('w-2 h-2 rounded-full ml-2 flex-shrink-0', getStatusColor(conv.status))} />
            </div>
            <div className="text-xs text-gray-400 mt-1">{conv.timestamp}</div>
          </div>
        ))}
        {!loading && filteredConversations.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'No conversations match your search.' : 'No conversations found.'}
          </div>
        )}
        </div>
    </ScrollArea>
  );
};
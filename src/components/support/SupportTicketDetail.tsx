import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authFetch } from "@/lib/authFetch";
import { cookieFetch } from "@/lib/cookieAuth";
import { API_BASE_URL, WEBSOCKET_URL } from "@/lib/config";
import { io, Socket } from "socket.io-client";
import { 
  MessageSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Send,
  Archive,
  Lock
} from "lucide-react";

interface SupportTicket {
  id: number;
  subject: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  user_full_name: string;
  user_email: string;
  responses: any[];
}

// SupportResponse interface removed - responses will be handled via email

interface SupportTicketDetailProps {
  ticketId: number;
  onClose: () => void;
}

const SupportTicketDetail: React.FC<SupportTicketDetailProps> = ({ ticketId, onClose }) => {
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTicket();
    setupSocket();
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket]);

  const fetchTicket = async () => {
    try {
      const response = await cookieFetch(`${API_BASE_URL}/api/support/tickets/${ticketId}/`);
      if (response.ok) {
        const data = await response.json();
        setTicket(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch ticket details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast({
        title: "Error",
        description: "Failed to fetch ticket details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocket = () => {
    const socketUrl = WEBSOCKET_URL;
    console.log('Connecting to socket:', socketUrl);
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No access token found - real-time features disabled');
      // Don't show error toast, just log warning
      return;
    }
    
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      auth: {
        token: token
      }
    });
    
    newSocket.on('connect', () => {
      console.log('Connected to support socket');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to real-time service. Messages will still work but without real-time updates.",
        variant: "destructive",
      });
    });

    newSocket.on('support_ticket_update', (update) => {
      if (update.ticket_id === ticketId) {
        // Refresh ticket data
        fetchTicket();
        
        // Show notification
        if (update.type === 'admin_response') {
          toast({
            title: "New Response",
            description: `${update.admin_name} responded to your ticket`,
          });
        } else if (update.type === 'status_change') {
          toast({
            title: "Status Updated",
            description: `Ticket status changed to ${update.new_status}`,
          });
        }
      }
    });

    newSocket.on('support_response_error', (error) => {
      toast({
        title: "Error",
        description: error.error,
        variant: "destructive",
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  };

  const getCurrentUserId = (): number => {
    // Get user ID from localStorage or context
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || 0;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    
    try {
      if (socket) {
        // Use socket if available
        socket.emit('support_response', {
          ticket_id: ticketId,
          message: newMessage,
        });
      } else {
        // Fallback to direct API call if no socket
        const response = await cookieFetch(`${API_BASE_URL}/api/support/tickets/${ticketId}/responses/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: newMessage,
            is_internal: false,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }
      }

      setNewMessage("");
      // Refresh ticket to show new message
      fetchTicket();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await cookieFetch(`${API_BASE_URL}/api/support/tickets/${ticketId}/status/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchTicket();
        toast({
          title: "Status Updated",
          description: `Ticket status changed to ${newStatus}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'waiting_for_user':
        return <MessageSquare className="w-4 h-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isResolved = ticket?.status === 'resolved' || ticket?.status === 'closed';
  const isWaitingForUser = ticket?.status === 'waiting_for_user';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Ticket not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(ticket.status)}
              <CardTitle className="text-lg">{ticket.subject}</CardTitle>
              <Badge variant="outline">#{ticket.id}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={ticket.status === 'resolved' ? 'default' : 'secondary'}>
                {ticket.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Category: {ticket.category.replace('_', ' ')}</p>
            <p>Created: {formatDate(ticket.created_at)}</p>
            {ticket.resolved_at && (
              <p>Resolved: {formatDate(ticket.resolved_at)}</p>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Original ticket description */}
        <div className="flex justify-end">
          <div className="bg-blue-500 text-white p-3 rounded-lg max-w-[80%]">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">You</span>
              <span className="text-xs opacity-75">
                {formatDate(ticket.created_at)}
              </span>
            </div>
            <p className="text-sm">{ticket.description}</p>
          </div>
        </div>

        {/* Responses */}
        {ticket.responses?.map((response: any) => (
          <div
            key={response.id}
            className={`flex ${response.is_internal ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`p-3 rounded-lg max-w-[80%] ${
                response.is_internal
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-blue-500 text-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">
                  {response.is_internal ? 'Support Team' : 'You'}
                </span>
                <span className={`text-xs ${response.is_internal ? 'text-gray-500' : 'opacity-75'}`}>
                  {formatDate(response.created_at)}
                </span>
              </div>
              <p className="text-sm">{response.message}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <Card className="mt-4">
        <CardContent className="p-4">
          {isResolved ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span>This ticket is resolved and cannot receive new messages</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                rows={2}
                disabled={isSending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTicketDetail; 
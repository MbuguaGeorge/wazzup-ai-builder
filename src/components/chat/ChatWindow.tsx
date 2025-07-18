import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';
import { User, Bot, Phone, MoreVertical, FileText, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authFetch } from '@/lib/authFetch';
import { io, Socket } from 'socket.io-client';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatWindowProps {
  conversationId: string;
  botId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, botId }) => {
  const [showNotes, setShowNotes] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [conversation, setConversation] = useState<any>(null);
  const [handoffActive, setHandoffActive] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messageListRef = useRef<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);
  const MAX_WORDS = 30;

  // Scroll to bottom when chat is opened or message is sent
  const scrollToBottom = () => {
    if (messageListRef.current && typeof messageListRef.current.scrollToBottom === 'function') {
      messageListRef.current.scrollToBottom();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    authFetch(`http://localhost:3001/api/chat/conversations/${botId}`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          const found = (data.conversations || []).find((c: any) => c.conversation_id === conversationId);
          setConversation(found || null);
        }
      });
    // Always fetch handoff status from backend for persistence
    const fetchHandoff = () => {
      authFetch(`http://localhost:8000/api/flows/handoff/?conversation_id=${conversationId}&bot_id=${botId}`)
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setHandoffActive(data.handoff_active);
          }
        });
    };
    fetchHandoff();
  }, [conversationId, botId]);

  // Socket.IO for real-time handoff updates
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token || !conversationId) return;
    const socket = io('http://localhost:3001', {
      auth: { token },
    });
    socketRef.current = socket;
    socket.emit('join_conversation', { conversation_id: conversationId });
    socket.on('handover_request', ({ conversation_id }) => {
      if (conversation_id === conversationId) setHandoffActive(true);
    });
    socket.on('handover_end', ({ conversation_id }) => {
      if (conversation_id === conversationId) setHandoffActive(false);
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId]);

  // Fetch notes for this conversation
  useEffect(() => {
    if (!conversationId) return;
    setNotesLoading(true);
    authFetch(`http://localhost:3001/api/chat/conversations/${conversationId}/notes`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setNotes(data.notes || []);
        }
      })
      .finally(() => setNotesLoading(false));
  }, [conversationId]);

  // Save note
  const handleSaveNote = async () => {
    const trimmed = noteInput.trim();
    if (!trimmed) return;
    if (trimmed.split(/\s+/).length > MAX_WORDS) return;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const author = user.email || 'Unknown';
    await authFetch(`http://localhost:3001/api/chat/conversations/${conversationId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: trimmed, author }),
    });
    setNoteInput('');
    // Refresh notes
    setNotesLoading(true);
    authFetch(`http://localhost:3001/api/chat/conversations/${conversationId}/notes`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setNotes(data.notes || []);
        }
      })
      .finally(() => setNotesLoading(false));
  };

  const handleToggleHandoff = async () => {
    const newActive = !handoffActive;
    // Update backend
    await authFetch('http://localhost:8000/api/flows/handoff/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id: conversationId, bot_id: botId, active: newActive }),
    });
    // Always fetch handoff state from backend after toggle
    authFetch(`http://localhost:8000/api/flows/handoff/?conversation_id=${conversationId}&bot_id=${botId}`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setHandoffActive(data.handoff_active);
        }
      });
    // Emit socket event for real-time update
    if (socketRef.current) {
      if (newActive) {
        socketRef.current.emit('handover_request', { conversation_id: conversationId });
      } else {
        socketRef.current.emit('handover_end', { conversation_id: conversationId });
      }
    }
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
            <h2 className="font-semibold text-gray-900">{conversation?.user_id || 'Customer'}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-3 h-3" />
              {conversation?.user_id || ''}
              {handoffActive && (
                <Badge variant="outline" className="ml-2">
                  <UserCheck className="w-3 h-3 mr-1" />
                  Handed off
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
          <Button
            variant={handoffActive ? 'destructive' : 'default'}
            size="sm"
            onClick={handleToggleHandoff}
          >
            {handoffActive ? 'End Handoff' : 'Take Over'}
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
            <MessageList ref={messageListRef} conversationId={conversationId} />
          </div>
          <div className="shrink-0">
            <MessageComposer conversationId={conversationId} botId={botId} handoffActive={handoffActive} onMessageSent={scrollToBottom} userId={conversation?.user_id} />
          </div>
        </div>
        {/* Internal Notes Sidebar */}
        {showNotes && (
          <div className="w-80 border-l border-gray-200 bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Internal Notes</h3>
            {/* Notes List */}
            {notesLoading ? (
              <div className="space-y-2 mb-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {notes.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No notes yet.</div>
                ) : (
                  notes.slice().reverse().map((note, idx) => (
                    <div key={idx} className="bg-accent rounded p-2 text-xs flex flex-col">
                      {/* <div className="font-medium text-foreground mb-1">{note.author}</div> */}
                      <div className="mb-1">{note.content}</div>
                      <div className="text-muted-foreground text-[10px]">{new Date(note.timestamp).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            )}
            {/* Note Input at the bottom */}
            <div className="gap-2 mt-2">
            <Textarea
              className="min-h-32 mb-4"
                placeholder={`Add internal notes (max ${MAX_WORDS} words)`}
                value={noteInput}
                onChange={e => {
                  const val = e.target.value;
                  if (val.trim().split(/\s+/).length <= MAX_WORDS) setNoteInput(val);
                }}
                maxLength={300}
              />
              <Button
                className="bg-primary text-white rounded px-3 py-1 text-sm w-full"
                onClick={handleSaveNote}
                disabled={!noteInput.trim() || noteInput.trim().split(/\s+/).length > MAX_WORDS}
                size='sm'
              >
              Save Notes
            </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
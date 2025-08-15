import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { authFetch } from '@/lib/authFetch';
import { cookieFetch, cookieAuth } from '@/lib/cookieAuth';
import { API_BASE_URL, WEBSOCKET_URL } from '@/lib/config';
import { io, Socket } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  bot_id?: number;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotificationContext must be used within NotificationProvider');
  return ctx;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [authMethod, setAuthMethod] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Helper: sort and deduplicate notifications
  const mergeNotifications = useCallback((incoming: Notification[]) => {
    const map = new Map<number, Notification>();
    for (const n of [...incoming, ...notifications]) {
      map.set(n.id, { ...map.get(n.id), ...n }); // incoming wins
    }
    const arr = Array.from(map.values());
    arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return arr;
  }, [notifications]);

  // Helper: recalculate unread count
  const recalcUnread = useCallback((list: Notification[]) => {
    return list.filter(n => !n.is_read).length;
  }, []);

  // Get userId from JWT
  const getUserIdFromToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const userId = decoded.user_id || decoded.id || decoded.sub || null;
        return userId;
      } catch (error) {
        console.error('🔍 Error decoding token:', error);
        return null;
      }
    }
    return null;
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    // Only fetch if user is authenticated
    if (!userId) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await cookieFetch(`${API_BASE_URL}/api/notifications/?page_size=50`);
      if (res.ok) {
        const data = await res.json();
        const sorted = [...data.results].sort((a: Notification, b: Notification) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setNotifications(sorted);
        setUnreadCount(sorted.filter((n: Notification) => !n.is_read).length);
      } else {
        console.error('📡 Failed to fetch notifications:', res.status);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mark a single notification as read
  const markAsRead = useCallback(async (id: number) => {
    // Only mark as read if user is authenticated
    if (!userId) return;
    
    try {
      const res = await cookieFetch(`${API_BASE_URL}/api/notifications/${id}/read/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true })
      });
      if (res.ok) {
        setNotifications(prev => {
          const updated = prev.map(n => n.id === id ? { ...n, is_read: true } : n);
          setUnreadCount(updated.filter(n => !n.is_read).length);
          return updated;
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [userId]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    // Only mark all as read if user is authenticated
    if (!userId) return;
    
    try {
      const res = await cookieFetch(`${API_BASE_URL}/api/notifications/mark-all-read/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setNotifications(prev => {
          const updated = prev.map(n => n.is_read ? n : { ...n, is_read: true });
      setUnreadCount(0);
          return updated;
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [userId]);

  // Manual refresh (or on tab focus)
  const refreshAll = useCallback(async () => {
    // Only refresh if user is authenticated
    if (!userId) return;
    await fetchNotifications();
  }, [fetchNotifications, userId]);

  // Listen for authentication changes and token refresh events
  useEffect(() => {
    const checkAuth = () => {
      const newUserId = getUserIdFromToken();
      const currentAuthMethod = localStorage.getItem('auth_method');
      setUserId(newUserId);
      setAuthMethod(currentAuthMethod);
    };

    // Check on mount
    checkAuth();

    // Listen for storage changes (login/logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'auth_method') {
        checkAuth();
      }
    };

    // Listen for custom login/logout events
    const handleAuthChange = (e: Event) => {
      checkAuth();
    };

    // Listen for session refresh events (Issue 1 fix)
    const handleSessionRefresh = async () => {
      console.log('🔄 Session refreshed, updating socket authentication...');
      const currentAuthMethod = localStorage.getItem('auth_method');
      
      if (currentAuthMethod === 'session' && socketRef.current) {
        // For session users, regenerate JWT token for socket
        try {
          const response = await cookieFetch(`${API_BASE_URL}/api/session/to-jwt/`, {
            method: 'POST',
          });
          
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('refresh', data.refresh);
            
            // Reconnect socket with new token
            if (socketRef.current) {
              console.log('🔌 Reconnecting socket with refreshed token...');
              socketRef.current.disconnect();
              socketRef.current = null;
              // Socket will be recreated by the useEffect below
            }
          }
        } catch (error) {
          console.error('❌ Failed to refresh JWT token for socket:', error);
        }
      }
    };

    // Poll for token changes (fallback)
    const pollInterval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      const currentUserId = getUserIdFromToken();
      const currentAuthMethod = localStorage.getItem('auth_method');
      
      if (currentUserId !== userId || currentAuthMethod !== authMethod) {
        setUserId(currentUserId);
        setAuthMethod(currentAuthMethod);
      }
    }, 1000);

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('login', handleAuthChange);
    window.addEventListener('logout', handleAuthChange);
    window.addEventListener('session:refresh', handleSessionRefresh);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('login', handleAuthChange);
      window.removeEventListener('logout', handleAuthChange);
      window.removeEventListener('session:refresh', handleSessionRefresh);
      clearInterval(pollInterval);
    };
  }, [getUserIdFromToken, userId, authMethod]);

  // Fetch notifications when userId changes (login/logout)
  useEffect(() => {
    if (userId) {
    fetchNotifications();
    } else {
      // Clear notifications when user logs out
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
    }
  }, [userId, fetchNotifications]);

  // Periodic authentication check to detect expired sessions
  useEffect(() => {
    const checkAuthPeriodically = async () => {
      if (userId) {
        try {
          const authStatus = await cookieAuth.isAuthenticated();
          if (!authStatus.authenticated) {
            console.log('🔐 User no longer authenticated, logging out...');
            await cookieAuth.forceLogout();
          } else {
            // Auto-refresh session if expiring soon
            await cookieAuth.autoRefreshSession();
          }
        } catch (error) {
          console.error('Periodic auth check failed:', error);
          await cookieAuth.forceLogout();
        }
      }
    };

    // Check every 2 minutes
    const interval = setInterval(checkAuthPeriodically, 120000);
    
    return () => clearInterval(interval);
  }, [userId]);

  // Refetch on tab focus - only if authenticated
  useEffect(() => {
    const onFocus = () => {
      if (userId) {
    fetchNotifications();
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchNotifications, userId]);

  // Socket connection and real-time updates - only if authenticated
  useEffect(() => {
    if (!userId) {
      // Disconnect socket when user logs out
      if (socketRef.current) {
        console.log('🔌 Disconnecting socket due to no userId');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }
    
    if (!socketRef.current) {
      // Check for both JWT token and session authentication
      const token = localStorage.getItem('token');
      const currentAuthMethod = localStorage.getItem('auth_method');
      
      // Only connect if we have authentication
      if (!token && currentAuthMethod !== 'session') {
        console.log('🔌 No authentication found, skipping socket connection');
        return;
      }
      
      const socket: Socket = io(`${WEBSOCKET_URL}`, {
        auth: { token: token || 'session' }, // Use token or 'session' for cookie auth
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });
      
      socket.on('connect', () => {
        console.log('🔌 Socket connected with auth method:', currentAuthMethod);
        socket.emit('join', `user_${userId}`);
      });
      
      socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        // If auth error, disconnect socket
        if (error.message && error.message.includes('auth')) {
          console.log('🔌 Authentication error, disconnecting socket');
          socket.disconnect();
        }
      });
      
      socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
      });
      
      socket.on('notification', (payload) => {
        if (payload && payload.id) {
          setNotifications(prev => {
            // If exists, update; else, prepend
            let found = false;
            const updated = prev.map(n => {
              if (n.id === payload.id) {
                found = true;
                return { ...n, ...payload, is_read: Boolean(payload.is_read) };
              }
              return n;
            });
            if (!found) {
              updated.unshift({ ...payload, is_read: Boolean(payload.is_read) });
            }
            updated.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setUnreadCount(updated.filter(n => !n.is_read).length);
            return updated;
          });
        }
      });
      
      socketRef.current = socket;
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId, authMethod]); // Added authMethod as dependency

  // Listen for logout events to disconnect socket
  useEffect(() => {
    const handleLogout = () => {
      console.log('🔌 Logout event received, disconnecting socket');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      // Clear notifications
      setNotifications([]);
      setUnreadCount(0);
    };

    window.addEventListener('auth:logout', handleLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 
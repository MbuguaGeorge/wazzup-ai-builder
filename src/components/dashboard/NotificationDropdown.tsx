import React, { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { authFetch } from '@/lib/authFetch';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/config';

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}

export const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/notifications/?page_size=4`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.results);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    const res = await authFetch(`${API_BASE_URL}/api/notifications/?unread=true&page_size=1`);
    if (res.ok) {
      const data = await res.json();
      setUnreadCount(data.count);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const markAsRead = async (id: number) => {
    await authFetch(`${API_BASE_URL}/api/notifications/${id}/read/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_read: true })
    });
    fetchNotifications();
    fetchUnreadCount();
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    await authFetch(`${API_BASE_URL}/api/notifications/mark-all-read/`, { method: 'POST' });
    fetchNotifications();
    fetchUnreadCount();
    setMarkingAll(false);
  };

  const handleNotificationClick = async (id: number) => {
    // Mark as read first, then navigate and close dropdown
    await markAsRead(id);
    setIsOpen(false);
    navigate(`/dashboard/notifications?id=${id}`);
  };

  const handleSeeAllClick = () => {
    setIsOpen(false);
    navigate('/dashboard/notifications');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="p-4 flex items-center justify-between">
          <h4 className="text-sm font-medium">Notifications</h4>
          <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={markingAll || unreadCount === 0}>
            {markingAll ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <CheckCheck className="mr-2 h-4 w-4" />} Mark all as read
          </Button>
        </div>
        <Separator />
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No notifications</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={
                  'p-4 border-b last:border-b-0 cursor-pointer transition ' +
                  (n.is_read ? 'bg-background' : 'bg-accent/30')
                }
                onClick={() => handleNotificationClick(n.id)}
                tabIndex={0}
                role="button"
                aria-label={n.title}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm truncate">{n.title}</span>
                  {!n.is_read && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-500" />}
                </div>
                <div className="text-xs text-muted-foreground truncate">{n.message}</div>
                <div className="text-xs text-muted-foreground mt-1">{formatTime(n.created_at)}</div>
              </div>
            ))
          )}
        </div>
        <Separator />
        <div className="p-2 text-center">
          <Button variant="outline" size="sm" onClick={handleSeeAllClick}>
            See all
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown; 
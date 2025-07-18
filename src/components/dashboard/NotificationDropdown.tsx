import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useNotificationContext } from '@/contexts/NotificationContext';

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
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotificationContext();

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

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
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
          <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        </div>
        <Separator />
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full mb-2" />
              ))}
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
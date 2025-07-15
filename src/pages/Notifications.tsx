import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, XCircle, CheckCircle, Info } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { useLocation } from 'react-router-dom';
import { useNotificationContext } from '@/contexts/NotificationContext';

const notificationTypes = {
  warning: { icon: AlertTriangle, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  error: { icon: XCircle, color: "text-red-500", bgColor: "bg-red-500/10" },
  success: { icon: CheckCircle, color: "text-green-500", bgColor: "bg-green-500/10" },
  info: { icon: Info, color: "text-blue-500", bgColor: "bg-blue-500/10" },
};

function getTypeInfo(type: string) {
  // Map backend types to UI types
  if (type === 'bot_offline') return notificationTypes.error;
  if (type === 'bot_online') return notificationTypes.success;
  if (type === 'message_failure') return notificationTypes.warning;
  if (type === 'new_message' || type === 'new_chat') return notificationTypes.info;
  if (type === 'whatsapp_connected') return notificationTypes.success;
  if (type === 'whatsapp_disconnected') return notificationTypes.error;
  if (type === 'bot_created' || type === 'bot_duplicated') return notificationTypes.success;
  if (type === 'bot_deleted') return notificationTypes.error;
  if (type === 'flow_published') return notificationTypes.success;
  if (type === 'flow_archived') return notificationTypes.warning;
  return notificationTypes.info;
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Notifications = () => {
  const query = useQuery();
  const highlightId = query.get('id');

  const {
    notifications,
    loading,
    markAllAsRead,
    markAsRead,
  } = useNotificationContext();
  const [markingAll, setMarkingAll] = React.useState(false);

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    await markAllAsRead();
    setMarkingAll(false);
  };

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your bot activities</p>
        </div>
        <Button variant="outline" onClick={handleMarkAllAsRead} disabled={markingAll}>{markingAll ? 'Marking...' : 'Mark All as Read'}</Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 border rounded-lg">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No new notifications</h3>
            <p className="text-muted-foreground">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const typeInfo = getTypeInfo(notification.type);
            const isHighlighted = String(notification.id) === highlightId;
            return (
              <Card
                key={notification.id}
                className={cn(
                  'transition-all flex items-start p-4 gap-4 cursor-pointer',
                  !notification.is_read && 'bg-accent',
                  isHighlighted && 'ring-2 ring-primary/80 ring-offset-2'
                )}
                onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                tabIndex={0}
                role="button"
                aria-label={notification.title}
              >
                <div className={cn("p-2 rounded-lg mt-1", typeInfo.bgColor)}>
                  <typeInfo.icon className={cn("h-5 w-5", typeInfo.color)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">{notification.title}</h3>
                    {!notification.is_read && (
                      <div className="w-2.5 h-2.5 bg-primary rounded-full" title="Unread"></div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(notification.created_at).toLocaleString()}</p>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
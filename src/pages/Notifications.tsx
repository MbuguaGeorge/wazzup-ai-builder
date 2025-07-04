import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, XCircle, CheckCircle, Info } from "lucide-react";
import React from 'react';
import { cn } from "@/lib/utils";

const notificationsData = [
  {
    id: "1",
    title: "Bot Performance Alert",
    message: "Customer Support Bot response time increased by 20%",
    time: "2 hours ago",
    type: "warning",
    read: false,
  },
  {
    id: "2", 
    title: "New Message Received",
    message: "Sales Assistant received 15 new messages",
    time: "4 hours ago",
    type: "info",
    read: false,
  },
  {
    id: "3",
    title: "Bot Offline",
    message: "FAQ Bot went offline due to API limits",
    time: "1 day ago", 
    type: "error",
    read: true,
  },
  {
    id: "4",
    title: "Weekly Report",
    message: "Your bot analytics report is ready",
    time: "2 days ago",
    type: "success",
    read: true,
  },
];

const notificationTypes = {
  warning: { icon: AlertTriangle, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  error: { icon: XCircle, color: "text-red-500", bgColor: "bg-red-500/10" },
  success: { icon: CheckCircle, color: "text-green-500", bgColor: "bg-green-500/10" },
  info: { icon: Info, color: "text-blue-500", bgColor: "bg-blue-500/10" },
};


const Notifications = () => {
  const [notifications, setNotifications] = React.useState(notificationsData);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({...n, read: true})));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your bot activities</p>
        </div>
        <Button variant="outline" onClick={markAllAsRead}>Mark All as Read</Button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => {
          const typeInfo = notificationTypes[notification.type as keyof typeof notificationTypes] || notificationTypes.info;
          return (
            <Card 
              key={notification.id} 
              className={cn(
                'transition-all flex items-start p-4 gap-4', 
                !notification.read && 'bg-accent'
              )}
            >
              <div className={cn("p-2 rounded-lg mt-1", typeInfo.bgColor)}>
                <typeInfo.icon className={cn("h-5 w-5", typeInfo.color)} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">{notification.title}</h3>
                    {!notification.read && (
                      <div className="w-2.5 h-2.5 bg-primary rounded-full" title="Unread"></div>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
              </div>
            </Card>
          )
        })}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No new notifications</h3>
          <p className="text-muted-foreground">You're all caught up!</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, User, LifeBuoy, Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import logo from '@/images/wozza.png';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

const notifications = [
    {
        title: "New feature alert: AI-powered responses!",
        description: "Your bots can now leverage the latest AI models to provide...",
        time: "15m ago"
    },
    {
        title: "Flow 'Customer Survey' has a high drop-off rate.",
        description: "Consider reviewing the flow analytics to improve user engagement.",
        time: "1h ago"
    },
    {
        title: "Bot 'Sales Demo' has been successfully connected.",
        description: "You can now start building flows for your new bot.",
        time: "3h ago"
    },
    {
        title: "Your subscription is due for renewal soon.",
        description: "To avoid service interruptions, please update your billing details.",
        time: "1d ago"
    }
];

const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    avatarUrl: '',
  });
  const [notificationCount, setNotificationCount] = useState(notifications.length);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    navigate('/login');
  };

  const handleMarkAllAsRead = () => {
    setNotificationCount(0);
  };

  const handleViewAll = () => {
    navigate('/dashboard/notifications');
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                        <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                            {notificationCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
                <div className="p-4">
                    <h4 className="text-sm font-medium">Notifications</h4>
                </div>
                <Separator />
                <div className="max-h-80 overflow-y-auto">
                    {notifications.slice(0, 3).map((notification, index) => (
                        <div key={index} className="p-4 hover:bg-accent">
                            <h5 className="text-sm font-medium truncate">{notification.title}</h5>
                            <p className="text-xs text-muted-foreground truncate">{notification.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                    ))}
                    {notifications.length > 3 && (
                        <div className="p-4 text-center text-sm text-muted-foreground">...</div>
                    )}
                </div>
                <Separator />
                <div className='p-2 flex justify-between items-center'>
                    <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                        <CheckCheck className="mr-2 h-4 w-4" /> Mark all as read
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleViewAll}>View all</Button>
                </div>
            </PopoverContent>
          </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback>
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
              <DropdownMenuItem>
                <LifeBuoy className="mr-2 h-4 w-4" />
                Support
              </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader; 
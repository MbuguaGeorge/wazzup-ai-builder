import React, { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, User, LifeBuoy, Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import { authFetch } from '@/lib/authFetch';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

// Random avatar options
const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1472996457855658f44?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-15070032111690a1dd72282?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-149479010875526161286?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-150064876779100dcc9943?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-14387616810336461ad8d80?w=150&h=150&fit=crop&crop=face',
];

const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  const [user, setUser] = useState({
    name: 'User',
    email: '',
    avatarUrl: AVATAR_OPTIONS[0],
  });

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await authFetch('http://localhost:8000/api/me/');
        if (res.ok) {
          const userData = await res.json();
          setUser({
            name: userData.full_name || 'User',
            email: userData.email || '',
            avatarUrl: AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)],
          });
          localStorage.setItem('user', JSON.stringify(userData));
          return;
        }
      } catch (e) {
        // fallback to localStorage
      }
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser({
            name: parsedUser.full_name || 'User',
            email: parsedUser.email || '',
            avatarUrl: AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)],
          });
        } catch (error) {
          setUser({
            name: 'User',
            email: '',
            avatarUrl: AVATAR_OPTIONS[0],
          });
        }
      } else {
        setUser({
          name: 'User',
          email: '',
          avatarUrl: AVATAR_OPTIONS[0],
        });
      }
    }
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSupportClick = () => {
    navigate('/dashboard/support');
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
          <NotificationDropdown />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
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
            <DropdownMenuItem onClick={handleSupportClick}>
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
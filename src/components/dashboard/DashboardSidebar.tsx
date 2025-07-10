import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Bot,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  BarChart,
  FileCode,
  Bell,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/images/wozza.png';

const DashboardSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navItems = [
    {
      title: 'My Bots',
      icon: Bot,
      href: '/dashboard',
    },
    {
      title: 'Chat Management',
      icon: MessageCircle,
      href: '/dashboard/chat-management',
    },
    {
      title: 'Flow Templates',
      icon: FileCode,
      href: '/dashboard/templates',
    },
    {
      title: 'Notifications',
      icon: Bell,
      href: '/dashboard/notifications',
    },
    {
      title: 'Billing',
      icon: CreditCard,
      href: '/dashboard/billing',
    },
    {
      title: 'Usage',
      icon: BarChart,
      href: '/dashboard/usage',
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
    },
  ];

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-300',
      'hover:bg-accent hover:text-accent-foreground',
      isActive
        ? 'bg-accent text-accent-foreground'
        : 'text-muted-foreground',
      collapsed && 'justify-center px-2'
    );

  return (
    <div
      className={cn(
        'flex h-screen flex-col border-r bg-background transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className={cn('flex items-center transition-all duration-300', collapsed ? 'justify-center p-3' : 'justify-between p-5')}> 
        <div className="flex items-center gap-0 font-semibold">
          <img src={logo} alt="wozza logo" className="h-10 w-10 rounded-lg bg-primary object-cover" />
          {!collapsed && <span className="text-xl ml-2">wozza</span>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn('ml-2', collapsed && 'rotate-180')}
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>

      <div className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/dashboard'}
            className={getNavLinkClass}
          >
            <item.icon className="h-5 w-5" />
            {!collapsed && <span className="ml-2">{item.title}</span>}
          </NavLink>
        ))}
      </div>

      <div className={cn('border-t p-3', collapsed && 'flex justify-center p-2')}> 
        <Button variant="ghost" className={cn('w-full justify-start gap-3', collapsed && 'w-10 justify-center p-0')} size="sm">
          <LogOut className="h-5 w-5" />
          {!collapsed && 'Logout'}
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar; 
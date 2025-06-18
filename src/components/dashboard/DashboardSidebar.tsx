import React from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/images/wozza.png';

const DashboardSidebar = () => {
  const navItems = [
    {
      title: 'My Bots',
      icon: Bot,
      href: '/dashboard',
    },
    {
      title: 'Flow Templates',
      icon: FileCode,
      href: '/dashboard/templates',
    },
    {
      title: 'Billing',
      icon: CreditCard,
      href: '/dashboard/billing',
    },
    {
      title: 'Notifications',
      icon: Bell,
      href: '/dashboard/notifications',
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

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="p-5">
        <div className="flex items-center gap-0 font-semibold">
          <img src={logo} alt="wozzy logo" className="h-10 w-10 rounded-lg bg-primary object-cover" />
          <span className="text-xl">wozza</span>
        </div>
      </div>

      <div className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </NavLink>
        ))}
      </div>

      <div className="border-t p-3">
        <Button variant="ghost" className="w-full justify-start gap-3" size="sm">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar; 
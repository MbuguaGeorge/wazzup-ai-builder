import React, { useEffect, useState } from 'react';
import { Mail, MessageSquare, Smartphone, Bot, Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { authFetch } from '@/lib/authFetch';
import { cookieFetch } from '@/lib/cookieAuth';
import { API_BASE_URL } from '@/lib/config';

// Map frontend keys to backend fields
const FIELD_MAP = {
  emailNotifications: 'email_notifications',
  smsNotifications: 'sms_notifications',
  inAppNotifications: 'in_app_notifications',
  marketingEmails: 'marketing_emails',
  platformUpdates: 'platform_updates',
  botActivity: 'bot_activity',
  botOnlineOffline: 'bot_online_offline',
  newMessages: 'new_messages',
  failedDelivery: 'failed_delivery',
  newChatStarted: 'new_chat_started',
};

const REVERSE_FIELD_MAP = Object.fromEntries(
  Object.entries(FIELD_MAP).map(([k, v]) => [v, k])
);

export const NotificationSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true,
    marketingEmails: false,
    platformUpdates: true,
    botActivity: true,
    botOnlineOffline: true,
    newMessages: true,
    failedDelivery: true,
    newChatStarted: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch settings from backend on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await cookieFetch(`${API_BASE_URL}/api/notification-settings/`);
        
        if (res.ok) {
          const data = await res.json();
          
          // Convert backend field names (snake_case) to frontend field names (camelCase)
          const mappedSettings = {};
          Object.entries(REVERSE_FIELD_MAP).forEach(([backendField, frontendField]) => {
            if (backendField in data) {
              mappedSettings[frontendField] = data[backendField];
            }
          });
          
          setSettings(prevSettings => ({ ...prevSettings, ...mappedSettings }));
        } else {
          const errorText = await res.text();
          toast({ 
            title: 'Error', 
            description: `Failed to load notification settings (${res.status})`, 
            variant: 'destructive' 
          });
        }
      } catch (error) {
        toast({ 
          title: 'Error', 
          description: 'Failed to load notification settings - network error', 
          variant: 'destructive' 
        });
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
    // eslint-disable-next-line
  }, []);

  // PATCH backend on toggle
  const handleSettingChange = async (setting: string, value: boolean) => {
    const backendField = FIELD_MAP[setting];
    const prev = settings[setting];
    
    
    setSettings((s) => ({ ...s, [setting]: value }));
    try {
      const res = await cookieFetch(`${API_BASE_URL}/api/notification-settings/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [backendField]: value }),
      });
      
      if (res.ok) {
        const updatedData = await res.json();
        toast({ 
          title: 'Success', 
          description: 'Notification setting updated',
          duration: 2000
        });
      } else {
        console.error('❌ Failed to update notification setting:', res.status, res.statusText);
        setSettings((s) => ({ ...s, [setting]: prev }));
        toast({ title: 'Error', description: 'Failed to update notification setting', variant: 'destructive' });
      }
    } catch (e) {
      console.error('❌ Error updating notification setting:', e);
      setSettings((s) => ({ ...s, [setting]: prev }));
      toast({ title: 'Error', description: 'Failed to update notification setting', variant: 'destructive' });
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await cookieFetch(`${API_BASE_URL}/api/notification-settings/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast({ title: 'Success', description: 'Notification settings updated successfully' });
      } else {
        toast({ title: 'Error', description: 'Failed to update notification settings', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({ title: 'Error', description: 'Failed to update notification settings', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* General Notifications */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">General Notifications</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="font-medium">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="font-medium">WhatsApp Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive critical notifications via WhatsApp</p>
              </div>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={(value) => handleSettingChange('smsNotifications', value)}
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="font-medium">In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">Show notifications within the application</p>
              </div>
            </div>
            <Switch
              checked={settings.inAppNotifications}
              onCheckedChange={(value) => handleSettingChange('inAppNotifications', value)}
              disabled={loading}
            />
          </div>
        </div>
      </div>
      <Separator />
      {/* Marketing & Updates */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Marketing & Updates</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="font-medium">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">Receive promotional emails and product updates</p>
            </div>
            <Switch
              checked={settings.marketingEmails}
              onCheckedChange={(value) => handleSettingChange('marketingEmails', value)}
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="font-medium">Platform Updates</Label>
              <p className="text-sm text-muted-foreground">Important platform updates and maintenance notifications</p>
            </div>
            <Switch
              checked={settings.platformUpdates}
              onCheckedChange={(value) => handleSettingChange('platformUpdates', value)}
              disabled={loading}
            />
          </div>
        </div>
      </div>
      <Separator />
      {/* Bot Activity */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Bot className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Bot Activity Notifications</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="font-medium">Bot Online/Offline Status</Label>
              <p className="text-sm text-muted-foreground">Get notified when your bots go online or offline</p>
            </div>
            <Switch
              checked={settings.botOnlineOffline}
              onCheckedChange={(value) => handleSettingChange('botOnlineOffline', value)}
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="font-medium">New Messages Received</Label>
              <p className="text-sm text-muted-foreground">Notify when your bot receives new messages</p>
            </div>
            <Switch
              checked={settings.newMessages}
              onCheckedChange={(value) => handleSettingChange('newMessages', value)}
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="font-medium">Message Failed to Deliver</Label>
              <p className="text-sm text-muted-foreground">Get alerts when messages fail to deliver</p>
            </div>
            <Switch
              checked={settings.failedDelivery}
              onCheckedChange={(value) => handleSettingChange('failedDelivery', value)}
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="font-medium">New Chat Started</Label>
              <p className="text-sm text-muted-foreground">Notify when new conversations are initiated with your bot</p>
            </div>
            <Switch
              checked={settings.newChatStarted}
              onCheckedChange={(value) => handleSettingChange('newChatStarted', value)}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
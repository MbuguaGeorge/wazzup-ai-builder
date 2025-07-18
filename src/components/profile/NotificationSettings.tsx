import React, { useState } from 'react';
import { Mail, MessageSquare, Smartphone, Bot, Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export const NotificationSettings = () => {
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

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleSaveSettings = () => {
    console.log('Saving notification settings:', settings);
    // Here you would save to your backend
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
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="font-medium">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive critical notifications via SMS
                </p>
              </div>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={(value) => handleSettingChange('smsNotifications', value)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="font-medium">In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications within the application
                </p>
              </div>
            </div>
            <Switch
              checked={settings.inAppNotifications}
              onCheckedChange={(value) => handleSettingChange('inAppNotifications', value)}
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
              <p className="text-sm text-muted-foreground">
                Receive promotional emails and product updates
              </p>
            </div>
            <Switch
              checked={settings.marketingEmails}
              onCheckedChange={(value) => handleSettingChange('marketingEmails', value)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="font-medium">Platform Updates</Label>
              <p className="text-sm text-muted-foreground">
                Important platform updates and maintenance notifications
              </p>
            </div>
            <Switch
              checked={settings.platformUpdates}
              onCheckedChange={(value) => handleSettingChange('platformUpdates', value)}
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
              <p className="text-sm text-muted-foreground">
                Get notified when your bots go online or offline
              </p>
            </div>
            <Switch
              checked={settings.botOnlineOffline}
              onCheckedChange={(value) => handleSettingChange('botOnlineOffline', value)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="font-medium">New Messages Received</Label>
              <p className="text-sm text-muted-foreground">
                Notify when your bot receives new messages
              </p>
            </div>
            <Switch
              checked={settings.newMessages}
              onCheckedChange={(value) => handleSettingChange('newMessages', value)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="font-medium">Message Failed to Deliver</Label>
              <p className="text-sm text-muted-foreground">
                Get alerts when messages fail to deliver
              </p>
            </div>
            <Switch
              checked={settings.failedDelivery}
              onCheckedChange={(value) => handleSettingChange('failedDelivery', value)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="font-medium">New Chat Started</Label>
              <p className="text-sm text-muted-foreground">
                Notify when new conversations are initiated with your bot
              </p>
            </div>
            <Switch
              checked={settings.newChatStarted}
              onCheckedChange={(value) => handleSettingChange('newChatStarted', value)}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSaveSettings}>
          Save Notification Settings
        </Button>
      </div>
    </div>
  );
};
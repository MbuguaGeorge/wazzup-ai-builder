import React, { useState } from 'react';
import { Key, Smartphone, Monitor, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const SecuritySettings = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const activeSessions = [
    {
      id: 1,
      device: 'MacBook Pro',
      location: 'New York, US',
      lastActive: '2 minutes ago',
      current: true,
    },
    {
      id: 2,
      device: 'iPhone 14',
      location: 'New York, US',
      lastActive: '1 hour ago',
      current: false,
    },
    {
      id: 3,
      device: 'Chrome on Windows',
      location: 'Chicago, US',
      lastActive: '2 days ago',
      current: false,
    },
  ];

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordSubmit = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // Handle password change
    console.log('Changing password...');
    setShowPasswordForm(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const terminateSession = (sessionId: number) => {
    console.log('Terminating session:', sessionId);
  };

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Key className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Password</h3>
        </div>
        
        {!showPasswordForm ? (
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
            </div>
            <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
              Change Password
            </Button>
          </div>
        ) : (
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              />
            </div>
            <div className="flex space-x-3">
              <Button onClick={handlePasswordSubmit}>Update Password</Button>
              <Button variant="outline" onClick={() => setShowPasswordForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Two-Factor Authentication */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Smartphone className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
        </div>
        
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <p className="font-medium">
              Two-Factor Authentication {twoFactorEnabled ? '(Enabled)' : '(Disabled)'}
            </p>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onCheckedChange={setTwoFactorEnabled}
          />
        </div>

        {twoFactorEnabled && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Two-factor authentication is enabled. You'll need your authenticator app to sign in.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Separator />

      {/* Active Sessions */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Monitor className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Active Sessions</h3>
        </div>
        
        <div className="space-y-3">
          {activeSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium">{session.device}</p>
                  {session.current && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {session.location} • {session.lastActive}
                </p>
              </div>
              {!session.current && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => terminateSession(session.id)}
                >
                  Terminate
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
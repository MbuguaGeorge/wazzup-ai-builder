import React, { useState, useEffect } from 'react';
import { User, Key, Calendar, Smartphone, Shield, Hash, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { authFetch } from '@/lib/authFetch';
import { API_BASE_URL } from '@/lib/config';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

function getPasswordLastChangedDisplay(): string {
  const lastChanged = localStorage.getItem('password_last_changed');
  if (!lastChanged) return '1 hour ago';
  const last = dayjs(lastChanged);
  const now = dayjs();
  const diffDays = now.diff(last, 'day');
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  const diffWeeks = now.diff(last, 'week');
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
  const diffMonths = now.diff(last, 'month');
  return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
}

export const AccountInformation = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    joined: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await authFetch(`${API_BASE_URL}/api/me/`);
        if (response.ok) {
          const userData = await response.json();
          setFormData({
            fullName: userData.full_name || '',
            email: userData.email || '',
            joined: userData.date_joined || '',
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast({
          title: "Error",
          description: "Failed to load your profile information. Please refresh the page.",
          variant: "destructive",
        });
      }
    };
    loadUserData();
  }, [toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/api/me/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
        }),
      });
      
      if (response.ok) {
        toast({
          title: "Profile Updated",
          description: "Your profile information has been updated successfully!",
        });
        setIsEditing(false);
        // Update localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...userData,
          full_name: formData.fullName,
          email: formData.email,
        }));
      } else {
        const errorData = await response.json();
        toast({
          title: "Update Failed",
          description: errorData.error || "Failed to update your profile. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Your new passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Your new password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/api/change-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        }),
      });
      
      if (response.ok) {
        toast({
          title: "Password Updated",
          description: "Your password has been updated successfully!",
        });
        setShowPasswordForm(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        // Record password change date
        localStorage.setItem('password_last_changed', new Date().toISOString());
      } else {
        const errorData = await response.json();
        toast({
          title: "Password Update Failed",
          description: errorData.error || "Failed to update your password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const memberSince = formData.joined ? new Date(formData.joined).toLocaleDateString() : 'N/A';

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <User className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Profile Information</h3>
        </div>
        
        <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
          <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
            disabled={!isEditing}
              placeholder="Enter your full name"
          />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          disabled={!isEditing}
              placeholder="Enter your email address"
            />
          </div>
        </div>

        {/* Action Buttons for Profile */}
        <div className="flex justify-end space-x-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <Separator />

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
              <p className="text-sm text-muted-foreground">Last changed {getPasswordLastChangedDisplay()}</p>
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
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex space-x-3">
              <Button onClick={handlePasswordSubmit} disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
              <Button variant="outline" onClick={() => setShowPasswordForm(false)} disabled={loading}>
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

      {/* Account Details */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Hash className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-medium">Account Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{formData.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Member Since</p>
              <p className="text-sm text-muted-foreground">{memberSince}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Download, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authFetch } from '@/lib/authFetch';
import { cookieFetch } from '@/lib/cookieAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { API_BASE_URL } from '@/lib/config';

export const AccountManagement = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [password, setPassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { toast } = useToast();

  const handleExportData = async () => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      console.log('Exporting user data...');
      setIsExporting(false);
      toast({
        title: "Export Initiated",
        description: "Your data export has been initiated. You'll receive an email when it's ready.",
      });
    }, 2000);
  };

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter your password to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      console.log('Attempting to delete account...');
      const response = await cookieFetch(`${API_BASE_URL}/api/delete-account/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Success response:', data);
        toast({
          title: "Account Deletion Scheduled",
          description: "Your account has been scheduled for deletion and will be permanently removed in 60 days.",
        });
        
        // Clear local storage and redirect to home
        localStorage.clear();
        window.location.href = '/';
      } else {
        const errorData = await response.json();
        console.log('Error response:', errorData);
        toast({
          title: "Deletion Failed",
          description: errorData.error || "Failed to delete account. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Exception during delete account:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setPassword('');
      setShowDeleteModal(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Data Export */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Download className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Data Export</h3>
        </div>
        
        <div className="p-4 border rounded-lg space-y-3">
          <div>
            <p className="font-medium">Download Your Data</p>
            <p className="text-sm text-muted-foreground">
              Export all your account data including bots, conversations, and settings
            </p>
          </div>
          <Button 
            onClick={handleExportData} 
            disabled={isExporting}
            className="w-full sm:w-auto"
          >
            {isExporting ? 'Preparing Export...' : 'Download Account Data'}
          </Button>
          <p className="text-xs text-muted-foreground">
            Your data will be sent to your registered email address within 24 hours
          </p>
        </div>
      </div>

      <Separator />

      {/* Account Deactivation/Deletion */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Trash2 className="h-5 w-5 text-destructive" />
          <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
        </div>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Once you delete your account, there is no going back. Please be certain.
          </AlertDescription>
        </Alert>

        <div className="p-4 border border-destructive/20 rounded-lg space-y-4">
          <div>
            <p className="font-medium text-destructive">Delete Account</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm font-medium">What will be deleted:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• All your bot configurations and settings</li>
              <li>• Chat history and conversation data</li>
              <li>• Account information and preferences</li>
              <li>• Active subscriptions and billing information</li>
              <li>• Analytics and usage data</li>
            </ul>
          </div>

          <Button 
            variant="destructive" 
            className="w-full sm:w-auto"
            onClick={handleDeleteClick}
          >
            Delete My Account
          </Button>
        </div>
      </div>

      {/* Delete Account Modal */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Your Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all your data from our servers, including:
              <br /><br />
              • All bot configurations and chat data
              <br />
              • Account settings and preferences
              <br />
              • Billing and subscription information
              <br />
              • Analytics and usage history
              <br /><br />
              Your account will be scheduled for deletion and permanently removed in 60 days.
              You can still log in during this period if you change your mind.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delete-password" className="text-sm font-medium">
                Enter your password to confirm deletion:
              </Label>
              <Input
                id="delete-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && password.trim()) {
                    handleDeleteAccount();
                  }
                }}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteModal(false);
              setPassword('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              disabled={isDeleting || !password.trim()}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
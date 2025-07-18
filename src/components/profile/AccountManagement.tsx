import React, { useState } from 'react';
import { Download, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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

export const AccountManagement = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      console.log('Exporting user data...');
      setIsExporting(false);
      // Here you would trigger the actual download
    }, 2000);
  };

  const handleDeleteAccount = () => {
    console.log('Initiating account deletion...');
    // Here you would redirect to account deletion flow
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

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
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
                  If you're sure you want to proceed, click "Delete Account" below.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};
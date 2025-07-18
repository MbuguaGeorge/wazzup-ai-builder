import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, CheckCircle, XCircle, Clock, Info, Trash2, Unlink, TestTube, Copy, Upload, Save, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { authFetch } from '@/lib/authFetch';

const API_BASE_URL = 'http://localhost:8000';

interface BotSettingsPageProps {
  botId: string;
  onClose: () => void;
  onBotUpdated?: () => void;
}

const BotSettingsPage: React.FC<BotSettingsPageProps> = ({ botId, onClose, onBotUpdated }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [connectionData, setConnectionData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [pollingConnection, setPollingConnection] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingBotName, setSavingBotName] = useState(false);
  const [savingFallback, setSavingFallback] = useState(false);
  
  // Bot Information
  const [botName, setBotName] = useState('Store Assistant');
  const [originalBotName, setOriginalBotName] = useState('Store Assistant');

  // Bot Behavior
  const [fallbackMessage, setFallbackMessage] = useState("I'm sorry, I didn't understand that. Can you please rephrase?");
  const [originalFallbackMessage, setOriginalFallbackMessage] = useState("I'm sorry, I didn't understand that. Can you please rephrase?");
  const [typingIndicator, setTypingIndicator] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');

  // Notifications
  const [notifications, setNotifications] = useState({
    botOnlineOffline: true,
    newMessage: false,
    messageFailure: true,
    newChat: false
  });

  // Polling interval for checking connection status
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchBotAndWABA = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch bot details
      const botRes = await authFetch(`${API_BASE_URL}/api/bots/${botId}/`);
      if (botRes.ok) {
        const bot = await botRes.json();
        setIsConnected(!!bot.whatsapp_connected);
        setBotName(bot.name);
        setOriginalBotName(bot.name);
        // Optionally set other bot fields here
        if (bot.whatsapp_connected) {
          // Fetch WABA details
          const wabaRes = await authFetch(`${API_BASE_URL}/api/bots/${botId}/waba/`);
          if (wabaRes.ok) {
            const waba = await wabaRes.json();
            setConnectionData({
              phoneNumber: waba.phone_number,
              phoneNumberId: waba.phone_number_id,
              wabaId: waba.business_id,
              businessName: waba.business_name || '',
              accessToken: waba.access_token,
            });
          } else {
            setError('Failed to fetch WhatsApp connection details');
          }
        }
      } else {
        setError('Failed to fetch bot details');
      }
    } catch (err) {
      setError('An error occurred while loading bot settings');
      console.error('Error fetching bot and WABA:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBotAndWABA();
  }, [botId]);

  // Start polling for connection status after Meta signup
  const startPolling = () => {
    setPollingConnection(true);
    const interval = setInterval(async () => {
      try {
        const botRes = await authFetch(`${API_BASE_URL}/api/bots/${botId}/`);
        if (botRes.ok) {
          const bot = await botRes.json();
          if (bot.whatsapp_connected) {
            // Connection successful, stop polling and refresh data
            clearInterval(interval);
            setPollingConnection(false);
    setIsConnected(true);
            await fetchBotAndWABA();
          }
        }
      } catch (err) {
        console.error('Error polling connection status:', err);
      }
    }, 3000); // Check every 3 seconds

    setPollingInterval(interval);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Meta Embedded Signup handler
  const handleConnectWhatsApp = async () => {
    setConnecting(true);
    setError(null);
    try {
      const response = await authFetch(`${API_BASE_URL}/api/meta/generate-signup-url/${botId}/`);
      const data = await response.json();

      if (data.signup_url) {
        window.open(data.signup_url, "_blank");
        // Start polling for connection status
        startPolling();
      } else {
        setError('Failed to generate signup link');
      }
    } catch (err) {
      console.error("Error:", err);
      setError('Error connecting WhatsApp');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/bots/${botId}/toggle-whatsapp/`, {
        method: 'POST',
      });
      if (response.ok) {
    setIsConnected(false);
        setConnectionData({});
        if (onBotUpdated) onBotUpdated();
      } else {
        setError('Failed to disconnect WhatsApp');
      }
    } catch (err) {
      setError('Error disconnecting WhatsApp');
    }
  };

  const handleTestConnection = () => {
    console.log('Testing WhatsApp connection...');
  };

  // Save bot name
  const handleSaveBotName = async () => {
    if (botName === originalBotName) return;
    
    setSavingBotName(true);
    setError(null);
    try {
      const response = await authFetch(`${API_BASE_URL}/api/bots/${botId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: botName }),
      });
      if (response.ok) {
        setOriginalBotName(botName);
        if (onBotUpdated) onBotUpdated();
        console.log('Bot name saved successfully');
      } else {
        setError('Failed to save bot name');
      }
    } catch (err) {
      setError('Error saving bot name');
      console.error('Error saving bot name:', err);
    } finally {
      setSavingBotName(false);
    }
  };

  // Save fallback message
  const handleSaveFallbackMessage = async () => {
    if (fallbackMessage === originalFallbackMessage) return;
    
    setSavingFallback(true);
    setError(null);
    try {
      // This would need to be implemented in your backend
      // For now, just update the local state
      setOriginalFallbackMessage(fallbackMessage);
      if (onBotUpdated) onBotUpdated();
      console.log('Fallback message saved successfully');
    } catch (err) {
      setError('Error saving fallback message');
      console.error('Error saving fallback message:', err);
    } finally {
      setSavingFallback(false);
    }
  };

  // Auto-save for switches and selects
  const handleAutoSave = async (field: string, value: any) => {
    try {
      // This would need to be implemented in your backend
      console.log(`Auto-saving ${field}:`, value);
    } catch (err) {
      console.error(`Error auto-saving ${field}:`, err);
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(connectionData.accessToken);
  };

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-6 w-1/3 mb-2" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-6 w-1/4 mb-2" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-6 w-1/4 mb-2" />
        <Skeleton className="h-10 w-full mb-4" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Main Content */}
        <div className="p-6 max-w-4xl mx-auto space-y-8">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Polling Status */}
          {pollingConnection && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Waiting for WhatsApp connection to complete... Please complete the Meta signup process in the new window.
              </AlertDescription>
            </Alert>
          )}

          {/* Bot Information */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Bot Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="botName">Bot Name</Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      id="botName"
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                      placeholder="Enter bot name"
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSaveBotName}
                      disabled={savingBotName || botName === originalBotName}
                      size="sm"
                    >
                      {savingBotName ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Integration */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">WhatsApp Integration</h2>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {isConnected ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">Connection Status</p>
                    <p className="text-sm text-gray-600">
                    {isConnected ? `Connected to WhatsApp Business${connectionData.businessName ? `: ${connectionData.businessName}` : ''}` : 'Not Connected'}
                    </p>
                  </div>
                </div>
                <Badge variant={isConnected ? 'default' : 'destructive'}>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>

              {!isConnected && (
              <Button 
                onClick={handleConnectWhatsApp} 
                className="w-full" 
                size="lg" 
                disabled={connecting || pollingConnection}
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect to WhatsApp via Meta'
                )}
                </Button>
              )}

              {isConnected && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Phone Number</Label>
                      <Input 
                      value={connectionData.phoneNumber || ''} 
                        readOnly 
                      className="bg-gray-50 mt-1"
                      />
                    </div>
                    <div>
                      <Label>Phone Number ID</Label>
                      <Input 
                      value={connectionData.phoneNumberId || ''} 
                        readOnly 
                      className="bg-gray-50 mt-1"
                      />
                    </div>
                    <div>
                      <Label>WhatsApp Business Account ID</Label>
                      <Input 
                      value={connectionData.wabaId || ''} 
                        readOnly 
                      className="bg-gray-50 mt-1"
                      />
                  </div>
                  <div>
                    <Label>Business Name</Label>
                      <Input 
                      value={connectionData.businessName || ''} 
                        readOnly 
                      className="bg-gray-50 mt-1"
                    />
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Bot Behavior Settings */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Bot Behavior</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fallback">Fallback Message</Label>
                  <div className="space-y-2">
                    <Textarea 
                      id="fallback"
                      value={fallbackMessage}
                      onChange={(e) => setFallbackMessage(e.target.value)}
                      placeholder="Message sent when bot doesn't understand user input"
                      className="min-h-[80px] mt-1"
                    />
                    <Button 
                      onClick={handleSaveFallbackMessage}
                      disabled={savingFallback || fallbackMessage === originalFallbackMessage}
                      size="sm"
                      className="w-full"
                    >
                      {savingFallback ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Fallback Message
                        </>
                      )}
                    </Button>
                  </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="language">Default Language</Label>
                    <select 
                      id="language"
                      value={defaultLanguage}
                    onChange={(e) => {
                      setDefaultLanguage(e.target.value);
                      handleAutoSave('defaultLanguage', e.target.value);
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="pt">Portuguese</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <select 
                      id="timezone"
                      value={timezone}
                    onChange={(e) => {
                      setTimezone(e.target.value);
                      handleAutoSave('timezone', e.target.value);
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Typing Indicator</p>
                        <p className="text-sm text-gray-600">Show typing indicator when bot is responding</p>
                      </div>
                    <Switch 
                      checked={typingIndicator} 
                      onCheckedChange={(checked) => {
                        setTypingIndicator(checked);
                        handleAutoSave('typingIndicator', checked);
                      }} 
                    />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Read Receipts</p>
                        <p className="text-sm text-gray-600">Send read receipts for customer messages</p>
                      </div>
                    <Switch 
                      checked={readReceipts} 
                      onCheckedChange={(checked) => {
                        setReadReceipts(checked);
                        handleAutoSave('readReceipts', checked);
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Bot goes online/offline</p>
                  <p className="text-sm text-gray-600">Get notified when your bot status changes</p>
                </div>
                <Switch 
                  checked={notifications.botOnlineOffline} 
                  onCheckedChange={(checked) => {
                    setNotifications(prev => ({ ...prev, botOnlineOffline: checked }));
                    handleAutoSave('notifications.botOnlineOffline', checked);
                  }} 
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New message received</p>
                  <p className="text-sm text-gray-600">Get alerts for incoming customer messages</p>
                </div>
                <Switch 
                  checked={notifications.newMessage} 
                  onCheckedChange={(checked) => {
                    setNotifications(prev => ({ ...prev, newMessage: checked }));
                    handleAutoSave('notifications.newMessage', checked);
                  }} 
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Message failed to deliver</p>
                  <p className="text-sm text-gray-600">Get notified about delivery failures</p>
                </div>
                <Switch 
                  checked={notifications.messageFailure} 
                  onCheckedChange={(checked) => {
                    setNotifications(prev => ({ ...prev, messageFailure: checked }));
                    handleAutoSave('notifications.messageFailure', checked);
                  }} 
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New chat started</p>
                  <p className="text-sm text-gray-600">Get notified when customers start new conversations</p>
                </div>
                <Switch 
                  checked={notifications.newChat} 
                  onCheckedChange={(checked) => {
                    setNotifications(prev => ({ ...prev, newChat: checked }));
                    handleAutoSave('notifications.newChat', checked);
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Danger Zone</h2>
            <div className="space-y-4">
              {isConnected && (
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <p className="font-medium">Disconnect WhatsApp</p>
                    <p className="text-sm text-gray-600">Unlink your Meta/WhatsApp connection</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                        <Unlink className="w-4 h-4 mr-2" />
                        Disconnect
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Disconnect WhatsApp?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will disconnect your bot from WhatsApp. Your bot will stop receiving and sending messages until you reconnect.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDisconnectWhatsApp} className="bg-red-600 hover:bg-red-700">
                          Disconnect
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}

              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                <div>
                  <p className="font-medium">Delete Bot</p>
                  <p className="text-sm text-gray-600">Permanently delete this bot and all its data</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Bot
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Bot?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the bot and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BotSettingsPage;
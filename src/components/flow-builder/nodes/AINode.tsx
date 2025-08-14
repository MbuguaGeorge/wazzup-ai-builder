import React, { memo, useState, useRef, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, UploadCloud, FileText, Link as LinkIcon, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import DeleteButton from './DeleteButton';
import { useEffect } from 'react';
import { authFetch } from '@/lib/authFetch';
import { API_BASE_URL } from '@/lib/config';


const useBroadcastChannel = (channelName: string) => {
  const [message, setMessage] = useState(null);
  const channel = useRef(null);
  
  useEffect(() => {
    channel.current = new BroadcastChannel(channelName);
    
    channel.current.addEventListener('message', (event) => {
      setMessage(event.data);
    });
    
    return () => {
      channel.current?.close();
    };
  }, [channelName]);
  
  const sendMessage = useCallback((data) => {
    channel.current?.postMessage(data);
  }, []);
  
  return { message, sendMessage };
};


const AINode = ({ data, isConnectable, id }: NodeProps) => {
  const [newLink, setNewLink] = useState('');
  const [googleAuth, setGoogleAuth] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [trialStatus, setTrialStatus] = useState<{
    is_trial_user: boolean;
    trial_restrictions?: {
      allowed_models: string[];
      restricted_models: string[];
    };
  } | null>(null);
  const popupRef = React.useRef<Window | null>(null);
  const { message, sendMessage } = useBroadcastChannel('google-oauth');
  const onUpdate = data.onUpdate || (() => {});
  const onFilesChange = data.onFilesChange || (() => {});
  const onFileRemove = data.onFileRemove || (() => {});

  // Fetch trial status
  useEffect(() => {
    async function fetchTrialStatus() {
      try {
        const response = await authFetch(`${API_BASE_URL}/api/subscription/credits/balance/`);
        if (response.ok) {
          const data = await response.json();
          setTrialStatus({
            is_trial_user: data.is_trial_user || false,
            trial_restrictions: data.trial_restrictions
          });
          
          // If trial user and current model is not allowed, set to gpt-4o-mini
          if (data.is_trial_user && data.trial_restrictions) {
            const allowedModels = data.trial_restrictions.allowed_models || ['gpt-4o-mini'];
            if (!allowedModels.includes(data.model)) {
              onUpdate({ model: 'gpt-4o-mini' });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching trial status:', error);
      }
    }
    fetchTrialStatus();
  }, []);

  // Reusable function to check Google OAuth status
  const checkGoogleStatus = async () => {
    try {
      console.log('🔍 Checking Google OAuth status...');
      const res = await authFetch(`${API_BASE_URL}/api/google-oauth/status/`);
      const result = await res.json();
      console.log('✅ Google OAuth status response:', result);
      setGoogleAuth(!!result.authorized);
      console.log('🔧 Updated googleAuth state to:', !!result.authorized);
      return result.authorized;
    } catch (e) {
      console.error('❌ Error checking Google OAuth status:', e);
      setGoogleAuth(false);
      return false;
    }
  };

  // Check Google OAuth status on component mount
  useEffect(() => {
    checkGoogleStatus();
  }, []);

  // Listen for OAuth popup message
  useEffect(() => {
    if (message) {
      if (message.type === 'google_oauth_success') {
        console.log('🎉 OAuth success message received (prop)');
        // Instead of directly setting state, check the actual backend status
        checkGoogleStatus();
        setAuthError(null);
        if (popupRef.current) popupRef.current.close();
      } else if (message.type === 'google_oauth_error') {
        console.log('❌ OAuth error message received (prop)');
        setAuthError('Google authorization failed. Please try again.');
        setGoogleAuth(false);
        if (popupRef.current) popupRef.current.close();
      }
    }
  }, [message]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data && event.data.type === 'google_oauth_success') {
        console.log('🎉 OAuth success message received (window event):', event.data);
        // Instead of directly setting state, check the actual backend status
        checkGoogleStatus();
        setAuthError(null);
        if (popupRef.current) popupRef.current.close();
      } else if (event.data && event.data.type === 'google_oauth_error') {
        console.log('❌ OAuth error message received (window event):', event.data);
        setAuthError('Google authorization failed. Please try again.');
        setGoogleAuth(false);
        if (popupRef.current) popupRef.current.close();
      }
    }
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleGoogleAuth = async () => {
    setAuthChecking(true);
    setAuthError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/google-oauth/url/`);
      const data = await res.json();
      if (!data.url) throw new Error('No OAuth URL returned');
      const width = 500, height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        data.url,
        'GoogleAuthPopup',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      popupRef.current = popup;
    } catch (e) {
      setAuthError('Failed to initiate Google OAuth.');
    } finally {
      setAuthChecking(false);
    }
  };

  const handleAddLink = async () => {
    if (newLink && !data.gdrive_links?.includes(newLink)) {
      const updatedLinks = [...(data.gdrive_links || []), newLink];
      onUpdate({ gdrive_links: updatedLinks });
      setNewLink('');

      await authFetch(`${API_BASE_URL}/api/upsert-gdrive-link/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link: newLink, flow_id: data.flow_id, node_id: id }),
        credentials: 'include'
      });
      console.log(`Adding link: ${newLink} to flow ID: ${data.flow_id}`);
    }
  };

  const handleRemoveLink = async (linkToRemove: string) => {
    const updatedLinks = data.gdrive_links?.filter((link: string) => link !== linkToRemove);
    onUpdate({ gdrive_links: updatedLinks });

    await authFetch(`${API_BASE_URL}/api/delete-gdrive-link/`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ link: linkToRemove, flow_id: data.flow_id, node_id: id }),
      credentials: 'include'
    });
    console.log(`Removing link: ${linkToRemove} from flow ID: ${data.flow_id}`);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFilesChange(Array.from(event.target.files));
      event.target.value = '';
    }
  };

  return (
    <Card className="w-[400px] shadow-md relative group">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-primary" />
      <DeleteButton nodeId={id} />
      <CardHeader className="flex flex-row items-center gap-2 p-4 pb-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-medium">AI Response</h3>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-4">
        {/* Model and System Prompt */}
        <div className="space-y-2">
          <Label>Model</Label>
          <Select value={data.model} onValueChange={(value) => onUpdate({ model: value })}>
            <SelectTrigger><SelectValue placeholder="Select AI model" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
              <SelectItem 
                value="gpt-4o"
                disabled={trialStatus?.is_trial_user}
                className={trialStatus?.is_trial_user ? 'opacity-50 cursor-not-allowed' : ''}
              >
                GPT-4o
                {trialStatus?.is_trial_user && <span className="text-xs text-muted-foreground ml-2">(Upgrade)</span>}
              </SelectItem>
              <SelectItem 
                value="claude-3.5-sonnet" 
                disabled={trialStatus?.is_trial_user}
                className={trialStatus?.is_trial_user ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Claude 3.5 Sonnet
                {trialStatus?.is_trial_user && <span className="text-xs text-muted-foreground ml-2">(Upgrade)</span>}
              </SelectItem>
              <SelectItem 
                value="claude-3-haiku" 
                disabled={trialStatus?.is_trial_user}
                className={trialStatus?.is_trial_user ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Claude 3 Haiku
                {trialStatus?.is_trial_user && <span className="text-xs text-muted-foreground ml-2">(Upgrade)</span>}
              </SelectItem>
              <SelectItem 
                value="gemini-2.5-pro" 
                disabled={trialStatus?.is_trial_user}
                className={trialStatus?.is_trial_user ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Gemini 2.5 Pro
                {trialStatus?.is_trial_user && <span className="text-xs text-muted-foreground ml-2">(Upgrade)</span>}
              </SelectItem>
              <SelectItem 
                value="gemini-2.5-flash" 
                disabled={trialStatus?.is_trial_user}
                className={trialStatus?.is_trial_user ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Gemini 2.5 Flash
                {trialStatus?.is_trial_user && <span className="text-xs text-muted-foreground ml-2">(Upgrade)</span>}
              </SelectItem>
            </SelectContent>
          </Select>
          
          {/* Trial restriction warning */}
          {trialStatus?.is_trial_user && trialStatus.trial_restrictions && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <div className="text-xs text-yellow-700 dark:text-yellow-300">
                <p className="font-medium">Trial Mode</p>
                <p>Only GPT-4o-mini is available during trial. Upgrade to access all models.</p>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label>System Prompt</Label>
          <Textarea
            placeholder="You are a helpful assistant."
            value={data.systemPrompt}
            onChange={(e) => onUpdate({ systemPrompt: e.target.value })}
            className="min-h-[60px] resize-none"
          />
        </div>

        {/* Document Upload */}
        <div className="space-y-3 p-3 bg-secondary/50 rounded-lg">
          <Label className="font-medium text-sm">Context Documents</Label>
          <p className="text-xs text-muted-foreground -mt-2">Provide documents for the AI to reference.</p>
          {/* File Upload */}
          <div className="space-y-2">
            <Label 
              htmlFor={`file-upload-${id}`} 
              className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer p-2 rounded-md border-2 border-dashed border-muted hover:border-primary hover:text-primary transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload PDF Files</span>
              <Input id={`file-upload-${id}`} type="file" multiple onChange={handleFileChange} accept=".pdf" className="sr-only" />
            </Label>
            <div className="space-y-1">
              {data.files?.map((file: any, index: number) => (
                <div key={file.id || index} className="flex items-center justify-between text-xs bg-background p-1.5 rounded">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="truncate" title={file.name}>{file.name}</span>
                  </div>
                  <div className="flex items-center flex-shrink-0">
                    {file.uploading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onFileRemove(file)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Google OAuth and Link Input */}
          <div className="space-y-2 mt-4">
            {!googleAuth ? (
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={authChecking}
                  className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer p-2 rounded-md border-2 border-dashed border-muted hover:border-primary hover:text-primary transition-all w-full bg-transparent"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Connect Google for Docs/Sheets</span>
                </button>
            ) : (
              <>
            <Label className="flex items-center gap-2 text-xs text-muted-foreground">
              <LinkIcon className="w-4 h-4" />
                  <span>Paste your Google Docs or Sheets link here</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://docs.google.com/..."
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                className="h-8 text-xs"
              />
              <Button onClick={handleAddLink} size="sm" className="h-8">Add</Button>
            </div>
                <p className="text-xs text-muted-foreground">
                  Make sure the file belongs to the linked Google account. This allows the bot to access private documents without changing sharing settings.
                </p>
            <div className="space-y-1">
              {data.gdrive_links?.map((link: string, index: number) => (
                <div key={index} className="flex items-center justify-between text-xs bg-background p-1.5 rounded">
                    <span className="truncate max-w-[280px]">{link}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveLink(link)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
              </>
            )}
            {authError && <p className="text-xs text-red-500">{authError}</p>}
          </div>
        </div>

        {/* Fallback & Instructions */}
        <div className="space-y-2">
          <Label>Fallback Response</Label>
          <Textarea
            placeholder="I'm sorry, I don't have the information to answer that. Let me connect you to a human."
            value={data.fallbackResponse}
            onChange={(e) => onUpdate({ fallbackResponse: e.target.value })}
            className="min-h-[50px] resize-none"
          />
        </div>
        <div className="space-y-2">
          <Label>Extra Instructions</Label>
          <Textarea
            placeholder="e.g., Mention our 30% Black Friday sale discount in all responses where it's relevant."
            value={data.extraInstructions}
            onChange={(e) => onUpdate({ extraInstructions: e.target.value })}
            className="min-h-[50px] resize-none"
          />
        </div>

      </CardContent>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3 bg-primary" />
    </Card>
  );
};

export default memo(AINode); 
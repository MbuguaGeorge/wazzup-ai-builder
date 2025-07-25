import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, UploadCloud, FileText, Link as LinkIcon, Trash2, Loader2 } from 'lucide-react';
import DeleteButton from './DeleteButton';
import { useEffect } from 'react';
import { authFetch } from '@/lib/authFetch';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AINode = ({ data, isConnectable, id }: NodeProps) => {
  const [newLink, setNewLink] = useState('');
  const [googleAuth, setGoogleAuth] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const popupRef = React.useRef<Window | null>(null);

  const onUpdate = data.onUpdate || (() => {});
  const onFilesChange = data.onFilesChange || (() => {});
  const onFileRemove = data.onFileRemove || (() => {});

  // Listen for OAuth popup message
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data && event.data.type === 'google_oauth_success') {
        setGoogleAuth(true);
        setAuthError(null);
        if (popupRef.current) popupRef.current.close();
      } else if (event.data && event.data.type === 'google_oauth_error') {
        setAuthError('Google authorization failed. Please try again.');
        setGoogleAuth(false);
        if (popupRef.current) popupRef.current.close();
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Removed demo useEffect for auth expiration

  const handleGoogleAuth = async () => {
    setAuthChecking(true);
    setAuthError(null);
    try {
      const res = await authFetch(`${API_BASE}/api/google-oauth/url/`);
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

  const handleAddLink = () => {
    if (newLink && !data.gdrive_links?.includes(newLink)) {
      const updatedLinks = [...(data.gdrive_links || []), newLink];
      onUpdate({ gdrive_links: updatedLinks });
      setNewLink('');
    }
  };

  const handleRemoveLink = (linkToRemove: string) => {
    const updatedLinks = data.gdrive_links?.filter((link: string) => link !== linkToRemove);
    onUpdate({ gdrive_links: updatedLinks });
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
              <SelectItem value="gpt-4o">GPT-4o (smart, expensive, slow)</SelectItem>
              <SelectItem value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet (balanced)</SelectItem>
              <SelectItem value="claude-3-5-haiku-20240307">Claude 3.5 Haiku (cheaper, faster)</SelectItem>
              <SelectItem value="gpt-o4-mini">GPT-4o-mini (faster, cheaper)</SelectItem>
            </SelectContent>
          </Select>
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
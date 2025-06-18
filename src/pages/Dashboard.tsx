import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Bot, Plus } from 'lucide-react';
import BotCard from '@/components/dashboard/BotCard';
import CreateBotCard from '@/components/dashboard/CreateBotCard';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { authFetch } from '@/lib/authFetch';

const API_BASE_URL = 'http://localhost:8000';

interface Flow {
  id: string;
  name: string;
  status: 'active' | 'draft' | 'archived';
}

interface Bot {
  id: string;
  name: string;
  createdAt: string;
  status: 'active' | 'draft' | 'disconnected';
  lastModified: string;
  isConnected: boolean;
  activeFlow: { id: string; name: string; } | null;
  flows: Flow[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bots, setBots] = useState<Bot[]>([]);
  const [botNameError, setBotNameError] = useState('');

  // Fetch bots on mount
  useEffect(() => {
    async function fetchBots() {
      try {
        const response = await authFetch(`${API_BASE_URL}/api/bots/`);
        if (response.ok) {
          const data = await response.json();
          setBots(data);
        }
      } catch (err) {
        // Handle error (already handled by authFetch for 401)
      }
    }
    fetchBots();
  }, []);

  useEffect(() => {
    document.title = 'wozza | Dashboard';
  }, []);

  const validateBotName = (name: string) => {
    if (!name.trim()) {
      setBotNameError('Bot name is required');
      return false;
    }
    const existingBot = bots.find(
      (bot) => bot.name.toLowerCase() === name.toLowerCase()
    );
    if (existingBot) {
      setBotNameError('A bot with this name already exists');
      return false;
    }
    setBotNameError('');
    return true;
  };

  const handleCreateBot = async () => {
    if (!validateBotName(newBotName)) return;
    try {
      const response = await authFetch(`${API_BASE_URL}/api/bots/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBotName }),
      });
      if (response.ok) {
        const newBot = await response.json();
        setBots([...bots, newBot]);
        setNewBotName('');
        setIsCreateDialogOpen(false);
        navigate(`/flow-builder/${newBot.id}`);
      }
    } catch (err) {}
  };

  const handleDeleteBot = async (id: string) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/bots/${id}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setBots(bots.filter(bot => bot.id !== id));
      }
    } catch (err) {}
  };

  const handleDuplicateBot = async (id: string) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/bots/${id}/duplicate/`, {
        method: 'POST',
      });
      if (response.ok) {
        const newBot = await response.json();
        setBots([...bots, newBot]);
      }
    } catch (err) {}
  };

  const handleRenameBot = (id: string, currentName: string) => {
    setSelectedBotId(id);
    setNewBotName(currentName);
    setBotNameError('');
    setIsRenameDialogOpen(true);
  };

  const handleRenameConfirm = async () => {
    if (!selectedBotId || !validateBotName(newBotName)) return;
    try {
      const response = await authFetch(`${API_BASE_URL}/api/bots/${selectedBotId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBotName }),
      });
      if (response.ok) {
        const updatedBot = await response.json();
        setBots(bots.map(bot => bot.id === selectedBotId ? updatedBot : bot));
        setIsRenameDialogOpen(false);
        setNewBotName('');
        setSelectedBotId(null);
        setBotNameError('');
      }
    } catch (err) {}
  };

  const handleManageFlows = (botId: string) => {
    navigate(`/flow-builder/${botId}`);
  };

  const handleSetActiveFlow = async (botId: string, flowId: string) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/flows/${flowId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: true }),
      });
      if (response.ok) {
        const updatedBot = await response.json();
        setBots(bots.map(bot => bot.id === botId ? updatedBot : bot));
      }
    } catch (err) {}
  };

  const filteredBots = bots.filter(bot =>
    bot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader 
          title="My Bots"
          subtitle="Create and manage your WhatsApp bots with wozza"
        />

        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 space-y-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredBots.length === 0 && !searchQuery ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">No bots yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first WhatsApp bot to get started
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first bot
                </Button>
              </div>
            ) : filteredBots.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No bots match your search query
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CreateBotCard onClick={() => setIsCreateDialogOpen(true)} />
                {filteredBots.map((bot) => (
                  <BotCard
                    key={bot.id}
                    bot={bot}
                    onDelete={handleDeleteBot}
                    onDuplicate={handleDuplicateBot}
                    onRename={handleRenameBot}
                    onManageFlows={handleManageFlows}
                    onSetActiveFlow={handleSetActiveFlow}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Bot</DialogTitle>
            <DialogDescription>
              Give your bot a name to get started. You can customize its behavior in the flow builder.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bot Name</Label>
              <Input
                id="name"
                placeholder="e.g., Customer Support Assistant"
                value={newBotName}
                onChange={(e) => {
                  setNewBotName(e.target.value);
                  validateBotName(e.target.value);
                }}
              />
              {botNameError && (
                <p className="text-sm text-destructive">{botNameError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateDialogOpen(false);
                setNewBotName('');
                setBotNameError('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateBot} 
              disabled={!newBotName.trim() || !!botNameError}
            >
              Create & Open Builder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Bot</DialogTitle>
            <DialogDescription>
              Enter a new name for your bot.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename">Bot Name</Label>
              <Input
                id="rename"
                placeholder="Enter bot name"
                value={newBotName}
                onChange={(e) => {
                  setNewBotName(e.target.value);
                  validateBotName(e.target.value);
                }}
              />
              {botNameError && (
                <p className="text-sm text-destructive">{botNameError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
              setIsRenameDialogOpen(false);
              setNewBotName('');
              setSelectedBotId(null);
                setBotNameError('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRenameConfirm} 
              disabled={!newBotName.trim() || !!botNameError}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard; 
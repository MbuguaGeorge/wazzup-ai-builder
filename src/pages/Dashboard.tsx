import React, { useState } from 'react';
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

// Temporary mock data
const mockBots: Bot[] = [
  {
    id: '1',
    name: 'Customer Support Bot',
    createdAt: '2024-03-15',
    status: 'active',
    lastModified: '2024-03-20',
    isConnected: true,
    activeFlow: {
      id: 'flow-1',
      name: 'Daytime Support'
    },
    flows: [
      { id: 'flow-1', name: 'Daytime Support', status: 'active' },
      { id: 'flow-2', name: 'Night Support', status: 'draft' },
      { id: 'flow-3', name: 'Weekend Flow', status: 'archived' },
    ]
  },
  {
    id: '2',
    name: 'Sales Assistant',
    createdAt: '2024-03-10',
    status: 'draft',
    lastModified: '2024-03-18',
    isConnected: false,
    activeFlow: {
      id: 'flow-2',
      name: 'Main Sales Flow'
    },
    flows: [
      { id: 'flow-2', name: 'Main Sales Flow', status: 'active' },
      { id: 'flow-4', name: 'Holiday Sales', status: 'draft' },
    ]
  },
  {
    id: '3',
    name: 'Order Bot',
    createdAt: '2024-03-05',
    status: 'disconnected',
    lastModified: '2024-03-15',
    isConnected: false,
    activeFlow: null,
    flows: []
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bots, setBots] = useState<Bot[]>(mockBots);
  const [botNameError, setBotNameError] = useState('');

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

  const handleCreateBot = () => {
    if (!validateBotName(newBotName)) return;

    const newBot: Bot = {
      id: `bot-${Date.now()}`,
      name: newBotName,
      createdAt: new Date().toISOString(),
      status: 'draft',
      lastModified: new Date().toISOString(),
      isConnected: false,
      activeFlow: null,
      flows: []
    };

    setBots([...bots, newBot]);
    setNewBotName('');
    setIsCreateDialogOpen(false);
    navigate(`/flow-builder/${newBot.id}`);
  };

  const handleDeleteBot = (id: string) => {
    setBots(bots.filter(bot => bot.id !== id));
  };

  const handleDuplicateBot = (id: string) => {
    const botToDuplicate = bots.find(bot => bot.id === id);
    if (!botToDuplicate) return;

    const newBot: Bot = {
      ...botToDuplicate,
      id: `bot-${Date.now()}`,
      name: `${botToDuplicate.name} (Copy)`,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      status: 'draft',
      isConnected: false,
      activeFlow: null,
      flows: botToDuplicate.flows.map(flow => ({
        ...flow,
        id: `flow-${Date.now()}-${flow.id}`,
        status: 'draft'
      }))
    };

    setBots([...bots, newBot]);
  };

  const handleRenameBot = (id: string, currentName: string) => {
    setSelectedBotId(id);
    setNewBotName(currentName);
    setBotNameError('');
    setIsRenameDialogOpen(true);
  };

  const handleRenameConfirm = () => {
    if (!selectedBotId || !validateBotName(newBotName)) return;

    setBots(bots.map(bot => 
      bot.id === selectedBotId 
        ? { ...bot, name: newBotName, lastModified: new Date().toISOString() }
        : bot
    ));

    setIsRenameDialogOpen(false);
    setNewBotName('');
    setSelectedBotId(null);
    setBotNameError('');
  };

  const handleManageFlows = (botId: string) => {
    navigate(`/flow-builder/${botId}`);
  };

  const handleSetActiveFlow = (botId: string, flowId: string) => {
    setBots(bots.map(bot => {
      if (bot.id !== botId) return bot;

      const selectedFlow = bot.flows.find(f => f.id === flowId);
      if (!selectedFlow) return bot;

      return {
        ...bot,
        activeFlow: flowId ? {
          id: flowId,
          name: selectedFlow.name
        } : null,
        flows: bot.flows.map(flow => ({
          ...flow,
          status: flow.id === flowId ? 'active' : flow.status === 'active' ? 'draft' : flow.status
        }))
      };
    }));
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
          subtitle="Create and manage your WhatsApp bots"
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
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
import { Search, Bot, Plus, Users, MessageSquare, BarChart2 } from 'lucide-react';
import BotCard from '@/components/dashboard/BotCard';
import CreateBotCard from '@/components/dashboard/CreateBotCard';
import { authFetch } from '@/lib/authFetch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import BotSettingsPage from '@/pages/BotSettingsPage';
import { toast } from '@/components/ui/sonner';
import { API_BASE_URL } from '@/lib/config';

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
  last_updated: string;
  whatsapp_connected: boolean;
  activeFlow: { id: string; name: string; } | null;
  flows: Flow[];
}

const fetchBots = async (setBots: React.Dispatch<React.SetStateAction<Bot[]>>) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/api/bots/`);
    if (response.ok) {
      const data = await response.json();
      setBots(data);
    }
  } catch (err) {
    // Handle error (already handled by authFetch for 401)
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bots, setBots] = useState<Bot[]>([]);
  const [botNameError, setBotNameError] = useState('');
  const [filteredBots, setFilteredBots] = useState<Bot[]>([]);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [botToInteract, setBotToInteract] = useState<Bot | null>(null);
  const [settingsBotId, setSettingsBotId] = useState<string | null>(null);
  const [botStats, setBotStats] = useState({ total_bots: 0, active_bots: 0 });
  const [botAnalytics, setBotAnalytics] = useState<any>({});

  // Fetch bots and stats on mount
  useEffect(() => {
    fetchBots(setBots);
    async function fetchStats() {
      try {
        const response = await authFetch(`${API_BASE_URL}/api/bots/stats/`);
        if (response.ok) {
          const data = await response.json();
          setBotStats(data);
        }
      } catch (err) {}
    }
    fetchStats();
  }, []);

  // Fetch per-bot analytics from Node.js
  useEffect(() => {
    async function fetchBotAnalytics() {
      const analytics: any = {};
      await Promise.all(bots.map(async (bot) => {
        try {
          const res = await authFetch(`${API_BASE_URL}/api/chat/stats/${bot.id}`);
          if (res.ok) {
            analytics[bot.id] = await res.json();
          }
        } catch {}
      }));
      setBotAnalytics(analytics);
    }
    if (bots.length > 0) fetchBotAnalytics();
  }, [bots]);

  useEffect(() => {
    document.title = 'wozza | Dashboard';
  }, []);

  useEffect(() => {
    const results = bots.filter(bot =>
      bot.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBots(results);
  }, [searchQuery, bots]);

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
      } else {
        // Handle specific error responses
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to create bot. Please try again.';
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error('Error creating bot:', err);
      toast.error('Failed to create bot. Please try again.');
    }
  };

  const handleDeleteBot = async (id: string) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/bots/${id}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setBots(bots.filter(bot => bot.id !== id));
        toast.success('Bot deleted successfully');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to delete bot. Please try again.';
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error('Error deleting bot:', err);
      toast.error('Failed to delete bot. Please try again.');
    }
  };

  const handleDuplicateBot = async (id: string) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/bots/${id}/duplicate/`, {
        method: 'POST',
      });
      if (response.ok) {
        const newBot = await response.json();
        setBots([...bots, newBot]);
        toast.success('Bot duplicated successfully');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to duplicate bot. Please try again.';
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error('Error duplicating bot:', err);
      toast.error('Failed to duplicate bot. Please try again.');
    }
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
        toast.success('Bot renamed successfully');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to rename bot. Please try again.';
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error('Error renaming bot:', err);
      toast.error('Failed to rename bot. Please try again.');
    }
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


  // Aggregate analytics for all bots
  const totalMessagesToday = Object.values(botAnalytics).reduce((sum: number, a: any) => sum + (a?.messagesToday || 0), 0);
  const messagesChangeSum = Object.values(botAnalytics).reduce((sum: number, a: any) => {
    let val = 0;
    if (typeof a?.messagesTodayChange === 'string') {
      const parsed = parseFloat(a.messagesTodayChange);
      val = isNaN(parsed) ? 0 : parsed;
    }
    return sum + val;
  }, 0) as number;
  const analyticsCount: number = Object.values(botAnalytics).length;
  const avgMessagesChange = analyticsCount > 0
    ? (messagesChangeSum / analyticsCount).toFixed(0)
    : '0';
  const successRateSum = Object.values(botAnalytics).reduce((sum: number, a: any) => {
    let val = 0;
    if (typeof a?.successRate === 'string') {
      const parsed = parseFloat(a.successRate);
      val = isNaN(parsed) ? 0 : parsed;
    }
    return sum + val;
  }, 0) as number;
  const avgSuccessRate = analyticsCount > 0
    ? (successRateSum / analyticsCount).toFixed(0)
    : '100';
  const successChangeSum = Object.values(botAnalytics).reduce((sum: number, a: any) => {
    let val = 0;
    if (typeof a?.successRateChange === 'string') {
      const parsed = parseFloat(a.successRateChange);
      val = isNaN(parsed) ? 0 : parsed;
    }
    return sum + val;
  }, 0) as number;
  const avgSuccessChange = analyticsCount > 0
    ? (successChangeSum / analyticsCount).toFixed(0)
    : '0';

  const analyticsData = [
    {
      title: 'Total Bots',
      value: String(botStats.total_bots),
      change: '+1 from last month',
      icon: Bot,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Active Bots',
      value: String(botStats.active_bots),
      change: 'Currently running',
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Messages Today',
      value: String(totalMessagesToday),
      change: `${parseFloat(avgMessagesChange) > 0 ? '+' : ''}${avgMessagesChange}% from yesterday`,
      icon: MessageSquare,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Success Rate',
      value: `${avgSuccessRate}%`,
      change: `${parseFloat(avgSuccessChange) > 0 ? '+' : ''}${avgSuccessChange}% from prev 7d`,
      icon: BarChart2,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <>
      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {analyticsData.map((data, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{data.title}</CardTitle>
              <div className={cn("p-2 rounded-lg", data.bgColor)}>
                <data.icon className={cn("h-4 w-4", data.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl pb-2 font-bold">{data.value}</div>
              <p className="text-xs text-muted-foreground">{data.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Your Bots Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Bots</h2>
          <p className="text-muted-foreground">Manage and monitor your bots.</p>
        </div>
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search bots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-full"
            />
        </div>
      </div>

      {/* Bots Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        <CreateBotCard onClick={() => setIsCreateDialogOpen(true)} />
        {filteredBots.map((bot) => (
          <BotCard
            key={bot.id}
            bot={bot}
            onDelete={() => { setBotToInteract(bot); setDeleteDialogOpen(true); }}
            onDuplicate={() => handleDuplicateBot(bot.id)}
            onRename={handleRenameBot}
            onManageFlows={() => navigate(`/bot/${bot.id}/flows`)}
            onSetActiveFlow={handleSetActiveFlow}
            onOpenSettings={() => setSettingsBotId(bot.id)}
          />
        ))}
      </div>

      {/* Dialogs */}
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

      <Dialog open={isRenameDialogOpen} onOpenChange={(open) => {
        setIsRenameDialogOpen(open);
        if (!open) {
          setNewBotName('');
          setSelectedBotId(null);
          setBotNameError('');
        }
      }}>
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

      <Dialog open={!!settingsBotId} onOpenChange={(open) => { if (!open) setSettingsBotId(null); }}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="sr-only">
            <DialogTitle>Bot Settings</DialogTitle>
            <DialogDescription>Configure your bot's settings, WhatsApp connection, and behavior preferences.</DialogDescription>
          </DialogHeader>
          {settingsBotId && <BotSettingsPage botId={settingsBotId} onClose={() => setSettingsBotId(null)} onBotUpdated={() => fetchBots(setBots)} />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard; 
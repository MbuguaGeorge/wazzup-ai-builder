import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  MoreVertical,
  Pencil,
  Settings2,
  Trash2,
  Copy,
  Edit3,
  MessageSquare,
  AlertCircle,
  GitBranch,
  Check,
  MessageCircle,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Flow {
  id: string;
  name: string;
  status: 'active' | 'draft' | 'archived';
}

interface BotCardProps {
  bot: {
    whatsapp_connected: boolean;
    id: string;
    name: string;
    createdAt: string;
    status: 'active' | 'draft' | 'disconnected';
    last_updated: string;
    activeFlow?: {
      id: string;
      name: string;
    } | null;
    flows?: Flow[];
  };
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onManageFlows: (id: string) => void;
  onSetActiveFlow?: (botId: string, flowId: string) => void;
  onOpenSettings?: () => void;
}

const statusConfig = {
  active: { icon: '🟢', label: 'Active', className: 'bg-green-500/10 text-green-500' },
  draft: { icon: '📝', label: 'Draft', className: 'bg-yellow-500/10 text-yellow-500' },
  disconnected: { icon: '🔴', label: 'Disconnected', className: 'bg-red-500/10 text-red-500' },
};

const BotCard: React.FC<BotCardProps> = ({ bot, onDelete, onDuplicate, onRename, onManageFlows, onSetActiveFlow, onOpenSettings }) => {
  const navigate = useNavigate();
  const status = statusConfig[bot.status];
  const flows = bot.flows || [];

  const handleFlowChange = (flowId: string) => {
    if (onSetActiveFlow && flowId !== "none") {
      onSetActiveFlow(bot.id, flowId);
    }
  };

  return (
    <Card className="group">
      <CardHeader className="flex flex-row items-start justify-between p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">{bot.name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={status.className}>
                {status.icon} {status.label}
              </Badge>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-muted-foreground" />
                <Select
                  value={bot.activeFlow?.id || "none"}
                  onValueChange={handleFlowChange}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select active flow" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No active flow</SelectItem>
                    {flows.map((flow) => (
                      <SelectItem key={flow.id} value={flow.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{flow.name}</span>
                          {flow.status === 'active' && (
                            <Check className="w-4 h-4 ml-2 text-green-500" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Bot Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onRename(bot.id, bot.name)}>
              <Edit3 className="mr-2 h-4 w-4" />
              Rename Bot
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(bot.id)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate Bot
            </DropdownMenuItem>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <DropdownMenuItem
                      onClick={() => {
                        if (bot.whatsapp_connected && bot.status === 'active') {
                          navigate(`/dashboard/chat-management?botId=${bot.id}`);
                        }
                      }}
                      disabled={!bot.whatsapp_connected || bot.status !== 'active'}
                      className={!bot.whatsapp_connected || bot.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      View Messages
                    </DropdownMenuItem>
                  </span>
                </TooltipTrigger>
                {(!bot.whatsapp_connected || bot.status !== 'active') && (
                  <TooltipContent>
                    { !bot.whatsapp_connected
                      ? "Bot is not connected to WhatsApp. Please connect to view messages."
                      : "Bot is not active. Please activate your bot to view messages."
                    }
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(bot.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Bot
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Last updated {new Date(bot.last_updated).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  {bot.whatsapp_connected ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        WhatsApp Connected
                      </Badge>
                  ) : (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Not Connected
                      </Badge>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {bot.whatsapp_connected
                  ? "This bot can currently receive and reply to WhatsApp messages"
                  : "Connect this bot to WhatsApp to start receiving messages"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSettings}
            >
              <Settings2 className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate(`/flow-builder/${bot.id}`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Flow
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BotCard; 
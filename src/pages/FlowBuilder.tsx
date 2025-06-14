import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  ReactFlowInstance,
  useKeyPress
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Play, Share, Plus, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from '@/components/flow-builder/Sidebar';
import MessageNode from '@/components/flow-builder/nodes/MessageNode';
import AINode from '@/components/flow-builder/nodes/AINode';
import InputNode from '@/components/flow-builder/nodes/InputNode';
import ConditionNode from '@/components/flow-builder/nodes/ConditionNode';
import AppointmentNode from '@/components/flow-builder/nodes/AppointmentNode';
import OrderNode from '@/components/flow-builder/nodes/OrderNode';
import SheetNode from '@/components/flow-builder/nodes/SheetNode';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useParams } from 'react-router-dom';
import { authFetch } from '@/lib/authFetch';

const nodeTypes = {
  messageNode: MessageNode,
  aiNode: AINode,
  inputNode: InputNode,
  conditionNode: ConditionNode,
  appointmentNode: AppointmentNode,
  orderNode: OrderNode,
  sheetNode: SheetNode,
};

const API_BASE_URL = 'http://localhost:8000';

const FlowBuilder = () => {
  const { botId } = useParams<{ botId: string }>();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [flowName, setFlowName] = useState('Untitled Flow');
  const [selectedElements, setSelectedElements] = useState<{ nodes: Node[]; edges: Edge[] }>({
    nodes: [],
    edges: [],
  });
  const [flows, setFlows] = useState<any[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<any | null>(null);
  const [flowFilter, setFlowFilter] = useState('all');
  const [isCreateFlowDialogOpen, setIsCreateFlowDialogOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [flowNameError, setFlowNameError] = useState('');

  // Fetch flows for the bot on mount
  useEffect(() => {
    async function fetchFlows() {
      if (!botId) return;
      try {
        const response = await authFetch(`${API_BASE_URL}/api/bots/${botId}/flows/`);
        if (response.ok) {
          const data = await response.json();
          setFlows(data);
          if (data.length > 0) setSelectedFlow(data[0]);
        }
      } catch (err) {}
    }
    fetchFlows();
  }, [botId]);

  const filteredFlows = flows.filter((flow) => {
    if (flowFilter === 'all') return true;
    return flow.status === flowFilter;
  });

  const deletePressed = useKeyPress(['Delete', 'Backspace']);

  useEffect(() => {
    if (deletePressed && (selectedElements.nodes.length > 0 || selectedElements.edges.length > 0)) {
      setNodes((nds) =>
        nds.filter((node) => !selectedElements.nodes.find((n) => n.id === node.id))
      );
      setEdges((eds) =>
        eds.filter((edge) => !selectedElements.edges.find((e) => e.id === edge.id))
      );
    }
  }, [deletePressed, selectedElements]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'string' && reactFlowBounds && reactFlowInstance) {
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNode: Node = {
          id: `${type}-${nodes.length + 1}`,
          type,
          position,
          data: { label: `${type} node` },
        };

        setNodes((nds) => nds.concat(newNode));
      }
    },
    [reactFlowInstance, nodes, setNodes]
  );

  const onSelectionChange = useCallback(
    (params: { nodes: Node[]; edges: Edge[] }) => {
      setSelectedElements(params);
    },
    []
  );

  const validateFlowName = (name: string) => {
    if (!name.trim()) {
      setFlowNameError('Flow name is required');
      return false;
    }
    const existingFlow = flows.find(
      (flow: any) => flow.name.toLowerCase() === name.toLowerCase()
    );
    if (existingFlow) {
      setFlowNameError('A flow with this name already exists');
      return false;
    }
    setFlowNameError('');
    return true;
  };

  const handleCreateFlow = async () => {
    if (!validateFlowName(newFlowName) || !botId) return;
    try {
      const response = await authFetch(`${API_BASE_URL}/api/bots/${botId}/flows/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFlowName, flow_data: { nodes: [], edges: [] } }),
      });
      if (response.ok) {
        const newFlow = await response.json();
        setFlows([...flows, newFlow]);
        setSelectedFlow(newFlow);
        setNewFlowName('');
        setIsCreateFlowDialogOpen(false);
      }
    } catch (err) {}
  };

  const handleSetActive = async (flowId: string) => {
    if (!botId) return;
    try {
      const response = await authFetch(`${API_BASE_URL}/api/flows/${flowId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: true }),
      });
      if (response.ok) {
        const updatedFlow = await response.json();
        setFlows(flows.map((flow: any) => ({ ...flow, is_active: flow.id === flowId })));
        setSelectedFlow(updatedFlow);
      }
    } catch (err) {}
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-col gap-2 px-6 py-4">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Select
                  value={selectedFlow?.id}
                  onValueChange={(value) => setSelectedFlow(flows.find(f => f.id === value))}
                >
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Select a flow" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredFlows.map((flow) => (
                      <SelectItem key={flow.id} value={flow.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{flow.name}</span>
                          {flow.is_active && (
                            <Badge variant="secondary" className="ml-2">
                              Active
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsCreateFlowDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Flow
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Flow Actions
              </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!selectedFlow?.is_active && (
                      <DropdownMenuItem onClick={() => handleSetActive(selectedFlow.id)}>
                        <Check className="w-4 h-4 mr-2" />
                        Set as Active
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Share className="w-4 h-4 mr-2" />
                      Share Flow
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              <Button size="sm" className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Tabs value={flowFilter} onValueChange={setFlowFilter} className="w-[400px]">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="draft">Drafts</TabsTrigger>
                  <TabsTrigger value="archived">Archived</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Play className="w-4 h-4" />
                  Test Flow
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            fitView
            className="bg-secondary/10"
            deleteKeyCode={null}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>

      <Dialog open={isCreateFlowDialogOpen} onOpenChange={setIsCreateFlowDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Flow</DialogTitle>
            <DialogDescription>
              Give your flow a name. You can customize its behavior after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="flowName">Flow Name</Label>
              <Input
                id="flowName"
                placeholder="e.g., Customer Support Flow"
                value={newFlowName}
                onChange={(e) => {
                  setNewFlowName(e.target.value);
                  validateFlowName(e.target.value);
                }}
              />
              {flowNameError && (
                <p className="text-sm text-destructive">{flowNameError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateFlowDialogOpen(false);
                setNewFlowName('');
                setFlowNameError('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateFlow} 
              disabled={!newFlowName.trim() || !!flowNameError}
            >
              Create Flow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlowBuilder; 
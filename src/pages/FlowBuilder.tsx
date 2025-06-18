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
  useKeyPress,
  MarkerType
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
import { toast } from '@/components/ui/sonner';
import { useBeforeUnload } from 'react-router-dom';

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

// Utility for deep cloning
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

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
  const [unsaved, setUnsaved] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const lastSaved = useRef({ nodes: [], edges: [] });
  const [invalidEdgeIds, setInvalidEdgeIds] = useState<string[]>([]);
  const [loopDetected, setLoopDetected] = useState(false);

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

  // Helper: get node index by id
  const getNodeIndex = (id: string) => nodes.findIndex((n) => n.id === id);

  // Helper: detect cycles (DFS)
  function hasCycle(edges: Edge[], nodes: Node[], allowConditionLoop = true, maxLoops = 1) {
    const graph: Record<string, string[]> = {};
    nodes.forEach((n) => (graph[n.id] = []));
    edges.forEach((e) => {
      if (graph[e.source]) graph[e.source].push(e.target);
    });
    let loopCount = 0;
    const visited = new Set<string>();
    const recStack = new Set<string>();
    function dfs(nodeId: string, fromCondition = false): boolean {
      if (!visited.has(nodeId)) {
        visited.add(nodeId);
        recStack.add(nodeId);
        for (const neighbor of graph[nodeId]) {
          const edge = edges.find((e) => e.source === nodeId && e.target === neighbor);
          const fromCond = fromCondition || (edge && nodes.find((n) => n.id === nodeId)?.type === 'conditionNode');
          if (!visited.has(neighbor) && dfs(neighbor, fromCond)) return true;
          else if (recStack.has(neighbor)) {
            loopCount++;
            if (!fromCond || loopCount > maxLoops) return true;
          }
        }
      }
      recStack.delete(nodeId);
      return false;
    }
    for (const n of nodes) {
      if (dfs(n.id)) return true;
    }
    return false;
  }

  // Validate edges on change
  useEffect(() => {
    let invalids: string[] = [];
    let loop = false;
    edges.forEach((edge) => {
      const sourceIdx = getNodeIndex(edge.source);
      const targetIdx = getNodeIndex(edge.target);
      // Prevent backward connection
      if (sourceIdx > -1 && targetIdx > -1 && targetIdx <= sourceIdx) {
        invalids.push(edge.id);
      }
    });
    // Loop detection (allow 1 loop from condition node)
    loop = hasCycle(edges, nodes, true, 1);
    if (loop) {
      // Find all edges in the cycle (for highlight)
      // For simplicity, highlight all edges if a loop is detected
      invalids = [...new Set([...invalids, ...edges.map((e) => e.id)])];
    }
    setInvalidEdgeIds(invalids);
    setLoopDetected(loop);
  }, [edges, nodes]);

  // Custom onConnect handler
  const onConnect = useCallback(
    (params: Connection | Edge) => {
      const sourceIdx = getNodeIndex(params.source!);
      const targetIdx = getNodeIndex(params.target!);
      if (sourceIdx > -1 && targetIdx > -1 && targetIdx >= sourceIdx) {
        // Allow forward connection
        setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds));
      } else {
        toast.error('Backward connections are not allowed.');
      }
    },
    [setEdges, nodes]
  );

  // Edge style for invalid edges
  const edgeStyles = (edge: Edge) =>
    invalidEdgeIds.includes(edge.id)
      ? { stroke: 'red', strokeWidth: 2, markerEnd: { type: MarkerType.ArrowClosed, color: 'red' } }
      : { markerEnd: { type: MarkerType.ArrowClosed } };

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

  const handleUpdateFlow = async (flowId: string, data: any) => {
    // Always send full nodes/edges
    if (data.flow_data) {
      data.flow_data = {
        nodes: deepClone(data.flow_data.nodes),
        edges: deepClone(data.flow_data.edges),
      };
    }
    try {
      const response = await authFetch(`${API_BASE_URL}/api/flows/${flowId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const updatedFlow = await response.json();
        setFlows(flows.map((flow: any) => flow.id === flowId ? updatedFlow : flow));
        setSelectedFlow(updatedFlow);
      }
    } catch (err) {}
  };

  const handleDeleteFlow = async (flowId: string) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/flows/${flowId}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setFlows(flows.filter((flow: any) => flow.id !== flowId));
        setSelectedFlow(flows.length > 1 ? flows[0] : null);
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

  useEffect(() => {
    if (selectedFlow) {
      setNodes(deepClone(selectedFlow.flow_data?.nodes || []));
      setEdges(deepClone(selectedFlow.flow_data?.edges || []));
      lastSaved.current = {
        nodes: deepClone(selectedFlow.flow_data?.nodes || []),
        edges: deepClone(selectedFlow.flow_data?.edges || []),
      };
      setUnsaved(false);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [selectedFlow]);

  useEffect(() => {
    if (!selectedFlow) return;
    const changed = JSON.stringify(nodes) !== JSON.stringify(lastSaved.current.nodes) || JSON.stringify(edges) !== JSON.stringify(lastSaved.current.edges);
    setUnsaved(changed);
  }, [nodes, edges, selectedFlow]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (unsaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [unsaved]);

  const handleSave = async () => {
    if (!selectedFlow) return;
    // Save full nodes/edges with all fields
    await handleUpdateFlow(selectedFlow.id, { flow_data: { nodes: deepClone(nodes), edges: deepClone(edges) } });
    lastSaved.current = { nodes: deepClone(nodes), edges: deepClone(edges) };
    setUnsaved(false);
    toast.success('Changes saved');
  };

  const canEdit = !!selectedFlow;

  // Show toast if loop detected
  useEffect(() => {
    if (loopDetected) {
      toast.error('Loops are not allowed except for a single conditional return.');
    }
  }, [loopDetected]);

  useEffect(() => {
    document.title = 'wozza | Flow Builder';
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar canEdit={canEdit} />
      
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
              <Button size="sm" className="gap-2" onClick={handleSave} disabled={!unsaved || !canEdit || invalidEdgeIds.length > 0 || loopDetected}>
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
            nodes={nodes.map((node) => {
              if (node.type === 'aiNode') {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    onModelChange: (model) => setNodes((nds) => nds.map((n) => n.id === node.id ? { ...n, data: { ...n.data, model } } : n)),
                    onSystemPromptChange: (systemPrompt) => setNodes((nds) => nds.map((n) => n.id === node.id ? { ...n, data: { ...n.data, systemPrompt } } : n)),
                    onTemplateChange: (template) => setNodes((nds) => nds.map((n) => n.id === node.id ? { ...n, data: { ...n.data, template } } : n)),
                  },
                };
              }
              return node;
            })}
            edges={edges.map((edge) => ({ ...edge, style: edgeStyles(edge) as any }))}
            onNodesChange={canEdit ? onNodesChange : undefined}
            onEdgesChange={canEdit ? onEdgesChange : undefined}
            onConnect={canEdit ? onConnect : undefined}
            onInit={setReactFlowInstance}
            onDrop={canEdit ? onDrop : undefined}
            onDragOver={canEdit ? onDragOver : undefined}
            onSelectionChange={canEdit ? onSelectionChange : undefined}
            nodeTypes={nodeTypes}
            fitView
            className={`bg-secondary/10 ${!canEdit ? 'pointer-events-none opacity-50' : ''}`}
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

      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>You have unsaved changes. Save before leaving?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowUnsavedDialog(false); /* discard changes logic */ }}>Discard</Button>
            <Button onClick={async () => { await handleSave(); setShowUnsavedDialog(false); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlowBuilder; 
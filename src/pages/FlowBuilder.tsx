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
import EndNode from '@/components/flow-builder/nodes/EndNode';
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
import { toast as useToast } from "@/components/ui/use-toast";
import isEqual from 'lodash/isEqual';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const nodeTypes = {
  messageNode: MessageNode,
  aiNode: AINode,
  inputNode: InputNode,
  conditionNode: ConditionNode,
  appointmentNode: AppointmentNode,
  orderNode: OrderNode,
  sheetNode: SheetNode,
  endNode: EndNode,
};

const API_BASE_URL = 'https://core.wozza.io';

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
  const lastSaved = useRef<{ nodes: Node[], edges: Edge[] } | null>(null);
  const [invalidEdgeIds, setInvalidEdgeIds] = useState<string[]>([]);
  const [loopDetected, setLoopDetected] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [initialFlowData, setInitialFlowData] = useState(null);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);

  // Fetch flows for the bot on mount
  useEffect(() => {
    async function fetchFlows() {
      if (!botId) return;
      try {
        const response = await authFetch(`${API_BASE_URL}/api/bots/${botId}/flows/`);
        if (response.ok) {
          const data = await response.json();
          setFlows(data);
          if (data.length > 0) {
            const active = data.find((f:any) => f.is_active) || data[0];
            setSelectedFlow(active);
          }
        }
      } catch (err) {}
      setIsLoading(false);
    }
    fetchFlows();
  }, [botId]);

  useEffect(() => {
    if (selectedFlow && !isEqual(initialFlowData, { nodes, edges })) {
      setIsChanged(true);
    } else {
      setIsChanged(false);
    }
  }, [nodes, edges, initialFlowData, selectedFlow]);

  useEffect(() => {
    if (selectedFlow && lastSaved.current) {
        // A more robust check for changes
        const currentFlowData = { nodes, edges };
        setUnsaved(!isEqual(currentFlowData, lastSaved.current));
    } else {
        setUnsaved(false);
    }
  }, [nodes, edges, selectedFlow]);

  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          // Create a new data object to ensure React detects the change
          const newData = { ...node.data, ...data };
          return { ...node, data: newData };
        }
        return node;
      })
    );
  }, [setNodes]);

  const refetchSingleFlow = async (flowId: string) => {
    const response = await authFetch(`${API_BASE_URL}/api/flows/${flowId}/`);
    if (response.ok) {
      const updatedFlow = await response.json();
      setFlows(flows.map(f => f.id === flowId ? updatedFlow : f));
      setSelectedFlow(updatedFlow);
    }
  }

  const handleFileChange = async (nodeId: string, filesToUpload: File[]) => {
    const originalNode = nodes.find(n => n.id === nodeId);
    if (!originalNode || !selectedFlow) return;

    // 1. Optimistic UI update
    const optimisticFiles = filesToUpload.map(file => ({
      id: `temp-${Date.now()}-${file.name}`,
      name: file.name,
      uploading: true,
    }));

    setNodes(nds => nds.map(n => {
      if (n.id === nodeId) {
        const newFiles = [...(n.data.files || []), ...optimisticFiles];
        return { ...n, data: { ...n.data, files: newFiles } };
      }
      return n;
    }));

    // 2. Upload the files
    const formData = new FormData();
    filesToUpload.forEach(file => formData.append('file', file));
    formData.append('node_id', nodeId);

    try {
      const response = await authFetch(`${API_BASE_URL}/api/flows/${selectedFlow.id}/upload/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('File upload failed');
      
      const uploadedFiles = await response.json();
      
      // 3. Replace optimistic files with real ones
      setNodes(nds => nds.map(n => {
        if (n.id === nodeId) {
          const nonTemporaryFiles = n.data.files.filter(f => !f.id.startsWith('temp-'));
          const finalFiles = [...nonTemporaryFiles, ...uploadedFiles.map(f => ({ id: f.id, name: f.name }))];
          return { ...n, data: { ...n.data, files: finalFiles } };
        }
        return n;
      }));
      toast.success('File uploaded successfully');

    } catch (error) {
      console.error('File upload error:', error);
      // 4. Revert on failure
      setNodes(nds => nds.map(n => {
        if (n.id === nodeId) {
          const revertedFiles = n.data.files.filter(f => !f.id.startsWith('temp-'));
          return { ...n, data: { ...n.data, files: revertedFiles } };
        }
        return n;
      }));
      toast.error('Error uploading file. Please try again.');
    }
  };

  const handleFileRemove = async (nodeId: string, fileToRemove: any) => {
    const originalNode = nodes.find(n => n.id === nodeId);
    if (!originalNode || !selectedFlow) return;

    const originalFiles = originalNode.data.files;

    // 1. Optimistic UI update
    setNodes(nds => nds.map(n => {
        if (n.id === nodeId) {
            const newFiles = n.data.files.filter(f => f.id !== fileToRemove.id);
            return { ...n, data: { ...n.data, files: newFiles } };
        }
        return n;
    }));

    try {
      if (fileToRemove.id.startsWith('temp-')) return; // It's not on the server yet

      const response = await authFetch(`${API_BASE_URL}/api/flows/${selectedFlow.id}/files/${fileToRemove.id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('File deletion failed');
      
      toast.success('File deleted successfully');
      
    } catch (error) {
      console.error('File deletion error:', error);
      // 2. Revert on failure
      setNodes(nds => nds.map(n => {
          if (n.id === nodeId) {
              return { ...n, data: { ...n.data, files: originalFiles } };
          }
          return n;
      }));
      toast.error('Error deleting file. Please try again.');
    }
  };

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

  const validateFlow = useCallback((nodesToValidate: Node[], edgesToValidate: Edge[]) => {
    const issues: string[] = [];
    if (nodesToValidate.length === 0) return;

    const entryNode = nodesToValidate.find(n => n.type === 'inputNode');
    if (!entryNode) {
        issues.push("A flow must have an 'Incoming Message' entry node.");
    }

    const nodeIds = new Set(nodesToValidate.map(n => n.id));
    const connectedTargets = new Set(edgesToValidate.map(e => e.target));
    const connectedSources = new Set(edgesToValidate.map(e => e.source));

    // 1. Cycle Detection (DFS)
    const visited = new Set();
    const recursionStack = new Set();
    const graph = new Map(nodesToValidate.map(n => [n.id, []]));
    edgesToValidate.forEach(e => graph.get(e.source)?.push(e.target));

    function detectCycle(nodeId: string): boolean {
        visited.add(nodeId);
        recursionStack.add(nodeId);
        const neighbors = graph.get(nodeId) || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                if (detectCycle(neighbor)) return true;
            } else if (recursionStack.has(neighbor)) {
                return true;
            }
        }
        recursionStack.delete(nodeId);
      return false;
    }

    if (nodesToValidate.some(n => !visited.has(n.id) && detectCycle(n.id))) {
        issues.push("The flow contains a cycle or loop. Please remove it.");
    }

    // 2. Orphaned and Unreachable nodes
    if (entryNode) {
        const reachableNodes = new Set([entryNode.id]);
        const queue = [entryNode.id];

        while(queue.length > 0) {
            const currentId = queue.shift()!;
            const outgoingEdges = edgesToValidate.filter(e => e.source === currentId);
            for (const edge of outgoingEdges) {
                if (!reachableNodes.has(edge.target)) {
                    reachableNodes.add(edge.target);
                    queue.push(edge.target);
                }
            }
        }

        nodesToValidate.forEach(node => {
            if (!reachableNodes.has(node.id)) {
                issues.push(`Node '${node.data.label || node.id}' is unreachable from the entry point.`);
            }
            if (node.id !== entryNode.id && !connectedTargets.has(node.id)) {
                issues.push(`Node '${node.data.label || node.id}' is orphaned. It has no incoming connections.`);
            }
        });
    }

    // 3. Nodes without output connections (except terminal nodes)
    const terminalNodeTypes = ['messageNode', 'endNode'];
    nodesToValidate.forEach(node => {
        if (!terminalNodeTypes.includes(node.type!) && !connectedSources.has(node.id) && nodesToValidate.length > 1) {
             // Exception for condition node which has specific source handles
            if (node.type === 'conditionNode') {
                const hasTrueExit = edgesToValidate.some(e => e.source === node.id && e.sourceHandle === 'true');
                const hasFalseExit = edgesToValidate.some(e => e.source === node.id && e.sourceHandle === 'false');
                if (!hasTrueExit || !hasFalseExit) {
                     issues.push(`Condition node '${node.data.label || node.id}' is missing one or more output connections.`);
                }
            } else if (node.type !== 'inputNode' || connectedTargets.has(node.id)) { // not an entry or already connected
                 issues.push(`Node '${node.data.label || node.id}' is a dead end. It has no outgoing connections. Consider connecting it to another node or an 'End Flow' node.`);
            }
        }
    });

    setValidationIssues(issues);
}, []);

  useEffect(() => {
    validateFlow(nodes, edges);
  }, [nodes, edges, validateFlow]);

  // Custom onConnect handler
  const onConnect = useCallback(
    (params: Connection | Edge) => {
        setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds));
    },
    [setEdges]
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

      if (!reactFlowWrapper.current || !selectedFlow) {
        useToast({ title: "Cannot Add Node", description: "Please select or create a flow first.", variant: "destructive" });
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) return;
      if (type === 'inputNode' && nodes.some(n => n.type === 'inputNode')) {
        useToast({ title: "Input Node Exists", description: "Only one Input Node is allowed per flow.", variant: "destructive" });
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const newNodeId = `${type}-${+new Date()}`;
      const baseNode = {
        id: newNodeId,
          type,
          position,
          data: { 
            label: `${type} node`,
            onUpdate: (data) => updateNodeData(newNodeId, data),
            onFilesChange: (files) => handleFileChange(newNodeId, files),
            onFileRemove: (file) => handleFileRemove(newNodeId, file),
          },
        };

      let specificNode;
      switch (type) {
        case 'messageNode':
          specificNode = {
            ...baseNode,
            data: {
              ...baseNode.data,
              message: '',
            },
          };
          break;
        case 'endNode':
          specificNode = {
            ...baseNode,
            data: {
              ...baseNode.data,
            },
          };
          break;
        case 'aiNode':
          specificNode = {
            ...baseNode,
            data: {
              ...baseNode.data,
              flow_id: selectedFlow?.id,
              systemPrompt: '',
              model: 'gpt-4o',
              template: 'AI Response: {openai_response}',
              fallbackResponse: "I'm sorry, I don't have the information to answer that. Let me connect you to a human.",
              extraInstructions: '',
              files: [],
              gdrive_links: [],
            },
          };
          break;
        case 'conditionNode':
          specificNode = {
            ...baseNode,
            data: {
              ...baseNode.data,
              condition: {
                type: 'text',
                operator: 'equals',
                value: '',
              },
            },
          };
          break;
        default:
          specificNode = baseNode;
      }

      setNodes((nds) => nds.concat(specificNode));
    },
    [reactFlowInstance, nodes, selectedFlow, updateNodeData]
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
        toast.success('Flow created successfully');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to create flow. Please try again.';
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error('Error creating flow:', err);
      toast.error('Failed to create flow. Please try again.');
    }
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
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to update flow. Please try again.';
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error('Error updating flow:', err);
      toast.error('Failed to update flow. Please try again.');
    }
  };

  const handleDeleteFlow = async (flowId: string) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/flows/${flowId}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setFlows(flows.filter((flow: any) => flow.id !== flowId));
        setSelectedFlow(flows.length > 1 ? flows[0] : null);
        toast.success('Flow deleted successfully');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to delete flow. Please try again.';
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error('Error deleting flow:', err);
      toast.error('Failed to delete flow. Please try again.');
    }
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
        toast.success('Flow activated successfully');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to activate flow. Please try again.';
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error('Error activating flow:', err);
      toast.error('Failed to activate flow. Please try again.');
    }
  };

  useEffect(() => {
    if (selectedFlow) {
      const flowData = selectedFlow.flow_data || { nodes: [], edges: [] };
      
      const initialNodes = deepClone(flowData.nodes).map((node: any) => {
        const nodeId = node.id;
        node.data.onUpdate = (data) => updateNodeData(nodeId, data);
        node.data.onFilesChange = (files) => handleFileChange(nodeId, files);
        node.data.onFileRemove = (file) => handleFileRemove(nodeId, file);
        node.data.flow_id = selectedFlow?.id;
        return node;
      });
      const initialEdges = deepClone(flowData.edges);

      setNodes(initialNodes);
      setEdges(initialEdges);
      lastSaved.current = {
        nodes: initialNodes,
        edges: initialEdges,
      };
      setUnsaved(false);
    } else {
      setNodes([]);
      setEdges([]);
      lastSaved.current = null;
    }
  }, [selectedFlow, updateNodeData]);

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
    validateFlow(nodes, edges);
    if (validationIssues.length > 0) {
      toast.error("Cannot save flow with validation issues. Please fix them first.");
      return;
    }

    // Create a clean payload for saving
    const nodesToSave = deepClone(nodes).map(node => {
      delete node.data.onUpdate;
      delete node.data.onFilesChange;
      delete node.data.onFileRemove;
      // remove any lingering temp files
      if (node.data.files) {
        node.data.files = node.data.files.filter(f => !f.uploading);
      }
      return node;
    });

    await handleUpdateFlow(selectedFlow.id, { 
      flow_data: { nodes: nodesToSave, edges: deepClone(edges) } 
    });
    
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
              <Button size="sm" className="gap-2" onClick={handleSave} disabled={!unsaved || !canEdit || validationIssues.length > 0}>
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
            {validationIssues.length > 0 && (
                <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Flow Validation Issues</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc pl-5">
                            {validationIssues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}
          </div>
        </div>

        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
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
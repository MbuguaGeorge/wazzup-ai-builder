import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useReactFlow } from 'reactflow';

interface DeleteButtonProps {
  nodeId: string;
}

const DeleteButton = ({ nodeId }: DeleteButtonProps) => {
  const { setNodes, setEdges } = useReactFlow();

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
    setEdges((edges) => edges.filter((edge) => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={(e) => {
        e.stopPropagation();
        handleDelete();
      }}
    >
      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
    </Button>
  );
};

export default DeleteButton; 
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FlagOff } from 'lucide-react';
import DeleteButton from './DeleteButton';

const EndNode = ({ isConnectable, id }: NodeProps) => {
  return (
    <Card className="w-[300px] shadow-md relative group">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-primary"
      />
      <DeleteButton nodeId={id} />
      <CardHeader className="flex flex-row items-center gap-2 p-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <FlagOff className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-medium">End Flow</h3>
      </CardHeader>
      <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
          This node marks the end of a conversation path. No further actions will be taken.
          </p>
      </CardContent>
    </Card>
  );
};

export default memo(EndNode); 
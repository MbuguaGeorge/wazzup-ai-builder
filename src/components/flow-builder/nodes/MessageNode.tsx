import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle } from 'lucide-react';
import DeleteButton from './DeleteButton';

const MessageNode = ({ data, isConnectable, id }: NodeProps) => {
  return (
    <Card className="w-[300px] shadow-md relative group">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-primary"
      />
      <DeleteButton nodeId={id} />
      <CardHeader className="flex flex-row items-center gap-2 p-4 pb-0">
        <div className="p-2 rounded-lg bg-primary/10">
          <MessageCircle className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-medium">Send Message</h3>
      </CardHeader>
      <CardContent className="p-4">
        <Textarea
          placeholder="Enter your message..."
          value={data.message}
          onChange={(e) => data.onChange(e.target.value)}
          className="min-h-[100px] resize-none"
        />
      </CardContent>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-primary"
      />
    </Card>
  );
};

export default memo(MessageNode); 
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Workflow } from 'lucide-react';
import DeleteButton from './DeleteButton';

const ConditionNode = ({ data, isConnectable, id }: NodeProps) => {
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
          <Workflow className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-medium">Condition</h3>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Variable</Label>
          <Input
            placeholder="Enter variable name"
            value={data.variable}
            onChange={(e) => data.onVariableChange?.(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Condition</Label>
          <Select value={data.condition} onValueChange={data.onConditionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">Equals</SelectItem>
              <SelectItem value="contains">Contains</SelectItem>
              <SelectItem value="startsWith">Starts with</SelectItem>
              <SelectItem value="endsWith">Ends with</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Value</Label>
          <Input
            placeholder="Enter value to compare"
            value={data.value}
            onChange={(e) => data.onValueChange?.(e.target.value)}
          />
        </div>
      </CardContent>
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: '25%' }}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: '75%' }}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-red-500"
      />
    </Card>
  );
};

export default memo(ConditionNode); 
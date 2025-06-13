import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Brain } from 'lucide-react';
import DeleteButton from './DeleteButton';

const AINode = ({ data, isConnectable, id }: NodeProps) => {
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
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-medium">AI Response</h3>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Model</Label>
          <Select value={data.model} onValueChange={data.onModelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select AI model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>System Prompt</Label>
          <Textarea
            placeholder="Enter system instructions..."
            value={data.systemPrompt}
            onChange={(e) => data.onSystemPromptChange(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label>Response Template</Label>
          <Textarea
            placeholder="Here's what I found:&#10;{openai_response}&#10;Let me know if you need anything else!"
            value={data.template}
            onChange={(e) => data.onTemplateChange(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>
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

export default memo(AINode); 
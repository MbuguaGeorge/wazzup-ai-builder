import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import DeleteButton from './DeleteButton';

const SheetNode = ({ data, isConnectable, id }: NodeProps) => {
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
          <FileText className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-medium">Save to Sheet</h3>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Sheet ID</Label>
          <Input
            placeholder="Google Sheet ID"
            value={data.sheetId}
            onChange={(e) => data.onSheetIdChange?.(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Sheet Name</Label>
          <Input
            placeholder="e.g., Responses"
            value={data.sheetName}
            onChange={(e) => data.onSheetNameChange?.(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Column Mapping</Label>
          <Textarea
            placeholder="name: {userName}&#10;email: {userEmail}&#10;response: {userResponse}"
            value={data.columnMapping}
            onChange={(e) => data.onColumnMappingChange?.(e.target.value)}
            className="min-h-[100px] font-mono text-sm"
          />
          <p className="text-sm text-muted-foreground">
            Map variables to sheet columns using YAML format
          </p>
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

export default memo(SheetNode); 
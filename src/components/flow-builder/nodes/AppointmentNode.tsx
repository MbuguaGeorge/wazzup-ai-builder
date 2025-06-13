import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import DeleteButton from './DeleteButton';

const AppointmentNode = ({ data, isConnectable, id }: NodeProps) => {
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
          <Calendar className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-medium">Book Appointment</h3>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Calendar Integration</Label>
          <Select value={data.calendar} onValueChange={data.onCalendarChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select calendar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google">Google Calendar</SelectItem>
              <SelectItem value="outlook">Outlook Calendar</SelectItem>
              <SelectItem value="custom">Custom Calendar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Duration (minutes)</Label>
          <Select value={data.duration} onValueChange={data.onDurationChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Event Title Template</Label>
          <Input
            placeholder="e.g., Meeting with {name}"
            value={data.titleTemplate}
            onChange={(e) => data.onTitleTemplateChange?.(e.target.value)}
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

export default memo(AppointmentNode); 
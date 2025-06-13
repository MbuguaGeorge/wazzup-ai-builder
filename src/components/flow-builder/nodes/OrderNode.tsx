import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart } from 'lucide-react';
import DeleteButton from './DeleteButton';

const OrderNode = ({ data, isConnectable, id }: NodeProps) => {
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
          <ShoppingCart className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-medium">Create Order</h3>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Payment Gateway</Label>
          <Select value={data.gateway} onValueChange={data.onGatewayChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment gateway" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="razorpay">Razorpay</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Product Variable</Label>
          <Input
            placeholder="e.g., selectedProduct"
            value={data.productVariable}
            onChange={(e) => data.onProductVariableChange?.(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Success Message</Label>
          <Input
            placeholder="Message to send after successful payment"
            value={data.successMessage}
            onChange={(e) => data.onSuccessMessageChange?.(e.target.value)}
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

export default memo(OrderNode); 
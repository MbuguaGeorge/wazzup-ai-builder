import React from 'react';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface CreateBotCardProps {
  onClick: () => void;
}

const CreateBotCard = ({ onClick }: CreateBotCardProps) => {
  return (
    <Card
      className="group flex h-[200px] flex-col items-center justify-center gap-4 border-2 border-dashed transition-colors hover:border-primary hover:bg-primary/5 cursor-pointer"
      onClick={onClick}
    >
      <div className="rounded-full bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
        <Plus className="h-8 w-8 text-primary" />
      </div>
      <div className="text-center">
        <h3 className="font-medium">Create New Bot</h3>
        <p className="text-sm text-muted-foreground">
          Start building your WhatsApp bot
        </p>
      </div>
    </Card>
  );
};

export default CreateBotCard; 
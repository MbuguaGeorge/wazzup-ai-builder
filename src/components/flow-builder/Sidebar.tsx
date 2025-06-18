import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MessageCircle, Brain, FileText, Calendar, ShoppingCart, Bot, Workflow } from 'lucide-react';

interface NodeTypeProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  type: string;
}

interface SidebarProps { canEdit: boolean; }

const NodeType = ({ icon, label, description, type, canEdit }: NodeTypeProps & { canEdit: boolean }) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    if (!canEdit) return;
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card
      className={`p-4 ${canEdit ? 'cursor-move hover:bg-accent' : 'cursor-not-allowed opacity-50'} transition-colors`}
      draggable={canEdit}
      onDragStart={(event) => onDragStart(event, type)}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 p-2 rounded-lg bg-primary/10">
          {icon}
        </div>
        <div>
          <h3 className="font-medium">{label}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
};

const nodeTypes = {
  messages: [
    {
      icon: <MessageCircle className="w-4 h-4 text-primary" />,
      label: 'Send Message',
      description: 'Send a text, image, or file message',
      type: 'messageNode'
    },
    {
      icon: <Bot className="w-4 h-4 text-primary" />,
      label: 'Incoming Message',
      description: 'Trigger when a message is received from the user',
      type: 'inputNode'
    }
  ],
  ai: [
    {
      icon: <Brain className="w-4 h-4 text-primary" />,
      label: 'AI Response',
      description: 'Generate dynamic responses with GPT-4',
      type: 'aiNode'
    },
    {
      icon: <Workflow className="w-4 h-4 text-primary" />,
      label: 'Condition',
      description: 'Branch flow based on user input',
      type: 'conditionNode'
    }
  ],
  actions: [
    {
      icon: <Calendar className="w-4 h-4 text-primary" />,
      label: 'Book Appointment',
      description: 'Schedule meetings and appointments',
      type: 'appointmentNode'
    },
    {
      icon: <ShoppingCart className="w-4 h-4 text-primary" />,
      label: 'Create Order',
      description: 'Process orders and payments',
      type: 'orderNode'
    },
    {
      icon: <FileText className="w-4 h-4 text-primary" />,
      label: 'Save to Sheet',
      description: 'Save data to Google Sheets',
      type: 'sheetNode'
    }
  ]
};

const Sidebar = ({ canEdit }: SidebarProps) => {
  return (
    <div className="w-80 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full flex-col">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Flow Builder</h2>
          <p className="text-sm text-muted-foreground">
            {canEdit ? 'Drag and drop nodes to build your flow' : 'Create or select a flow to start building.'}
          </p>
        </div>
        <ScrollArea className="flex-1 px-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="messages">
              <AccordionTrigger className="px-2">Messages</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 p-2">
                  {nodeTypes.messages.map((node) => (
                    <NodeType key={node.type} {...node} canEdit={canEdit} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="ai">
              <AccordionTrigger className="px-2">AI & Logic</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 p-2">
                  {nodeTypes.ai.map((node) => (
                    <NodeType key={node.type} {...node} canEdit={canEdit} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="actions">
              <AccordionTrigger className="px-2">Actions</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 p-2">
                  {nodeTypes.actions.map((node) => (
                    <NodeType key={node.type} {...node} canEdit={canEdit} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Sidebar; 
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageSquare, 
  Workflow, 
  Brain, 
  FileText, 
  Inbox, 
  Users, 
  BarChart3, 
  CreditCard 
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Workflow className="w-6 h-6" />,
      title: "Visual Flow Builder",
      description: "Drag-and-drop interface to design conversation flows without any coding knowledge."
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "GPT-4o AI Integration",
      description: "Plug in advanced AI for intelligent, context-aware responses that feel natural."
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "WhatsApp Connection",
      description: "Connect via WhatsApp Business API to use your own WhatsApp Business number."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Knowledge Upload",
      description: "Upload files, documents, or Google Sheets to train your bot with your business data."
    },
    {
      icon: <Inbox className="w-6 h-6" />,
      title: "Real-time Inbox",
      description: "Monitor conversations, take over when needed, and never miss important messages."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Invite team members, assign roles, and manage bot conversations together."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Usage Analytics",
      description: "Track performance, conversation metrics, and optimize your bot's effectiveness."
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Flexible Pricing",
      description: "Start now and scale with transparent, usage-based pricing via Stripe."
    }
  ];

  return (
    <section id="features" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to automate WhatsApp
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From simple FAQ bots to complex sales agents, wozza provides all the tools 
            you need to create powerful WhatsApp automation.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-background/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2 text-lg">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

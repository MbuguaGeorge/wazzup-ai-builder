import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, ArrowDown, MessageCircle, Bot } from 'lucide-react';

const FlowDemo = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See it in action
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Watch how easy it is to create intelligent WhatsApp bots with wozza's visual flow builder. 
            No technical background required.
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          {/* Demo placeholder with visual flow representation */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-background to-secondary/20 border-2 border-dashed border-primary/20">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <Button size="lg" className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    Watch 2-minute Demo
                  </Button>
                </div>
                
                {/* Visual flow representation */}
                <div className="grid md:grid-cols-3 gap-8 w-full mt-12">
                  <div className="flex flex-col items-center text-center min-h-[200px]">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold mb-3">Customer Message</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      "What are your business hours?"
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center min-h-[200px] relative">
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <ArrowDown className="w-6 h-6 text-muted-foreground hidden md:block" />
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Bot className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold mb-3">AI Processing</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Bot analyzes intent and retrieves information
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center min-h-[200px] relative">
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <ArrowDown className="w-6 h-6 text-muted-foreground hidden md:block" />
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold mb-3">Smart Response</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      "We're open Mon-Fri 9AM-6PM, Sat 10AM-4PM. How can I help you today?"
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FlowDemo;

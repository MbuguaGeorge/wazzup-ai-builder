import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle, Zap } from 'lucide-react';
import logo from '@/images/wozza.png';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20 pt-20 pb-16 mt-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            No coding required
          </div>
          
          <div className="flex flex-col items-center mb-6">
            <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">Create AI-Powered WhatsApp Bots in Minutes</h1>
          </div>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Build intelligent WhatsApp automation for your business with wozza, our visual, no-code platform. 
            Connect your number, design conversation flows, and let AI handle customer interactions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="group min-w-[200px]" onClick={() => navigate('/signup')}>
              Start Building Now
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="min-w-[200px]">
              Watch Demo
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-500" />
              Works with any WhatsApp number
            </div>
            <div className="hidden sm:block w-px h-6 bg-border"></div>
            <div>No technical skills needed</div>
            <div className="hidden sm:block w-px h-6 bg-border"></div>
            <div>Start now, scale as you grow</div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/30 rounded-full blur-3xl"></div>
    </section>
  );
};

export default Hero;

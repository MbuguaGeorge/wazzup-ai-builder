import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowRight, Star, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const Pricing = () => {
  const navigate = useNavigate();
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for small businesses getting started",
      credits: "2,500 credits",
      features: [
        "Advanced AI integration",
        "Unlimited bots",
        "File & GSheet/Docs uploads",
        "Real-time inbox",
        "Handoff/takeover chat",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
        "SSL security & 99.9% uptime"
      ],
      cta: "Start 14-day trial",
      highlighted: false
    },
    {
      name: "Growth",
      price: "$79",
      period: "/month",
      description: "Ideal for growing businesses and agencies",
      credits: "6,000 credits",
      features: [
        "Advanced AI integration",
        "Unlimited bots",
        "File & GSheet/Docs uploads",
        "Real-time inbox",
        "Handoff/takeover chat",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
      ],
      cta: "Start 14-day trial",
      highlighted: true
    },
    {
      name: "Scale",
      price: "$149",
      period: "/month",
      description: "For high-volume businesses and enterprises",
      credits: "8,500 credits",
      features: [
        "Advanced AI integration",
        "Unlimited bots",
        "File & GSheet/Docs uploads",
        "Real-time inbox",
        "Handoff/takeover chat",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
      ],
      cta: "Start 14-day trial",
      highlighted: false
    },
    {
      name: "Custom",
      price: "Custom",
      period: "",
      description: "For businesses requiring custom e-commerce integration",
      credits: "Unlimited credits",
      features: [
        "Advanced AI integration",
        "Unlimited bots",
        "File & GSheet/Docs uploads",
        "Real-time inbox",
        "Handoff/takeover chat",
        "Advanced analytics",
        "Priority support",
        "E-commerce website integration",
        "Shopify/WooCommerce integration",
        "Custom integrations",
        "Dedicated development team",
        "Custom feature development",
      ],
      cta: "Contact Sales",
      highlighted: false,
      custom: true
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start free and scale as you grow. No hidden fees, no long-term contracts. 
            Cancel or change plans anytime.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${
                plan.highlighted 
                  ? 'border-primary shadow-lg scale-105 bg-background' 
                  : plan.custom
                  ? 'border-purple-500 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20'
                  : 'bg-background/60 backdrop-blur-sm'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              {plan.custom && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Custom
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
                <div className="mt-3 p-2 bg-primary/10 rounded-lg">
                  <span className="text-sm font-medium text-primary">{plan.credits}</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.highlighted 
                      ? 'bg-primary text-primary-foreground' 
                      : plan.custom
                      ? 'bg-purple-500 hover:bg-purple-600 text-white'
                      : 'variant-outline'
                  }`}
                  variant={plan.highlighted ? 'default' : plan.custom ? 'default' : 'outline'}
                  onClick={() => plan.custom ? window.open('mailto:sales@wozza.io?subject=Custom Plan Inquiry', '_blank') : navigate('/signup')}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Meta Charges Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h3 className="text-2xl font-bold">WhatsApp Business API Charges</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-5 h-5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Meta charges are separate from your Wozza subscription and are billed directly by Meta based on your WhatsApp usage.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          <p className="text-muted-foreground">
              Additional charges from Meta for WhatsApp Business API usage
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-background/60 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg font-semibold">Conversation Charges</CardTitle>
                <div className="mt-2">
                  <span className="text-2xl font-bold">$0.0050</span>
                  <span className="text-muted-foreground text-sm"> per conversation</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  First 1,000 conversations per month are free
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>24-hour conversation window</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Includes all message types</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Billed by Meta directly</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-background/60 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg font-semibold">Media Messages</CardTitle>
                <div className="mt-2">
                  <span className="text-2xl font-bold">$0.0050</span>
                  <span className="text-muted-foreground text-sm"> per message</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Images, videos, documents, audio
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Images & videos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Documents & PDFs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Audio messages</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-background/60 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg font-semibold">Template Messages</CardTitle>
                <div className="mt-2">
                  <span className="text-2xl font-bold">$0.0320</span>
                  <span className="text-muted-foreground text-sm"> per message</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  For initiating conversations
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Marketing messages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Appointment reminders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Order updates</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              <strong>Note:</strong> Meta charges are billed separately from your Wozza subscription. 
              These rates are set by Meta and may change. You'll be charged based on your actual WhatsApp usage.
            <br />
              <a 
                href="https://developers.facebook.com/docs/whatsapp/pricing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View Meta's official pricing →
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;

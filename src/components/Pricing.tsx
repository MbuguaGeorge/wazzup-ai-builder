import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
      name: "Pro",
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
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            All plans include SSL security, 99.9% uptime, and regular feature updates. 
            <br />
            Need something custom? <span className="text-primary cursor-pointer hover:underline" onClick={() => window.open('mailto:sales@wozza.io?subject=Custom Plan Inquiry', '_blank')}>Contact our sales team</span>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;

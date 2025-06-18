
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowRight } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for trying out the platform",
      features: [
        "Up to 100 messages/month",
        "1 WhatsApp bot",
        "Basic flow builder",
        "Email support",
        "Community access"
      ],
      cta: "Start 7-day trial",
      highlighted: false
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "Ideal for small businesses and agencies",
      features: [
        "Up to 2,500 messages/month",
        "5 WhatsApp bots",
        "Advanced AI integration",
        "File & GSheet uploads",
        "Real-time inbox",
        "Team collaboration (3 users)",
        "Priority support"
      ],
      cta: "Start 7-day trial",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large teams and high-volume needs",
      features: [
        "Unlimited messages",
        "Unlimited bots",
        "White-label options",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
        "Advanced analytics"
      ],
      cta: "Contact Sales",
      highlighted: false
    }
  ];

  return (
    <section className="py-20 bg-secondary/30">
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
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${
                plan.highlighted 
                  ? 'border-primary shadow-lg scale-105 bg-background' 
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
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="pt-4">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.highlighted 
                      ? 'bg-primary text-primary-foreground' 
                      : 'variant-outline'
                  }`}
                  variant={plan.highlighted ? 'default' : 'outline'}
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
            Need something custom? <span className="text-primary cursor-pointer hover:underline">Contact our sales team</span>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;

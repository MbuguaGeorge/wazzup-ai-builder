
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Clock, TrendingUp, Users } from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      icon: <Clock className="w-8 h-8 text-blue-500" />,
      title: "Save 10+ hours per week",
      description: "Automate repetitive customer inquiries and focus on growing your business instead of answering the same questions."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-500" />,
      title: "Increase response speed by 90%",
      description: "Provide instant, 24/7 customer support that never sleeps, improving customer satisfaction and retention."
    },
    {
      icon: <Users className="w-8 h-8 text-purple-500" />,
      title: "Handle 10x more conversations",
      description: "Scale your customer support without hiring more staff. Your bot can handle unlimited simultaneous conversations."
    }
  ];

  const useCases = [
    "Customer Support & FAQ automation",
    "Appointment booking and scheduling",
    "Lead qualification and sales",
    "Order status updates",
    "Product recommendations",
    "Event registrations"
  ];

  return (
    <section className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Perfect for businesses of all sizes
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Whether you're a solopreneur, small business, agency, or enterprise team, 
              our platform adapts to your needs and grows with your business.
            </p>
            
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Card className="bg-background/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6">Popular use cases</h3>
                <div className="space-y-4">
                  {useCases.map((useCase, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-foreground">{useCase}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Zap, Users, MessageSquare } from 'lucide-react';
import { authFetch } from '@/lib/authFetch';
import { useNavigate } from 'react-router-dom';

interface SubscriptionData {
  plan: {
    name: string;
    price: number;
    currency: string;
    interval: string;
    features: Record<string, any>;
  };
  status: string;
  current_period_end: string;
}

const SubscriptionSuccess = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const response = await authFetch('http://localhost:8000/api/subscription/current/');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const getTopFeatures = (features: Record<string, any>): string[] => {
    const featureList: string[] = [];
    
    const priorityKeys = ['bots_limit', 'messages_per_month', 'support'];
    
    for (const key of priorityKeys) {
      if (features[key] !== undefined) {
        const value = features[key];
        if (typeof value === 'number') {
          if (value === -1) {
            featureList.push('Unlimited bots');
          } else if (key === 'bots_limit') {
            featureList.push(`${value} bot${value !== 1 ? 's' : ''}`);
          } else if (key === 'messages_per_month') {
            featureList.push(`${value.toLocaleString()} messages/month`);
          }
        } else if (typeof value === 'object' && value !== null) {
          if (key === 'support') {
            const supportFeatures = [];
            if (value.email) supportFeatures.push('Email');
            if (value.chat) supportFeatures.push('Live Chat');
            if (value.phone) supportFeatures.push('Phone');
            if (supportFeatures.length > 0) {
              featureList.push(supportFeatures.join(', ') + ' support');
            }
          }
        }
      }
    }
    
    return featureList.slice(0, 3);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Welcome to {subscription?.plan.name}!</h1>
          <p className="text-lg text-muted-foreground">
            Your subscription has been activated successfully. You're all set to start building amazing chatbots!
          </p>
        </div>

        {/* Subscription Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Your Subscription Details
            </CardTitle>
            <CardDescription>
              Here's what you now have access to
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{subscription?.plan.name}</h3>
                <p className="text-muted-foreground">
                  {formatCurrency(subscription?.plan.price || 0, subscription?.plan.currency || 'usd')}/{subscription?.plan.interval}
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Active
              </Badge>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">What's included:</h4>
              <div className="space-y-2">
                {subscription?.plan.features && getTopFeatures(subscription.plan.features).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Next billing date:</strong> {subscription ? formatDate(subscription.current_period_end) : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Ready to build your first chatbot?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full"
              size="lg"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Create Your First Bot
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/billing')}
                className="w-full"
              >
                View Billing Details
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/support')}
                className="w-full"
              >
                Get Help
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Welcome Message */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Users className="h-8 w-8 text-blue-600 mx-auto" />
              <h3 className="font-semibold text-lg">Welcome to the Community!</h3>
              <p className="text-sm text-muted-foreground">
                You're now part of thousands of businesses using our platform to create amazing customer experiences.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionSuccess; 
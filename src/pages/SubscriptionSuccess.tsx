import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Zap, Users, MessageSquare } from 'lucide-react';
import { authFetch } from '@/lib/authFetch';
import { cookieFetch } from '@/lib/cookieAuth';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/config';

interface SubscriptionData {
  plan: {
    name: string;
    price: number;
    currency: string;
    interval: string;
    features: Record<string, any>;
    credits_per_month: number;
  };
  status: string;
  current_period_end: string;
  is_trialing: boolean;
}

const SubscriptionSuccess = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscriptionData();
    
    // Refresh subscription data after a short delay to ensure webhook processing is complete
    const refreshTimer = setTimeout(() => {
      fetchSubscriptionData();
    }, 2000);
    
    return () => clearTimeout(refreshTimer);
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const response = await cookieFetch(`${API_BASE_URL}/api/subscription/current/`);
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

  const getTopFeatures = (plan: any): string[] => {
    const featureList: string[] = [];
    
    // Credit-based features
    if (plan.credits_per_month) featureList.push(`${plan.credits_per_month.toLocaleString()} credits/month`);
    featureList.push('Unlimited AI models');
    featureList.push('Email support');
    
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
          <h1 className="text-3xl font-bold text-foreground">
            {subscription?.is_trialing ? 'Welcome to Your Trial!' : `Welcome to ${subscription?.plan.name}!`}
          </h1>
          <p className="text-lg text-muted-foreground">
            {subscription?.is_trialing 
              ? "Your trial has been activated successfully. Start exploring our platform!"
              : "Your subscription has been activated successfully. You're all set to start building amazing chatbots!"
            }
          </p>
        </div>

        {/* Subscription Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Your {subscription?.is_trialing ? 'Trial' : 'Subscription'} Details
            </CardTitle>
            <CardDescription>
              Here's what you now have access to
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  {subscription?.is_trialing ? 'Trial Period' : subscription?.plan.name}
                </h3>
                <p className="text-muted-foreground">
                  {subscription?.is_trialing 
                    ? 'Free Trial'
                    : `${formatCurrency(subscription?.plan.price || 0, subscription?.plan.currency || 'usd')}/${subscription?.plan.interval}`
                  }
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {subscription?.is_trialing ? 'Trial' : 'Active'}
              </Badge>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">What's included:</h4>
              <div className="space-y-2">
                {subscription?.plan && getTopFeatures(subscription.plan).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong>
                  {subscription?.is_trialing ? 'Trial ends:' : 'Next billing date:'}
                </strong> {subscription ? formatDate(subscription.current_period_end) : 'N/A'}
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
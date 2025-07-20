import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ArrowLeft, HelpCircle, CreditCard } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SubscriptionError = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const errorType = searchParams.get('error') || 'payment_failed';
  const planId = searchParams.get('plan_id');

  const getErrorDetails = () => {
    switch (errorType) {
      case 'payment_failed':
        return {
          title: 'Payment Failed',
          description: 'We couldn\'t process your payment. This could be due to insufficient funds, expired card, or other payment issues.',
          icon: <CreditCard className="w-8 h-8 text-red-600" />,
          suggestions: [
            'Check that your card details are correct',
            'Ensure you have sufficient funds',
            'Try a different payment method',
            'Contact your bank if the issue persists'
          ]
        };
      case 'canceled':
        return {
          title: 'Subscription Canceled',
          description: 'You canceled the subscription process. No charges were made to your account.',
          icon: <AlertTriangle className="w-8 h-8 text-yellow-600" />,
          suggestions: [
            'You can try subscribing again anytime',
            'Check our pricing plans',
            'Contact support if you have questions'
          ]
        };
      case 'network_error':
        return {
          title: 'Connection Error',
          description: 'We encountered a network issue while processing your payment. Please try again.',
          icon: <RefreshCw className="w-8 h-8 text-blue-600" />,
          suggestions: [
            'Check your internet connection',
            'Try refreshing the page',
            'Wait a few minutes and try again',
            'Contact support if the problem continues'
          ]
        };
      default:
        return {
          title: 'Something Went Wrong',
          description: 'We encountered an unexpected error while processing your subscription.',
          icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
          suggestions: [
            'Try the subscription process again',
            'Check your payment method',
            'Contact our support team for assistance'
          ]
        };
    }
  };

  const errorDetails = getErrorDetails();

  const handleRetry = () => {
    if (planId) {
      navigate(`/dashboard/billing?retry_plan=${planId}`);
    } else {
      navigate('/dashboard/billing');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        {/* Error Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            {errorDetails.icon}
          </div>
          <h1 className="text-3xl font-bold text-foreground">{errorDetails.title}</h1>
          <p className="text-lg text-muted-foreground">
            {errorDetails.description}
          </p>
        </div>

        {/* Error Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              What you can do
            </CardTitle>
            <CardDescription>
              Here are some suggestions to resolve this issue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {errorDetails.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              Choose what you'd like to do next
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleRetry} 
              className="w-full"
              size="lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/billing')}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Billing
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/support')}
                className="w-full"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Get Help
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support Information */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <HelpCircle className="h-8 w-8 text-blue-600 mx-auto" />
              <h3 className="font-semibold text-lg">Need Help?</h3>
              <p className="text-sm text-muted-foreground">
                Our support team is here to help you resolve any issues with your subscription.
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/support')}>
                  Contact Support
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open('mailto:support@wozza.io')}>
                  Email Us
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionError; 
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Check, XCircle, Download, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authFetch } from '@/lib/authFetch';
import { toast } from '@/components/ui/sonner';

interface SubscriptionPlan {
  id: number;
  name: string;
  plan_type: string;
  stripe_price_id: string;
  price: number;
  currency: string;
  interval: string;
  trial_days: number;
  features: Record<string, any>;
  is_active: boolean;
}

interface Subscription {
  id: number;
  plan: SubscriptionPlan;
  stripe_subscription_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  trial_start: string | null;
  trial_end: string | null;
  canceled_at: string | null;
  days_until_expiry: number;
  is_active: boolean;
  is_trialing: boolean;
  payment_methods: PaymentMethod[];
  invoices: Invoice[];
}

interface PaymentMethod {
  id: number;
  stripe_payment_method_id: string;
  card_brand: string;
  card_last4: string;
  card_exp_month: number;
  card_exp_year: number;
  is_default: boolean;
  created_at: string;
}

interface Invoice {
  id: number;
  stripe_invoice_id: string;
  amount: number;
  currency: string;
  status: string;
  invoice_pdf: string;
  hosted_invoice_url: string;
  created_at: string;
}

const Billing = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [upgradingPlanId, setUpgradingPlanId] = useState<number | null>(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [downgradeConfirmOpen, setDowngradeConfirmOpen] = useState(false);
  const [pendingDowngradePlan, setPendingDowngradePlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    fetchSubscriptionData();
    
    // Check for retry plan parameter
    const urlParams = new URLSearchParams(window.location.search);
    const retryPlan = urlParams.get('retry_plan');
    
    if (retryPlan) {
      // Auto-select the plan that failed
      const planId = parseInt(retryPlan);
      if (planId && plans.some(plan => plan.id === planId)) {
        // You could add logic here to highlight or auto-click the failed plan
        console.log('Retrying plan:', planId);
      }
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      
      const subscriptionRes = await authFetch('http://localhost:8000/api/subscription/current/');
      if (subscriptionRes.ok) {
        const subscriptionData = await subscriptionRes.json();
        setSubscription(subscriptionData);
      }
      
      const plansRes = await authFetch('http://localhost:8000/api/subscription/plans/');
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData);
      }
      
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    setCanceling(true);
    try {
      const response = await authFetch('http://localhost:8000/api/subscription/cancel/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancel_at_period_end: true }),
      });
      
      if (response.ok) {
        toast.success('Subscription will be canceled at the end of the current period.');
        await fetchSubscriptionData();
      } else {
        toast.error('Failed to cancel subscription.');
      }
    } catch (error) {
      toast.error('An error occurred while canceling subscription.');
    } finally {
      setCanceling(false);
    }
  };

  const handleBillingPortal = async () => {
    try {
      const response = await authFetch('http://localhost:8000/api/subscription/billing-portal/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        window.open(data.url, '_blank');
      } else {
        toast.error('Failed to open billing portal.');
      }
    } catch (error) {
      toast.error('An error occurred while opening billing portal.');
    }
  };

  const handleUpgrade = async (planId: number) => {
    setUpgradingPlanId(planId);
    setUpgradeLoading(true);
    try {
      const response = await authFetch('http://localhost:8000/api/subscription/upgrade/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId }),
      });
      
      if (response.ok) {
        const planComparison = getPlanComparisonInfo(plans.find(p => p.id === planId)!);
        const actionText = planComparison.isUpgrade ? 'upgraded' : planComparison.isDowngrade ? 'downgraded' : 'changed';
        
        // Provide different messages based on upgrade vs downgrade
        if (planComparison.isUpgrade) {
          toast.success(`Subscription upgraded successfully! You now have immediate access to higher limits. A prorated charge has been applied for the remainder of this billing cycle.`);
        } else if (planComparison.isDowngrade) {
          toast.success(`Subscription will be downgraded at the end of your current billing period. You'll continue with your current plan until then.`);
        } else {
          toast.success(`Subscription ${actionText} successfully.`);
        }
        
        await fetchSubscriptionData();
      } else {
        let errorMessage = 'Failed to update subscription.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('An error occurred while updating subscription.');
    } finally {
      setUpgradingPlanId(null);
      setUpgradeLoading(false);
    }
  };

  const handleSubscribe = async (planId: number) => {
    setUpgradingPlanId(planId);
    setUpgradeLoading(true);
    try {
      const response = await authFetch('http://localhost:8000/api/subscription/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId }),
      });
      
      if (response.ok) {
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('Error parsing subscribe response:', parseError);
          toast.success('Subscription created successfully.');
          await fetchSubscriptionData();
          return;
        }
        
        if (data && data.url) {
          // Redirect to Stripe checkout
          window.location.href = data.url;
        } else {
          toast.success('Subscription created successfully.');
          await fetchSubscriptionData();
        }
      } else {
        let errorMessage = 'Unable to create subscription. Please try again.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Error parsing subscribe error response:', parseError);
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setUpgradingPlanId(null);
      setUpgradeLoading(false);
    }
  };

  const handlePlanAction = async (planId: number) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    
    const planComparison = getPlanComparisonInfo(plan);
    
    // Show confirmation for downgrades
    if (planComparison.isDowngrade) {
      setPendingDowngradePlan(plan);
      setDowngradeConfirmOpen(true);
      return;
    }
    
    // Handle the action
    if (subscription) {
      await handleUpgrade(planId);
    } else {
      await handleSubscribe(planId);
    }
  };

  const handleDowngradeConfirm = async () => {
    if (!pendingDowngradePlan) return;
    
    setDowngradeConfirmOpen(false);
    await handleUpgrade(pendingDowngradePlan.id);
    setPendingDowngradePlan(null);
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
    const featureList = [];
    if (features.bots_limit) featureList.push(`${features.bots_limit} bots`);
    if (features.messages_per_month) featureList.push(`${features.messages_per_month.toLocaleString()} messages/month`);
    if (features.ai_requests_per_month) featureList.push(`${features.ai_requests_per_month.toLocaleString()} AI requests/month`);
    if (features.api_access) featureList.push('API access');
    if (features.advanced_analytics) featureList.push('Advanced analytics');
    if (features.custom_branding) featureList.push('Custom branding');
    if (features.priority_support) featureList.push('Priority support');
    return featureList.slice(0, 3); // Show top 3 features
  };

  const getPlanActionText = (plan: SubscriptionPlan): string => {
    if (!subscription) return "Subscribe";
    if (subscription.is_trialing) return "Subscribe";
    if (subscription.plan?.id === plan.id) return "Current Plan";
    
    // Define plan hierarchy
    const planHierarchy = { 'basic': 1, 'pro': 2, 'enterprise': 3 };
    
    // Compare both price and plan hierarchy
    const currentPrice = subscription.plan?.price || 0;
    const planPrice = plan.price;
    const currentPlanType = subscription.plan?.plan_type;
    const targetPlanType = plan.plan_type;
    
    // If we have plan types, use hierarchy as primary factor
    if (currentPlanType && targetPlanType) {
      const currentLevel = planHierarchy[currentPlanType as keyof typeof planHierarchy] || 0;
      const targetLevel = planHierarchy[targetPlanType as keyof typeof planHierarchy] || 0;
      
      if (targetLevel > currentLevel) return "Upgrade";
      if (targetLevel < currentLevel) return "Downgrade";
      // Same level, compare price
      if (planPrice > currentPrice) return "Upgrade";
      if (planPrice < currentPrice) return "Downgrade";
      return "Switch";
    }
    
    // Fallback to price comparison only
    if (planPrice > currentPrice) return "Upgrade";
    if (planPrice < currentPrice) return "Downgrade";
    return "Switch";
  };

  const getPlanActionVariant = (plan: SubscriptionPlan): "default" | "outline" | "secondary" => {
    if (!subscription) return "default";
    if (subscription.is_trialing) return "default";
    if (subscription.plan?.id === plan.id) return "outline";
    
    // Define plan hierarchy
    const planHierarchy = { 'basic': 1, 'pro': 2, 'enterprise': 3 };
    
    // Compare both price and plan hierarchy
    const currentPrice = subscription.plan?.price || 0;
    const planPrice = plan.price;
    const currentPlanType = subscription.plan?.plan_type;
    const targetPlanType = plan.plan_type;
    
    // If we have plan types, use hierarchy as primary factor
    if (currentPlanType && targetPlanType) {
      const currentLevel = planHierarchy[currentPlanType as keyof typeof planHierarchy] || 0;
      const targetLevel = planHierarchy[targetPlanType as keyof typeof planHierarchy] || 0;
      
      if (targetLevel > currentLevel) return "default"; // Upgrade
      if (targetLevel < currentLevel) return "secondary"; // Downgrade
      // Same level, compare price
      if (planPrice > currentPrice) return "default"; // Upgrade
      if (planPrice < currentPrice) return "secondary"; // Downgrade
      return "outline"; // Switch
    }
    
    // Fallback to price comparison only
    if (planPrice > currentPrice) return "default"; // Upgrade
    if (planPrice < currentPrice) return "secondary"; // Downgrade
    return "outline"; // Switch
  };

  const getPriceDifference = (plan: SubscriptionPlan): string | null => {
    if (!subscription || subscription.is_trialing || subscription.plan?.id === plan.id) return null;
    
    const currentPrice = subscription.plan?.price || 0;
    const planPrice = plan.price;
    const difference = planPrice - currentPrice;
    
    if (difference === 0) return null;
    
    const sign = difference > 0 ? '+' : '';
    return `${sign}${formatCurrency(difference, plan.currency)}/${plan.interval}`;
  };

  const getPlanComparisonInfo = (plan: SubscriptionPlan): { action: string; isUpgrade: boolean; isDowngrade: boolean } => {
    if (!subscription || subscription.is_trialing) {
      return { action: "Subscribe", isUpgrade: false, isDowngrade: false };
    }
    
    if (subscription.plan?.id === plan.id) {
      return { action: "Current Plan", isUpgrade: false, isDowngrade: false };
    }
    
    // Define plan hierarchy
    const planHierarchy = { 'basic': 1, 'pro': 2, 'enterprise': 3 };
    
    const currentPrice = subscription.plan?.price || 0;
    const planPrice = plan.price;
    const currentPlanType = subscription.plan?.plan_type;
    const targetPlanType = plan.plan_type;
    
    // If we have plan types, use hierarchy as primary factor
    if (currentPlanType && targetPlanType) {
      const currentLevel = planHierarchy[currentPlanType as keyof typeof planHierarchy] || 0;
      const targetLevel = planHierarchy[targetPlanType as keyof typeof planHierarchy] || 0;
      
      if (targetLevel > currentLevel) {
        return { action: "Upgrade", isUpgrade: true, isDowngrade: false };
      }
      if (targetLevel < currentLevel) {
        return { action: "Downgrade", isUpgrade: false, isDowngrade: true };
      }
      // Same level, compare price
      if (planPrice > currentPrice) {
        return { action: "Upgrade", isUpgrade: true, isDowngrade: false };
      }
      if (planPrice < currentPrice) {
        return { action: "Downgrade", isUpgrade: false, isDowngrade: true };
      }
      return { action: "Switch", isUpgrade: false, isDowngrade: false };
    }
    
    // Fallback to price comparison only
    if (planPrice > currentPrice) {
      return { action: "Upgrade", isUpgrade: true, isDowngrade: false };
    }
    if (planPrice < currentPrice) {
      return { action: "Downgrade", isUpgrade: false, isDowngrade: true };
    }
    return { action: "Switch", isUpgrade: false, isDowngrade: false };
  };

  const getUsageData = () => {
    if (!subscription || !subscription.plan) return { messages: 0, bots: 0, apiCalls: 0 };
    
    const features = subscription.plan.features || {};
    const messagesLimit = features.messages_per_month || 1000;
    const botsLimit = features.bots_limit || 1;
    
    return {
      messages: Math.floor(messagesLimit * 0.78),
      messagesLimit,
      bots: Math.floor(botsLimit * 0.4),
      botsLimit,
      apiCalls: Math.floor((features.ai_requests_per_month || 1000) * 0.62),
      apiCallsLimit: features.ai_requests_per_month || 1000
    };
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Billing & Usage</h1>
          <p className="text-muted-foreground">Manage your subscription and monitor usage</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const usageData = getUsageData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Billing & Usage</h1>
        <p className="text-muted-foreground">Manage your subscription and monitor usage</p>
      </div>

      {subscription ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Plan</CardTitle>
              <Badge variant={subscription.is_trialing ? "default" : "secondary"}>
                {subscription.is_trialing ? "Trial Period" : (subscription.plan?.name || "No Plan")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold">
                {subscription.is_trialing ? "Trial Period" : (subscription.plan?.name || "No Plan")}
              </h3>
              <p className="text-muted-foreground">
                {subscription.is_trialing ? 
                  "Enjoy full access during your trial period" : 
                  (subscription.plan?.features ? getTopFeatures(subscription.plan.features).join(', ') : 'No features')
                }
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {subscription.is_trialing ? (
                  `Trial ends: ${formatDate(subscription.trial_end || subscription.current_period_end)}`
                ) : (
                  `Next billing: ${formatDate(subscription.current_period_end)}`
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold">
                {subscription.plan?.price ? (
                  <>
                    {formatCurrency(subscription.plan.price, subscription.plan.currency)}
                    <span className="text-base font-normal text-muted-foreground">/{subscription.plan.interval}</span>
                  </>
                ) : (
                  <span className="text-green-600">Free Trial</span>
                )}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3 border-t pt-6">
            {subscription.is_active && !subscription.canceled_at && !subscription.is_trialing && (
              <Button 
                variant="outline" 
                onClick={handleCancelSubscription}
                disabled={canceling}
              >
                {canceling ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Cancel Subscription
              </Button>
            )}
            {subscription.is_trialing && (
              <div className="text-sm text-muted-foreground">
                Your trial is active. Choose a plan below to continue after trial ends.
              </div>
            )}
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Plan</CardTitle>
              <Badge variant="secondary">No Plan</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Active Subscription</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You don't have an active subscription. Choose a plan to get started.
            </p>
            <Button onClick={() => window.location.href = '/pricing'}>
              View Plans
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      {subscription?.invoices && subscription.invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>View and download your past invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscription.invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div>
                    <p className="font-medium">
                      {subscription.is_trialing ? "Trial Period" : (subscription.plan?.name || "No Plan")}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatDate(invoice.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge 
                      variant="secondary" 
                      className={invoice.status === 'paid' ? 'bg-green-500/10 text-green-700' : ''}
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                    <p className="font-medium">{formatCurrency(invoice.amount, invoice.currency)}</p>
                    {invoice.hosted_invoice_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {subscription && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Messages Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{usageData.messages.toLocaleString()}</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((usageData.messages / usageData.messagesLimit) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((usageData.messages / usageData.messagesLimit) * 100)}% of {usageData.messagesLimit.toLocaleString()} limit
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Bots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{usageData.bots}</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((usageData.bots / usageData.botsLimit) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {usageData.bots} of {usageData.botsLimit} bots
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">API Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{usageData.apiCalls.toLocaleString()}</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((usageData.apiCalls / usageData.apiCallsLimit) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((usageData.apiCalls / usageData.apiCallsLimit) * 100)}% of {usageData.apiCallsLimit.toLocaleString()} limit
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose the plan that's right for you.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={cn(
                  "flex flex-col", 
                  subscription?.plan?.id === plan.id && 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-700'
                )}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{plan.name}</h3>
                    {subscription?.plan?.id === plan.id && <Badge>Current</Badge>}
                  </div>
                  <p className="text-3xl font-bold">
                    {formatCurrency(plan.price, plan.currency)}
                    <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
                  </p>
                  {getPriceDifference(plan) && (
                    <p className={cn(
                      "text-sm mt-1",
                      getPlanComparisonInfo(plan).isUpgrade ? "text-green-600" : 
                      getPlanComparisonInfo(plan).isDowngrade ? "text-red-600" : "text-muted-foreground"
                    )}>
                      {getPriceDifference(plan)}
                    </p>
                  )}
                  {plan.trial_days > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      {plan.trial_days}-day free trial
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2 mb-4">
                    {getTopFeatures(plan.features).map((feature, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={getPlanActionVariant(plan)}
                    className="w-full"
                    disabled={subscription?.plan?.id === plan.id || upgradeLoading}
                    onClick={() => handlePlanAction(plan.id)}
                  >
                    {upgradingPlanId === plan.id && upgradeLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {getPlanActionText(plan)}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={downgradeConfirmOpen} onOpenChange={setDowngradeConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Confirm Plan Downgrade
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="sr-only">
            Confirmation dialog for downgrading subscription plan
          </AlertDialogDescription>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div>
              Are you sure you want to downgrade from <strong className="text-foreground">{subscription?.plan?.name || 'Current Plan'}</strong> to <strong className="text-foreground">{pendingDowngradePlan?.name}</strong>?
            </div>
            {pendingDowngradePlan && getPriceDifference(pendingDowngradePlan) && (
              <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-sm font-medium text-green-700 dark:text-green-300">
                  Monthly savings: {getPriceDifference(pendingDowngradePlan)}
                </div>
              </div>
            )}
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">What this means:</div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Reduced features and limits</li>
                <li>• Lower monthly cost</li>
                <li>• Changes take effect at the end of your current billing period</li>
                <li>• Proration will be applied to your next invoice</li>
              </ul>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDowngradePlan(null)}>
              Keep Current Plan
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDowngradeConfirm}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Yes, Downgrade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Billing;
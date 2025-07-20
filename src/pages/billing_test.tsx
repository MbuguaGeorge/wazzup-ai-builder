import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Billing = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Billing & Usage</h1>
        <p className="text-muted-foreground">Manage your subscription and monitor usage</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Plan</CardTitle>
            <Badge variant="secondary">Pro</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold">Pro Plan</h3>
              <p className="text-muted-foreground">Up to 10 bots, 10,000 messages/month</p>
              <p className="text-sm text-muted-foreground mt-1">Next billing: January 15, 2024</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold">$49<span className="text-base font-normal text-muted-foreground">/month</span></p>
            </div>
        </CardContent>
        <CardFooter className="flex gap-3 border-t pt-6">
            <Button variant="outline">Change Plan</Button>
            <Button variant="outline">Cancel Subscription</Button>
        </CardFooter>
      </Card>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Messages Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">7,842</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">78% of 10,000 limit</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Bots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">4</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '40%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">4 of 10 bots</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">API Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">15,420</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '62%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">62% of 25,000 limit</p>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download your past invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: "Dec 15, 2023", amount: "$49.00", status: "Paid", plan: "Pro Plan" },
              { date: "Nov 15, 2023", amount: "$49.00", status: "Paid", plan: "Pro Plan" },
              { date: "Oct 15, 2023", amount: "$19.00", status: "Paid", plan: "Starter Plan" },
              { date: "Sep 15, 2023", amount: "$19.00", status: "Paid", plan: "Starter Plan" },
            ].map((invoice, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div>
                  <p className="font-medium">{invoice.plan}</p>
                  <p className="text-sm text-muted-foreground">{invoice.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge 
                    variant="secondary" 
                    className="bg-green-500/10 text-green-700"
                  >
                    {invoice.status}
                  </Badge>
                  <p className="font-medium">{invoice.amount}</p>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose the plan that's right for you.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                name: "Starter", 
                price: "$19", 
                features: ["3 bots", "1,000 messages/month", "Basic support"] 
              },
              { 
                name: "Pro", 
                price: "$49", 
                features: ["10 bots", "10,000 messages/month", "Priority support"],
                current: true
              },
              { 
                name: "Enterprise", 
                price: "$99", 
                features: ["Unlimited bots", "50,000 messages/month", "24/7 support"] 
              },
            ].map((plan, index) => (
              <Card key={index} className={cn("flex flex-col", plan.current && 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-700')}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{plan.name}</h3>
                    {plan.current && <Badge>Current</Badge>}
                  </div>
                  <p className="text-3xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                    <Button 
                    variant={plan.current ? "outline" : "default"} 
                    className="w-full"
                    disabled={plan.current}
                    >
                    {plan.current ? "Current Plan" : "Upgrade"}
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { cookieAuth } from "@/lib/cookieAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import CheckEmail from "./pages/CheckEmail";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import FlowBuilder from "./pages/FlowBuilder";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService"; 
import Billing from "./pages/Billing";
import Notifications from "./pages/Notifications";
import DashboardLayout from "./pages/DashboardLayout";
import ChatDashboard from "./pages/ChatDashboard";
import Support from "./pages/Support";
import ProfileSettings from "./pages/ProfileSettings";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionError from "./pages/SubscriptionError";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

// Debug component to track location changes
function LocationTracker() {
  const location = useLocation();
  
  return null;
}

function isAuthenticated() {
  // Check for JWT token (fallback authentication)
  const token = localStorage.getItem('token');
  if (token) {
    return true;
  }
  
  // Check for session-based authentication
  const authMethod = localStorage.getItem('auth_method');
  const user = localStorage.getItem('user');
  
  if (authMethod === 'session' && user) {
    return true;
  }
  
  return false;
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      // First do quick local check
      if (isAuthenticated()) {
        setIsAuth(true);
        return;
      }
      
      // If no local auth found, check with server for session-based auth
      try {
        const authStatus = await cookieAuth.isAuthenticated();
        setIsAuth(authStatus.authenticated);
      } catch (error) {
        setIsAuth(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Show loading while checking authentication
  if (isAuth === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return isAuth ? <>{children}</> : <Navigate to="/login" />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <NotificationProvider>
      <Router>
        <LocationTracker />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          <Route path="/dashboard" element={<PrivateRoute><DashboardLayout title="Dashboard" /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="billing" element={<Billing />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="chat-management" element={<ChatDashboard />} />
            <Route path="support" element={<Support />} />
            <Route path="settings" element={<ProfileSettings />} />
          </Route>

          <Route path="/flow-builder/:botId?" element={<PrivateRoute><FlowBuilder /></PrivateRoute>} />
          <Route path="/subscription/success" element={<PrivateRoute><SubscriptionSuccess /></PrivateRoute>} />
          <Route path="/subscription/error" element={<PrivateRoute><SubscriptionError /></PrivateRoute>} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      </NotificationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

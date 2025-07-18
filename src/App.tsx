import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
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
import { NotificationProvider } from "@/contexts/NotificationContext";

const queryClient = new QueryClient();

function isAuthenticated() {
  return Boolean(localStorage.getItem('token'));
}

function PrivateRoute({ children }: { children: JSX.Element }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          <Route path="/dashboard" element={<PrivateRoute><DashboardLayout title="Dashboard" /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="billing" element={<Billing />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="chat-management" element={<ChatDashboard />} />
            <Route path="support" element={<Support />} />
            <Route path="settings" element={<ProfileSettings />} />
          </Route>

          <Route path="/flow-builder/:botId?" element={<PrivateRoute><FlowBuilder /></PrivateRoute>} />
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

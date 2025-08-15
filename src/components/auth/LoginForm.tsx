import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Lock } from 'lucide-react';
import { cookieAuth, areCookiesEnabled, isCookieConsentGiven } from '@/lib/cookieAuth';
import { setTokens } from '@/lib/auth'; // Keep for fallback JWT support
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Check if cookies are accepted - if not, inform user about JWT fallback
      const cookiesAccepted = areCookiesEnabled() && isCookieConsentGiven();
      
      if (!cookiesAccepted) {
        console.log('🍪 Cookies not accepted, will use JWT authentication');
        // Optionally show a message to user about authentication method
      }
      
      const data = await cookieAuth.login(email, password, cookiesAccepted);
      
      // Store user data and auth method
          localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('auth_method', data.authentication_method);
      
      // Clear any old JWT tokens if using cookie auth
      if (data.authentication_method === 'session') {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
      }

      // Dispatch login event
      window.dispatchEvent(new CustomEvent('login', { detail: data }));
      
      // Show success message with auth method info
      const authMethodMsg = data.authentication_method === 'session' 
        ? 'Logged in with secure session' 
        : 'Logged in with token authentication';
      
      toast.success(authMethodMsg);
      
      // Redirect to dashboard or intended page
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      navigate(redirectTo);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your Wozza account to continue building
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              </div>
              
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
            <Button
              variant="link"
              className="p-0 h-auto text-primary hover:text-primary/80"
                onClick={() => navigate('/signup')}
              >
                Sign up
            </Button>
            </div>

          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm; 
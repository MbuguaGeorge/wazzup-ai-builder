import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Lock } from 'lucide-react';
import { cookieAuth } from '@/lib/cookieAuth';
import { setTokens } from '@/lib/auth'; // Keep for fallback JWT support

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Use cookie-based authentication
      const data = await cookieAuth.login(email, password, true);
      
      // Store user data in localStorage for quick access
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      // Handle both authentication methods
      if (data.authentication_method === 'session') {
        // Clear any old JWT tokens since we're using cookies now
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
      } else if (data.authentication_method === 'jwt') {
        // Store JWT tokens for fallback
        if (data.token && data.refresh) {
          setTokens(data.token, data.refresh);
        }
      }
      
      // Small delay to ensure all data is stored before navigation
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
      
    } catch (err: any) {
      // Handle specific error messages from the backend
      const errorMessage = err.message;
      
      if (errorMessage.includes('verification code')) {
        setError('Please check your email for the verification code to complete your registration.');
      } else if (errorMessage.includes('No account found')) {
        setError('No account found with this email address. Please check your email or sign up for a new account.');
      } else if (errorMessage.includes('Invalid email or password')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (errorMessage.includes('scheduled for deletion')) {
        setError('Your account is scheduled for deletion. Please contact support if you need to restore it.');
      } else {
        setError(errorMessage || 'Login failed. Please check your credentials and try again.');
      }
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
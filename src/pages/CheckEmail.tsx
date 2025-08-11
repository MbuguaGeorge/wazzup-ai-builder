import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, CheckCircle } from 'lucide-react';

const CheckEmail = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get email from localStorage
    const emailFromStorage = localStorage.getItem('signup_email');
    
    if (emailFromStorage) {
      setEmail(emailFromStorage);
    } else {
      // Redirect to signup if no email found
      navigate('/signup');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8 px-8 text-center space-y-6">
            {/* Email Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-12 h-12 text-primary" />
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                Almost there!
              </h1>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <p className="text-muted-foreground text-base leading-relaxed">
                We've sent you an email with a verification code to confirm your account.
              </p>

              {/* Email Display */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-sm text-muted-foreground mb-1">Verification sent to:</p>
                <p className="font-semibold text-primary text-base">{email}</p>
              </div>

              {/* Instructions */}
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <p className="font-medium text-foreground">What to do next:</p>
                </div>
                <ol className="text-left space-y-2 list-decimal list-inside">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the verification button in the email</li>
                  <li>Enter the code in the verification page</li>
                </ol>
              </div>
            </div>

            {/* Help Text */}
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Didn't get the email? Check your spam folder or contact support if the issue persists.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckEmail; 
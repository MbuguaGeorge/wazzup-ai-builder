import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Mail, Clock, RefreshCw, CheckCircle } from 'lucide-react';
import { setTokens } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/config';
import { Label } from '@/components/ui/label';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // First try to get email from URL params (when coming from email button)
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) {
      setEmail(emailFromUrl);
      // Store in localStorage for consistency
      localStorage.setItem('signup_email', emailFromUrl);
    } else {
      // Fallback to localStorage (when coming from manual entry)
      const emailFromStorage = localStorage.getItem('signup_email');
      if (emailFromStorage) {
        setEmail(emailFromStorage);
      } else {
        // Redirect to signup if no email found
        navigate('/signup');
      }
    }
  }, [navigate, searchParams]);

  useEffect(() => {
    // Handle resend countdown
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [resendCountdown]);

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value.toUpperCase(); // Convert to uppercase for consistency
    setOtp(newOtp);

    // Auto-focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-character verification code.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp_code: otpString }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        setSuccess('Email verified successfully! Welcome to Wozza!');
        
        // Store tokens and user data
        setTokens(data.token, data.refresh);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // Clear signup email from localStorage
        localStorage.removeItem('signup_email');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(data.error || 'Verification failed. Please check your code and try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendAttempts >= 4) {
      setError('Maximum resend attempts reached. Please wait before requesting another code.');
      return;
    }

    setError('');
    setResendLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/resend-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('New verification code sent successfully!');
        setResendAttempts(prev => prev + 1);
        setResendDisabled(true);
        setResendCountdown(60); // 1 minute cooldown
        
        // Clear the OTP input
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.error || 'Failed to resend verification code. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while resending the code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToSignup = () => {
    localStorage.removeItem('signup_email');
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
            <CardDescription className="text-base">
              Enter the 6-character verification code sent to
            </CardDescription>
            <div className="text-lg font-semibold text-primary bg-primary/5 px-4 py-2 rounded-lg">
              {email}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="text-center">
              <Label className="text-sm font-medium mb-4 block">Verification Code</Label>
              
              {/* Custom OTP Input */}
              <div className="flex justify-center gap-3 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 bg-white"
                    placeholder="•"
                  />
                ))}
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Code expires in 5 minutes</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-md border border-green-200">
              {success}
            </div>
          )}

          <Button 
            onClick={handleVerifyOTP} 
            className="w-full" 
            size="lg"
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </Button>

          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <span>
                Didn't receive the code? 
                {resendDisabled ? (
                  <span className="text-primary font-medium ml-1">
                    Resend available in {resendCountdown}s
                  </span>
                ) : (
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary hover:text-primary/80 ml-1"
                    onClick={handleResendOTP}
                    disabled={resendLoading || resendDisabled}
                  >
                    {resendLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Resend Code'
                    )}
                  </Button>
                )}
              </span>
            </div>
            
            {resendAttempts > 0 && (
              <div className="text-xs text-muted-foreground bg-gray-50 px-3 py-2 rounded-md">
                Resend attempts: {resendAttempts}/4
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              onClick={handleBackToSignup}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign Up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail; 
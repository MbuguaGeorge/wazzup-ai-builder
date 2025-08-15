import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Cookie, Settings, Shield, BarChart3, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_KEY = 'wozza-cookie-consent';
const COOKIE_PREFERENCES_KEY = 'wozza-cookie-preferences';

export const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    functional: false,
    analytics: false,
    marketing: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    
    if (!consent) {
      // Check if user is logged in
      const user = localStorage.getItem('user');
      const authMethod = localStorage.getItem('auth_method');
      
      if (user && authMethod) {
        // User is logged in, show banner after 1 minute
        const timer = setTimeout(() => {
          setShowBanner(true);
          // Trigger animation after banner is shown
          setTimeout(() => setIsVisible(true), 100);
        }, 60000); // 1 minute delay
        return () => clearTimeout(timer);
      } else {
        // User not logged in, show banner after 1 second (landing page)
        const timer = setTimeout(() => {
          setShowBanner(true);
          // Trigger animation after banner is shown
          setTimeout(() => setIsVisible(true), 100);
        }, 1000);
        return () => clearTimeout(timer);
      }
    } else if (savedPreferences) {
      // Load saved preferences
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  // Listen for login events to trigger cookie consent
  useEffect(() => {
    const handleLogin = () => {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        // Show banner after 1 minute of login
        const timer = setTimeout(() => {
          setShowBanner(true);
          setTimeout(() => setIsVisible(true), 100);
        }, 60000); // 1 minute delay
        
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('login', handleLogin);
    
    return () => {
      window.removeEventListener('login', handleLogin);
    };
  }, []);

  // Handle page unload/navigation without consent
  useEffect(() => {
    const handleBeforeUnload = () => {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent && showBanner) {
        // User is navigating away without making a choice
        // Set a flag to show banner again on next visit
        localStorage.setItem('wozza-cookie-banner-seen', 'true');
      }
    };

    // Also handle route changes for SPAs
    const handleRouteChange = () => {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        // User navigated without consent, show banner again
        setShowBanner(true);
        setTimeout(() => setIsVisible(true), 100);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [showBanner]);

  // Check if user has seen banner before but not given consent
  useEffect(() => {
    const bannerSeen = localStorage.getItem('wozza-cookie-banner-seen');
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    
    if (bannerSeen && !consent) {
      // Show banner immediately if user has seen it before
      setShowBanner(true);
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const saveCookiePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    
    // Set cookies based on preferences
    if (prefs.functional) {
      document.cookie = 'functional-cookies=enabled; max-age=31536000; path=/; secure; samesite=strict';
    }
    if (prefs.analytics) {
      document.cookie = 'analytics-cookies=enabled; max-age=31536000; path=/; secure; samesite=strict';
    }
    if (prefs.marketing) {
      document.cookie = 'marketing-cookies=enabled; max-age=31536000; path=/; secure; samesite=strict';
    }
    
    // Animate out
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
    setShowSettings(false);
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    saveCookiePreferences(allAccepted);
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    setPreferences(necessaryOnly);
    saveCookiePreferences(necessaryOnly);
  };

  const handleSavePreferences = () => {
    saveCookiePreferences(preferences);
  };

  const cookieTypes = [
    {
      key: 'necessary' as keyof CookiePreferences,
      title: 'Necessary Cookies',
      icon: <Shield className="w-4 h-4" />,
      description: 'Essential for the website to function properly. These cannot be disabled.',
      required: true,
      examples: 'Authentication, security, session management',
    },
    {
      key: 'functional' as keyof CookiePreferences,
      title: 'Functional Cookies',
      icon: <Settings className="w-4 h-4" />,
      description: 'Enable enhanced functionality and personalization.',
      required: false,
      examples: 'Language preferences, theme settings, recent searches',
    },
    {
      key: 'analytics' as keyof CookiePreferences,
      title: 'Analytics Cookies',
      icon: <BarChart3 className="w-4 h-4" />,
      description: 'Help us understand how you use our website to improve your experience.',
      required: false,
      examples: 'Page views, user interactions, error tracking',
    },
    {
      key: 'marketing' as keyof CookiePreferences,
      title: 'Marketing Cookies',
      icon: <Users className="w-4 h-4" />,
      description: 'Used to deliver relevant advertisements and track campaign effectiveness.',
      required: false,
      examples: 'Ad personalization, conversion tracking, retargeting',
    },
  ];

  if (!showBanner) return null;

  return (
    <>
      {/* Backdrop with blur effect */}
      <div 
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Cookie Consent Banner - Centered vertically and horizontally with top drop animation */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ease-out ${
          isVisible 
            ? 'opacity-100' 
            : 'opacity-0'
        }`}
      >
        <div 
          className={`transform transition-all duration-500 ease-out ${
            isVisible 
              ? 'translate-y-0 scale-100' 
              : '-translate-y-full scale-95'
          }`}
        >
          <Card className="w-full max-w-2xl mx-auto shadow-2xl border-0 bg-background/95 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Cookie className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">We use cookies to enhance your experience</h3>
                    <p className="text-sm text-muted-foreground">
                      We use cookies and similar technologies to provide authentication, analyze usage, 
                      and deliver personalized content. By clicking "Accept All", you consent to our use 
                      of cookies as described in our{' '}
                      <button 
                        onClick={() => navigate('/privacy-policy')}
                        className="text-primary underline hover:no-underline"
                      >
                        Privacy Policy
                      </button>.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 w-auto">
                  <Dialog open={showSettings} onOpenChange={setShowSettings}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <Settings className="w-4 h-4 mr-2" />
                        Customize
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Cookie className="w-5 h-5" />
                          Cookie Preferences
                        </DialogTitle>
                        <DialogDescription>
                          Choose which cookies you want to allow. You can change these settings at any time.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        {cookieTypes.map((type) => (
                          <Card key={type.key} className="border">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {type.icon}
                                  <CardTitle className="text-base">{type.title}</CardTitle>
                                  {type.required && (
                                    <Badge variant="secondary" className="text-xs">Required</Badge>
                                  )}
                                </div>
                                <Checkbox
                                  checked={preferences[type.key]}
                                  onCheckedChange={(checked) => 
                                    !type.required && setPreferences(prev => ({ 
                                      ...prev, 
                                      [type.key]: checked 
                                    }))
                                  }
                                  disabled={type.required}
                                />
                              </div>
                              <CardDescription className="text-sm">
                                {type.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-xs text-muted-foreground">
                                <strong>Examples:</strong> {type.examples}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 pt-4">
                        <Button 
                          onClick={handleSavePreferences}
                          className="flex-1"
                        >
                          Save Preferences
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={handleAcceptAll}
                          className="flex-1"
                        >
                          Accept All
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAcceptNecessary}
                    className="w-full"
                  >
                    Necessary Only
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleAcceptAll}
                    className="w-full"
                  >
                    Accept All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

// Hook to check if specific cookie types are enabled
export const useCookieConsent = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  return {
    preferences,
    hasConsent: (type: keyof CookiePreferences) => preferences[type],
    isConsentGiven: () => localStorage.getItem(COOKIE_CONSENT_KEY) === 'true',
  };
};

export default CookieConsent; 
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
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else if (savedPreferences) {
      // Load saved preferences
      setPreferences(JSON.parse(savedPreferences));
    }
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
    
    setShowBanner(false);
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
      {/* Cookie Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
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
                className="w-full sm:w-auto"
              >
                Necessary Only
              </Button>
              <Button 
                size="sm" 
                onClick={handleAcceptAll}
                className="w-full sm:w-auto"
              >
                Accept All
              </Button>
            </div>
          </div>
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
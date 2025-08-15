import { API_BASE_URL } from '@/lib/config';

// Cookie-based authentication utilities
export const cookieAuth = {
  // Login with cookies
  async login(email: string, password: string, useCookies: boolean = true) {
    // Check if cookies are enabled/accepted by user
    const cookiesAccepted = useCookies && areCookiesEnabled() && isCookieConsentGiven();
    
    // If cookies not accepted/enabled, fall back to JWT
    const actualUseCookies = cookiesAccepted;
    
    const response = await fetch(`${API_BASE_URL}/api/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: actualUseCookies ? 'include' : 'omit', // Only include cookies if accepted
      body: JSON.stringify({ 
        email, 
        password, 
        use_cookies: actualUseCookies 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();
    
    // Store authentication method preference
    localStorage.setItem('auth_method', data.authentication_method);
    
    // If falling back to JWT due to cookie restrictions, store tokens
    if (!actualUseCookies && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('refresh', data.refresh);
    } else if (actualUseCookies) {
    }
    
    return data;
  },

  // Logout
  async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      // Always clear local storage items regardless of response
      this.clearAllAuthData();
      
      // Manually clear cookies as fallback (in case backend doesn't clear them)
      this.clearCookies();
      
      return response.ok;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local storage even if logout request fails
      this.clearAllAuthData();
      // Still try to clear cookies
      this.clearCookies();
      return false;
    }
  },

  // Comprehensive cleanup of all authentication data
  clearAllAuthData() {
    // Clear authentication-related localStorage items
    localStorage.removeItem('auth_method');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    
    // Clear any session-related data
    sessionStorage.clear();
    
    // Clear specific app-related items if they exist
    localStorage.removeItem('wozza_user_id');
    localStorage.removeItem('wozza_session_id');
    
    // Clear any temporarily stored JWT tokens (for session users)
    localStorage.removeItem('temp_jwt_token');
    localStorage.removeItem('temp_jwt_refresh');
    
  },

  // Manually clear cookies as fallback
  clearCookies() {
    try {
      // Clear session cookies by setting them to expire in the past
      document.cookie = 'wozza_sessionid=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + window.location.hostname;
      document.cookie = 'wozza_csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + window.location.hostname;
      
      // Also clear any other potential session cookies
      document.cookie = 'sessionid=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + window.location.hostname;
      document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + window.location.hostname;
      
    } catch (error) {
      console.error('Error clearing cookies:', error);
    }
  },

  // Force logout and redirect (for when authentication fails)
  async forceLogout() {
    try {
      await this.logout();
    } catch (error) {
      console.error('Force logout error:', error);
      // Still clear everything even if logout fails
      this.clearAllAuthData();
      this.clearCookies();
    }
    
    // Dispatch custom event to notify other parts of the app
    window.dispatchEvent(new CustomEvent('auth:logout'));
    
    // Force redirect to login with multiple fallback methods
    if (typeof window !== 'undefined') {
      try {
        // Try multiple redirect methods to ensure it works
        window.location.replace('/login');
        
        // Fallback if replace doesn't work
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }, 100);
        
        // Final fallback
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.reload();
          }
        }, 500);
      } catch (error) {
        console.error('Redirect failed, reloading page:', error);
        window.location.reload();
      }
    }
  },

  // Check session status
  async checkSession() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/status/`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Add expiry time to response
        return {
          ...data,
          expires_in: data.expires_in || 3600
        };
      }
      return null;
    } catch (error) {
      console.error('Session check error:', error);
      return null;
    }
  },

  // Refresh session
  async refreshSession() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/refresh/`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        
        // Dispatch session refresh event for socket reconnection (Issue 1 fix)
        window.dispatchEvent(new CustomEvent('session:refresh', { 
          detail: { refreshed: true } 
        }));
        
        return result;
      }
      return null;
    } catch (error) {
      console.error('Session refresh error:', error);
      return null;
    }
  },

  // Auto-refresh session before expiry
  async autoRefreshSession() {
    try {
      const sessionStatus = await this.checkSession();
      if (sessionStatus?.authenticated) {
        // Check if session expires soon (within 5 minutes)
        const expiresIn = sessionStatus.expires_in || 3600;
        if (expiresIn < 300) { // Less than 5 minutes
          console.log('🔄 Session expiring soon, auto-refreshing...');
          await this.refreshSession();
        }
      }
    } catch (error) {
      console.error('Auto-refresh failed:', error);
    }
  },

  // Check if user is authenticated (works with both cookies and JWT)
  async isAuthenticated() {
    try {
      // First try session-based auth
      const sessionStatus = await this.checkSession();
      if (sessionStatus?.authenticated) {
        return { authenticated: true, method: 'session', user: sessionStatus.user };
      }

      // Fallback to JWT if available
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/me/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const user = await response.json();
            return { authenticated: true, method: 'jwt', user };
          }
        } catch (error) {
          console.error('JWT auth check failed:', error);
        }
      }

      return { authenticated: false, method: null, user: null };
    } catch (error) {
      console.error('Authentication check failed:', error);
      return { authenticated: false, method: null, user: null };
    }
  },

  // Fetch user profile
  async fetchMe() {
    return cookieFetch(`${API_BASE_URL}/api/me/`);
  },
};

// Enhanced fetch function that works with cookies
export async function cookieFetch(input: RequestInfo, init: RequestInit = {}) {
  // Check if cookies are enabled and accepted
  const cookiesEnabled = areCookiesEnabled() && isCookieConsentGiven();
  
  // If cookies not accepted, fall back to JWT authentication
  if (!cookiesEnabled) {
    return jwtFetch(input, init);
  }
  
  // Get CSRF token if available
  const csrfToken = getCSRFToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(csrfToken && { 'X-CSRFToken': csrfToken }),
    ...init.headers,
  };

  const config: RequestInit = {
    ...init,
    headers: defaultHeaders,
    credentials: 'include', // Always include cookies
  };

  let response = await fetch(input, config);

  // Handle authentication failures
  if (response.status === 401 || response.status === 403) {
    console.log('🔐 Authentication failed, attempting session refresh...');
    
    try {
      const refreshResult = await cookieAuth.refreshSession();
      
      if (refreshResult) {
        // Get updated CSRF token after refresh
        const newCsrfToken = getCSRFToken();
        const updatedHeaders = {
          ...defaultHeaders,
          ...(newCsrfToken && { 'X-CSRFToken': newCsrfToken }),
        };
        
        // Retry the original request with refreshed session
        response = await fetch(input, { ...config, headers: updatedHeaders });
        
        // If still failing after refresh, force logout
        if (response.status === 401 || response.status === 403) {
          console.log('🔐 Session refresh failed, forcing logout...');
          await cookieAuth.forceLogout();
          throw new Error('Authentication expired. Please log in again.');
        }
      } else {
        // Session refresh failed, force logout
        console.log('🔐 Session refresh failed, forcing logout...');
        await cookieAuth.forceLogout();
        throw new Error('Authentication expired. Please log in again.');
      }
    } catch (error) {
      // Force logout on any error
      await cookieAuth.forceLogout();
      throw error;
    }
  }

  return response;
}

// Fallback JWT fetch function for when cookies are not accepted (Issue 2 fix)
export async function jwtFetch(input: RequestInfo, init: RequestInit = {}) {
  let token = localStorage.getItem('token');
  let refreshToken = localStorage.getItem('refresh');
  
  if (!token) {
    throw new Error('No authentication token available');
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...init.headers,
  };

  const config: RequestInit = {
    ...init,
    headers: defaultHeaders,
    // Don't include credentials for JWT auth
  };

  let response = await fetch(input, config);

  // If 401 or 403, token might be expired, try to refresh or generate new one
  if ((response.status === 401 || response.status === 403) && refreshToken) {
    try {
      console.log('🔄 JWT token expired, attempting refresh...');
      const refreshResponse = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        localStorage.setItem('token', data.access);
        
        // Retry with new token
        const retryConfig = {
          ...config,
          headers: {
            ...config.headers,
            'Authorization': `Bearer ${data.access}`,
          },
        };
        response = await fetch(input, retryConfig);
        
        // If still failing after refresh, force logout
        if (response.status === 401 || response.status === 403) {
          console.log('🔐 JWT refresh failed, forcing logout...');
          await cookieAuth.forceLogout();
          throw new Error('Authentication expired. Please log in again.');
        }
      } else {
        // Refresh failed, force logout
        console.log('🔐 JWT refresh failed, forcing logout...');
        await cookieAuth.forceLogout();
        throw new Error('Authentication expired. Please log in again.');
      }
    } catch (error) {
      await cookieAuth.forceLogout();
      throw new Error('Authentication expired. Please log in again.');
    }
  } else if (response.status === 401 || response.status === 403) {
    // No refresh token or other auth failure, force logout
    console.log('🔐 JWT authentication failed, forcing logout...');
    await cookieAuth.forceLogout();
    throw new Error('Authentication expired. Please log in again.');
  }

  return response;
}

// Special fetch function for Node.js service (WEBSOCKET_URL) that uses JWT tokens
export async function nodeFetch(input: RequestInfo, init: RequestInit = {}) {
  const url = input.toString();
  
  // Check if this is a Node.js service call
  const isNodeService = url.includes('localhost:3001') || url.includes(process.env.WEBSOCKET_URL);
  
  if (!isNodeService) {
    // Use regular cookieFetch for Django API calls
    return cookieFetch(input, init);
  }
  
  // For Node.js service, use JWT token authentication
  let token = localStorage.getItem('token');
  const authMethod = localStorage.getItem('auth_method');
  
  // If session user doesn't have JWT token, get one
  if (!token && authMethod === 'session') {
    try {
      const response = await cookieFetch(`${API_BASE_URL}/api/session/to-jwt/`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        token = data.token;
        // Store the tokens for future use
        localStorage.setItem('token', data.token);
        localStorage.setItem('refresh', data.refresh);
      } else {
        console.error('❌ Failed to generate JWT token for session user');
        throw new Error('Unable to access chat service - authentication failed');
      }
    } catch (error) {
      console.error('❌ Error generating JWT token:', error);
      throw error;
    }
  }
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...init.headers,
  };

  const config: RequestInit = {
    ...init,
    headers: defaultHeaders,
    // Don't include credentials for Node.js service
  };

  const response = await fetch(input, config);

  // If 401 or 403, token might be expired, try to refresh or generate new one
  if ((response.status === 401 || response.status === 403) && authMethod === 'session') {
    try {
      console.log('🔄 JWT token expired for session user, regenerating...');
      const refreshResponse = await cookieFetch(`${API_BASE_URL}/api/session/to-jwt/`, {
        method: 'POST',
      });
      
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('refresh', data.refresh);
        
        // Retry the original request with new token
        const retryConfig = {
          ...config,
          headers: {
            ...config.headers,
            'Authorization': `Bearer ${data.token}`,
          },
        };
        return await fetch(input, retryConfig);
      } else {
        // Regeneration failed, force logout
        console.log('🔐 JWT regeneration failed, forcing logout...');
        await cookieAuth.forceLogout();
        throw new Error('Authentication expired. Please log in again.');
      }
    } catch (error) {
      console.error('❌ Failed to refresh JWT token for session user:', error);
      await cookieAuth.forceLogout();
      throw new Error('Authentication expired. Please log in again.');
    }
  } else if (response.status === 401 || response.status === 403) {
    // Other auth failure, force logout
    console.log('🔐 Node.js service authentication failed, forcing logout...');
    await cookieAuth.forceLogout();
    throw new Error('Authentication expired. Please log in again.');
  }

  return response;
}

// Utility to get CSRF token from cookies (if needed)
export function getCSRFToken(): string | null {
  const cookies = document.cookie.split(';');
  
  // Try different possible CSRF cookie names
  const possibleNames = ['wozza_csrftoken', 'csrftoken', 'csrf_token'];
  
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (possibleNames.includes(name)) {
      return decodeURIComponent(value);
    }
  }
  
  // Also try to get from meta tag (common Django pattern)
  const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
  if (metaTag) {
    return metaTag.content;
  }
  
  return null;
}

// Utility to check if cookies are enabled
export function areCookiesEnabled(): boolean {
  try {
    // Try to set a test cookie
    document.cookie = 'test_cookie=test; path=/';
    const enabled = document.cookie.includes('test_cookie=test');
    
    // Clean up test cookie
    document.cookie = 'test_cookie=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    
    return enabled;
  } catch (error) {
    return false;
  }
}

// Utility to check if user has given cookie consent (Issue 2 fix)
export function isCookieConsentGiven(): boolean {
  try {
    const consent = localStorage.getItem('wozza-cookie-consent');
    const preferences = localStorage.getItem('wozza-cookie-preferences');
    
    if (!consent) return false;
    
    if (preferences) {
      const prefs = JSON.parse(preferences);
      // At minimum, necessary cookies should be enabled for auth
      return prefs.necessary === true;
    }
    
    // If consent given but no preferences stored, assume necessary cookies are OK
    return true;
  } catch (error) {
    console.error('Error checking cookie consent:', error);
    return false;
  }
}

// Debug function to troubleshoot cookie and authentication issues
export function debugCookies() {
  console.log('🍪 Cookie Debug Information:');
  console.log('All cookies:', document.cookie);
  
  // Check specific cookies
  const sessionCookie = document.cookie.includes('wozza_sessionid');
  const csrfCookie = document.cookie.includes('wozza_csrftoken');
  
  console.log('Session cookie present:', sessionCookie);
  console.log('CSRF cookie present:', csrfCookie);
  
  // Check localStorage
  console.log('Auth method:', localStorage.getItem('auth_method'));
  console.log('User data:', localStorage.getItem('user'));
  console.log('Token present:', !!localStorage.getItem('token'));
  
  // Check cookie consent
  console.log('Cookie consent given:', isCookieConsentGiven());
  console.log('Cookies enabled:', areCookiesEnabled());
  
  // Check current domain
  console.log('Current domain:', window.location.hostname);
  console.log('Current protocol:', window.location.protocol);
}

export default cookieAuth; 
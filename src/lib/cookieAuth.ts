import { API_BASE_URL } from '@/lib/config';

// Cookie-based authentication utilities
export const cookieAuth = {
  // Login with cookies
  async login(email: string, password: string, useCookies: boolean = true) {
    const response = await fetch(`${API_BASE_URL}/api/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies in request
      body: JSON.stringify({ 
        email, 
        password, 
        use_cookies: useCookies 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();
    
    // Store authentication method preference
    localStorage.setItem('auth_method', data.authentication_method);
    
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
      
      return response.ok;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local storage even if logout request fails
      this.clearAllAuthData();
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
    
    console.log('🧹 All authentication data cleared');
  },

  // Force logout and redirect (for when authentication fails)
  async forceLogout() {
    await this.logout();
    
    // Dispatch custom event to notify other parts of the app
    window.dispatchEvent(new CustomEvent('auth:logout'));
    
    // Force redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
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
        return await response.json();
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
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Session refresh error:', error);
      return null;
    }
  },

  // Check if user is authenticated (works with both cookies and JWT)
  async isAuthenticated() {
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
  },
};

// Enhanced fetch function that works with cookies
export async function cookieFetch(input: RequestInfo, init: RequestInit = {}) {
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

  // If we get a 401, try to refresh the session
  if (response.status === 401) {
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
    } else {
      // Session refresh failed, force logout and redirect
      console.log('Session expired, forcing logout...');
      
      await cookieAuth.forceLogout();
      
      throw new Error('Session expired. Please log in again.');
    }
  }

  return response;
}

// Special fetch function for Node.js service (WEBSOCKET_URL) that uses JWT tokens
export async function nodeFetch(input: RequestInfo, init: RequestInit = {}) {
  const url = input.toString();
  
  // Check if this is a Node.js service call
  const isNodeService = url.includes('localhost:3001') || url.includes(process.env.WEBSOCKET_URL || '');
  
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
      console.log('🎫 Session user needs JWT token for Node.js service, generating...');
      const response = await cookieFetch(`${API_BASE_URL}/api/session/to-jwt/`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        token = data.token;
        // Store the tokens for future use
        localStorage.setItem('token', data.token);
        localStorage.setItem('refresh', data.refresh);
        console.log('✅ JWT token generated for session user');
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

  // If 401, token might be expired, try to refresh or generate new one
  if (response.status === 401 && authMethod === 'session') {
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
      }
    } catch (error) {
      console.error('❌ Failed to refresh JWT token for session user:', error);
    }
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

export default cookieAuth; 
import { getAccessToken, refreshAccessToken, clearTokens } from './auth';

export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  let token = getAccessToken();
  let headers = { ...(init.headers || {}), Authorization: `Bearer ${token}` };

  let response = await fetch(input, { ...init, headers });

  if (response.status === 401) {
    // Try to refresh the token
    token = await refreshAccessToken();
    if (token) {
      headers = { ...headers, Authorization: `Bearer ${token}` };
      response = await fetch(input, { ...init, headers });
    } else {
      // Clear tokens and redirect to login
      clearTokens();
      
      // Force redirect to login with multiple fallback methods
      try {
        // Method 1: Use window.location.replace (more reliable than href)
        window.location.replace('/login');
      } catch (e) {
        try {
          // Method 2: Fallback to href
      window.location.href = '/login';
        } catch (e2) {
          try {
            // Method 3: Use router push if available (for React Router)
            if (window.history && window.history.pushState) {
              window.history.pushState({}, '', '/login');
              window.dispatchEvent(new PopStateEvent('popstate'));
            } else {
              // Method 4: Last resort - reload the page
              window.location.reload();
            }
          } catch (e3) {
            // Method 5: Ultimate fallback - force page reload
            document.location.href = '/login';
          }
        }
      }
      
      throw new Error('Session expired. Please log in again.');
    }
  }

  return response;
} 
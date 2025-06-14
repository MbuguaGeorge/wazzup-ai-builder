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
      clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
  }

  return response;
} 
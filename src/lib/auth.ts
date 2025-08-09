const API_BASE_URL = 'https://core.wozza.io';

export function getAccessToken() {
  return localStorage.getItem('token');
}

export function getRefreshToken() {
  return localStorage.getItem('refresh');
}

export function setTokens(token: string, refresh: string) {
  localStorage.setItem('token', token);
  localStorage.setItem('refresh', refresh);
}

export function clearTokens() {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh');
}

// Refresh the access token using the refresh token
export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (response.ok) {
    const data = await response.json();
    setTokens(data.access, refresh); // keep the same refresh
    return data.access;
  } else {
    clearTokens();
    return null;
  }
} 
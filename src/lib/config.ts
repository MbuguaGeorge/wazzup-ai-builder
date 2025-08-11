// API Configuration
export const API_BASE_URL = 'https://core.wozza.io';
// export const API_BASE_URL = 'http://127.0.0.1:8000';

// WebSocket Configuration for real-time connections
export const WEBSOCKET_URL = 'https://realtime.wozza.io';

// App Configuration
export const APP_CONFIG = {
  API_BASE_URL,
  WEBSOCKET_URL,
  DEFAULT_PAGE_SIZE: 20,
  MAX_NOTIFICATIONS_DROPDOWN: 4,
} as const; 
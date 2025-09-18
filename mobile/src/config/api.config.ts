// API Configuration
// This file is auto-generated. You can modify it as needed.

export const API_CONFIG = {
  // Development URLs
  LOCAL: 'http://localhost:3000',
  LOCAL_IP: 'http://192.168.1.14:3000',

  // Production URL (update this when you deploy)
  PRODUCTION: 'https://your-backend-domain.com',

  // Current environment
  CURRENT: __DEV__ ? 'http://192.168.1.14:3000' : 'https://your-backend-domain.com',
};

// Export the current API base URL
export const API_BASE_URL = API_CONFIG.CURRENT;

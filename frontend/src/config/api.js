// ✅ API Configuration for development and production environments
const config = {
  development: {
    API_BASE_URL: 'https://finalfypproject-b8to2pczs-huzaifas-projects-eabfae35.vercel.app',
  },
  production: {
    API_BASE_URL:
      process.env.REACT_APP_API_BASE_URL ||
      'https://finalfypproject-b8to2pczs-huzaifas-projects-eabfae35.vercel.app',
  },
};

const environment = process.env.NODE_ENV || 'development';
const currentConfig = config[environment];

export const API_BASE_URL = currentConfig.API_BASE_URL;

// ✅ Debug log (only during development)
if (environment === 'development') {
  console.log('✅ API Configuration:', {
    environment,
    API_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
  });
}

// ✅ Define all API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/signup',
  GOOGLE_AUTH: '/auth/google/google',

  // Core
  MENUS: '/api/menus',
  ORDERS: '/api/orders',
  ROOMS: '/api/rooms',
  TABLES: '/api/tables',
  BOOKINGS: '/api/bookings',
  RESERVATIONS: '/api/reservations',
  USERS: '/api/user',
  ADMIN: '/api/admin',
  FEEDBACK: '/api/feedback',
  PAYMENT: '/api/payment',
  STAFF: '/api/staff',
  SHIFT: '/api/shift',

  // ML Recommendations
  FOOD_RECOMMENDATIONS: '/api/food-recommendations',
  TABLE_RECOMMENDATIONS: '/api/tables',

  // System
  HEALTH: '/api/health',
  STATUS: '/api/status',
  SYSTEM_INFO: '/api/system-info',
  ML_INFO: '/api/ml-info',
};

// ✅ Builds a complete API URL
export const buildApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

// ✅ Generic API call wrapper
export const apiCall = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add token if available
  const token = localStorage.getItem('token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    console.log(`📡 Fetching: ${url}`);
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ API Response:', data);
    return data;
  } catch (error) {
    console.error('❌ API call error:', error.message || error);
    throw error;
  }
};

// ✅ Simple health check
export const testConnection = async () => {
  try {
    await apiCall(API_ENDPOINTS.HEALTH);
    console.log('✅ Backend is reachable.');
    return true;
  } catch {
    console.warn('⚠️ Backend is unreachable.');
    return false;
  }
};

// ✅ Default export if you prefer importing everything at once
export default {
  API_BASE_URL,
  API_ENDPOINTS,
  buildApiUrl,
  apiCall,
  testConnection,
};

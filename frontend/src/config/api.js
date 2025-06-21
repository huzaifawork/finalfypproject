// API Configuration for different environments
const config = {
  development: {
    API_BASE_URL: 'https://finalfypproject-b8to2pczs-huzaifas-projects-eabfae35.vercel.app',
  },
  production: {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://finalfypproject-b8to2pczs-huzaifas-projects-eabfae35.vercel.app',
  }
};

const environment = process.env.NODE_ENV || 'development';
const currentConfig = config[environment];

export const API_BASE_URL = currentConfig.API_BASE_URL;

console.log('✅ API Configuration:', {
  environment,
  API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL
});

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/signup',
  GOOGLE_AUTH: '/auth/google/google',
  
  // Core APIs
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
  
  // Recommendations
  FOOD_RECOMMENDATIONS: '/api/food-recommendations',
  TABLE_RECOMMENDATIONS: '/api/tables',
  
  // System
  HEALTH: '/api/health',
  STATUS: '/api/status',
  SYSTEM_INFO: '/api/system-info',
  ML_INFO: '/api/ml-info',
};

// Helper to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// API call wrapper
export const apiCall = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  try {
    console.log(`📡 Calling API: ${url}`);
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Response:`, data);
    return data;
  } catch (error) {
    console.error('❌ API call failed:', error);
    throw error;
  }
};

// Test API connection
export const testConnection = async () => {
  try {
    const response = await apiCall('/api/health');
    console.log('✅ Backend connection healthy:', response);
    return true;
  } catch (error) {
    console.error('❌ Backend health check failed:', error);
    return false;
  }
};

// Export default config
export default {
  API_BASE_URL,
  API_ENDPOINTS,
  buildApiUrl,
  apiCall,
  testConnection,
};

// API Configuration for different environments
const config = {
  development: {
    API_BASE_URL: 'http://localhost:8080',
  },
  production: {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://your-backend-url.vercel.app',
  }
};

const environment = process.env.NODE_ENV || 'development';
const currentConfig = config[environment];

export const API_BASE_URL = currentConfig.API_BASE_URL;

console.log('API Configuration:', {
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

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function for API calls with better error handling
export const apiCall = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Add authorization header if token exists
  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  try {
    console.log(`Making API call to: ${url}`);
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log(`API call successful:`, data);
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Test API connection
export const testConnection = async () => {
  try {
    const response = await apiCall('/api/health');
    console.log('Backend connection test successful:', response);
    return true;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
};

// Export default configuration
export default {
  API_BASE_URL,
  API_ENDPOINTS,
  buildApiUrl,
  apiCall,
  testConnection,
};
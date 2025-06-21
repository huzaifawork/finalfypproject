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
  ML_INFO: '/api/ml-info',
};

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Export default configuration
export default {
  API_BASE_URL,
  API_ENDPOINTS,
  buildApiUrl,
};

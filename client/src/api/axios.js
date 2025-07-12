import axios from 'axios';
import { getEnv, getEnvNumber, isDevelopment } from '../config/env.js';
import { getToken, clearToken, isTokenExpired } from '../utils/tokenManager.js';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: getEnv('REACT_APP_API_URL'),
  timeout: getEnvNumber('REACT_APP_API_TIMEOUT', 10000),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authorization header
apiClient.interceptors.request.use(
  (config) => {
    // Check if this is an absolute URL that's not under /api (ignore 3rd-party services)
    const isAbsoluteUrl = /^https?:\/\//i.test(config.url);
    const isApiRequest = !isAbsoluteUrl || (config.url && config.url.includes('/api'));
    
    if (!isApiRequest) {
      if (isDevelopment()) {
        console.log('🌐 Skipping auth for external URL:', config.url);
      }
      return config;
    }
    
    const token = getToken();
    
    if (token) {
      // Harden token retrieval - detect if token has quotes (shouldn't happen after previous steps)
      if (token.startsWith('"') || token.startsWith("'")) {
        console.error('🚨 Token starts with quotes - this should not happen!', {
          tokenPreview: token.substring(0, 20) + '...',
          tokenLength: token.length,
          startsWithDoubleQuote: token.startsWith('"'),
          startsWithSingleQuote: token.startsWith("'"),
          url: config.url
        });
        // Clear the malformed token to prevent auth issues
        clearToken();
        return Promise.reject(new Error('Malformed token detected and cleared'));
      }
      // Check if token is expired before sending
      if (isTokenExpired(token)) {
        console.log('🚫 Token expired, clearing and redirecting...');
        clearToken();
        // Optionally redirect to login or reject the request
        return Promise.reject(new Error('Token expired'));
      }
      
      // Always attach Authorization header with the exact token
      config.headers.Authorization = `Bearer ${token}`;
      
      // Log token for debugging (in development only)
      if (isDevelopment()) {
        console.log('🔑 Sending token:', token.substring(0, 30) + '...');
        console.log('🔑 Token length:', token.length);
        console.log('🔑 Full auth header:', config.headers.Authorization.substring(0, 50) + '...');
        console.log('📡 Request to:', config.baseURL + config.url);
      }
    } else {
      // Log when no token is found
      if (isDevelopment()) {
        console.log('⚠️ No valid token found for request to:', config.url);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and auto-logout/refresh
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (isDevelopment()) {
      console.log('✅ Response:', response.status, response.config.url);
    }
    return response;
  },
  async (error) => {
    // Log all errors in development
    if (isDevelopment()) {
      console.error('🚨 API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data
      });
    }
    
    // Handle 401/403 errors (unauthorized/forbidden)
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('🔒 Authentication error, clearing token...');
      
      // Use token manager to clear token
      clearToken();
      
      // Trigger auth:logout event
      window.dispatchEvent(new CustomEvent('auth:logout'));
      
      // Enhanced error message
      const errorMsg = error.response?.data?.error || 'Authentication failed';
      error.message = `${errorMsg}. Please log in again.`;
      
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network error:', error.message);
      error.message = 'Network error. Please check your connection and try again.';
    }

    // Handle other HTTP errors
    if (error.response?.data?.error) {
      error.message = error.response.data.error;
    }

    return Promise.reject(error);
  }
);

export default apiClient;

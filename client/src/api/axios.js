import axios from 'axios';
import { getEnv, getEnvNumber } from '../config/env.js';

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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and auto-logout/refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Clear token from localStorage
      localStorage.removeItem('token');
      
      // Redirect to login or trigger logout
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        // Try to trigger logout through a custom event
        window.dispatchEvent(new CustomEvent('auth:logout'));
        
        // Alternative: redirect to login page
        // window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      error.message = 'Network error. Please check your connection.';
    }

    // Handle other HTTP errors
    if (error.response?.data?.error) {
      error.message = error.response.data.error;
    }

    return Promise.reject(error);
  }
);

export default apiClient;

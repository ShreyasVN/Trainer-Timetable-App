/**
 * Environment Configuration Utility
 * Safely manages environment variables with defaults and validation
 */

import { API_BASE } from '../config';

// Environment variable defaults
const ENV_DEFAULTS = {
  REACT_APP_API_URL: API_BASE,
  REACT_APP_API_TIMEOUT: '10000',
  REACT_APP_APP_NAME: 'Trainer Timetable App',
  REACT_APP_VERSION: '1.0.0',
  REACT_APP_DEBUG: 'false',
  REACT_APP_ENABLE_EXAMPLES: 'false',
  REACT_APP_TOKEN_KEY: 'token',
  REACT_APP_ENABLE_ANIMATIONS: 'true',
  REACT_APP_ENABLE_DEMO_MODE: 'false'
};

/**
 * Safely get an environment variable with fallback
 * @param {string} key - Environment variable key
 * @param {string} fallback - Fallback value if env var is not set
 * @returns {string} The environment variable value or fallback
 */
export const getEnv = (key, fallback = '') => {
  try {
    const value = process.env[key];
    if (value !== undefined && value !== null) {
      return value;
    }
    
    // Check if we have a default for this key
    if (ENV_DEFAULTS[key] !== undefined) {
      return ENV_DEFAULTS[key];
    }
    
    return fallback;
  } catch (error) {
    console.warn(`Failed to access environment variable ${key}:`, error);
    return fallback;
  }
};

/**
 * Get boolean environment variable
 * @param {string} key - Environment variable key
 * @param {boolean} fallback - Fallback boolean value
 * @returns {boolean}
 */
export const getEnvBool = (key, fallback = false) => {
  const value = getEnv(key, fallback.toString());
  return value === 'true' || value === '1' || value === 'yes';
};

/**
 * Get numeric environment variable
 * @param {string} key - Environment variable key
 * @param {number} fallback - Fallback numeric value
 * @returns {number}
 */
export const getEnvNumber = (key, fallback = 0) => {
  const value = getEnv(key, fallback.toString());
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Check if we're in development mode
 * @returns {boolean}
 */
export const isDevelopment = () => {
  try {
    return process.env.NODE_ENV === 'development';
  } catch (error) {
    console.warn('Unable to access NODE_ENV, defaulting to production mode');
    return false;
  }
};

/**
 * Check if we're in production mode
 * @returns {boolean}
 */
export const isProduction = () => {
  try {
    return process.env.NODE_ENV === 'production';
  } catch (error) {
    console.warn('Unable to access NODE_ENV, defaulting to production mode');
    return true;
  }
};

/**
 * Get environment configuration object
 * @returns {object} Configuration object with all environment variables
 */
export const getEnvConfig = () => {
  return {
    // API Configuration
    apiUrl: getEnv('REACT_APP_API_URL'),
    apiTimeout: getEnvNumber('REACT_APP_API_TIMEOUT', 10000),
    
    // Application Configuration
    appName: getEnv('REACT_APP_APP_NAME'),
    version: getEnv('REACT_APP_VERSION'),
    
    // Development Settings
    debug: getEnvBool('REACT_APP_DEBUG'),
    enableExamples: getEnvBool('REACT_APP_ENABLE_EXAMPLES'),
    
    // Authentication
    tokenKey: getEnv('REACT_APP_TOKEN_KEY', 'token'),
    
    // Features
    enableAnimations: getEnvBool('REACT_APP_ENABLE_ANIMATIONS', true),
    enableDemoMode: getEnvBool('REACT_APP_ENABLE_DEMO_MODE'),
    
    // Environment flags
    isDevelopment: isDevelopment(),
    isProduction: isProduction()
  };
};

// Export the configuration object as default
export default getEnvConfig();

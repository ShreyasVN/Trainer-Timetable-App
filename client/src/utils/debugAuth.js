/**
 * Authentication Debug Utility
 * Helps troubleshoot authentication and token issues
 */

import { getToken, getTokenInfo, debugToken } from './tokenManager';
import { API_BASE } from '../config';

/**
 * Check API connectivity
 */
export const checkAPIConnectivity = async () => {
  try {
    const response = await fetch(API_BASE);
    if (response.ok) {
      console.log('✅ API is reachable');
      return true;
    } else {
      console.error('❌ API returned error:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ API connectivity error:', error.message);
    return false;
  }
};

/**
 * Test authentication endpoint
 */
export const testAuthEndpoint = async () => {
  try {
    const token = getToken();
    if (!token) {
      console.log('❌ No token available for testing');
      return false;
    }

    const response = await fetch(`${API_BASE}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Auth endpoint test successful:', data);
      return true;
    } else {
      const errorData = await response.text();
      console.error('❌ Auth endpoint test failed:', response.status, errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Auth endpoint test error:', error.message);
    return false;
  }
};

/**
 * Run comprehensive authentication diagnostics
 */
export const runAuthDiagnostics = async () => {
  console.group('🔍 Authentication Diagnostics');
  
  // Check environment
  console.log('🌍 Environment:', process.env.NODE_ENV);
  console.log('🔗 API URL:', API_BASE);
  
  // Check token
  const token = getToken();
  if (token) {
    console.log('🔑 Token found');
    debugToken(token);
    
    const tokenInfo = getTokenInfo(token);
    if (tokenInfo.expired) {
      console.warn('⚠️ Token is expired!');
    }
  } else {
    console.log('❌ No token found');
  }
  
  // Check API connectivity
  console.log('🌐 Testing API connectivity...');
  const apiReachable = await checkAPIConnectivity();
  
  if (apiReachable && token) {
    console.log('🔐 Testing authentication...');
    await testAuthEndpoint();
  }
  
  console.groupEnd();
};

/**
 * Clear all auth data and refresh page
 */
export const resetAuth = () => {
  console.log('🔄 Resetting authentication...');
  localStorage.clear();
  sessionStorage.clear();
  window.location.reload();
};

// Auto-run diagnostics in development
if (process.env.NODE_ENV === 'development') {
  // Add global debug functions
  window.debugAuth = {
    runDiagnostics: runAuthDiagnostics,
    debugToken: () => debugToken(),
    resetAuth: resetAuth,
    checkAPI: checkAPIConnectivity,
    testAuth: testAuthEndpoint
  };
  
  console.log('🛠️ Auth debug functions available: window.debugAuth');
}

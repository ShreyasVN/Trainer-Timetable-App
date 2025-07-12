import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getToken, setToken, clearToken } from '../utils/tokenManager';

/**
 * Check if a token has valid JWT structure (three dot-separated segments)
 * @param {string} token - Token to validate
 * @returns {boolean} - True if token has valid JWT structure
 */
function isJwt(token) {
  return token && typeof token === 'string' && token.split('.').length === 3;
}

/**
 * Custom hook for authentication
 * @returns {object} - Authentication state and methods
 */
export function useAuth() {
  const [token, setTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to get current token
  const getTokenCallback = useCallback(() => {
    return getToken();
  }, []);

  // Check if token is valid
  const isTokenValid = useCallback((token) => {
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      if (!decoded) {
        console.log('Failed to decode token');
        return false;
      }
      
      const isValid = decoded.exp * 1000 > Date.now();
      console.log('Token validation:', {
        hasExpiry: !!decoded.exp,
        expiry: decoded.exp,
        now: Date.now(),
        isValid
      });
      return isValid;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }, []);

  // Login function
  const login = useCallback((newToken) => {
    console.log('Login function called with token:', newToken);
    
    // Clean and validate the token
    const cleanToken = typeof newToken === 'string' ? newToken.trim() : newToken;
    
    // First, perform basic syntactic verification (three dot-segments)
    if (!isJwt(cleanToken)) {
      console.error('Invalid token format: not a valid JWT structure');
      return { success: false, error: 'Invalid token format' };
    }
    
    try {
      // Try to decode the token
      const decoded = jwtDecode(cleanToken);
      console.log('Decoded token:', decoded);
      
      if (!decoded) {
        console.error('Failed to decode token');
        return { success: false, error: 'Token decoding failed' };
      }
      
      // Check token validity
      const isValid = isTokenValid(cleanToken);
      console.log('Token is valid:', isValid);
      
      if (!isValid) {
        console.error('Token validation failed');
        return { success: false, error: 'Token is expired or invalid' };
      }
      
      // Store the clean token using tokenManager (single source of truth)
      const tokenStored = setToken(cleanToken, decoded);
      if (!tokenStored) {
        console.error('Failed to store token via tokenManager');
        return { success: false, error: 'Token storage failed' };
      }
      console.debug('🔍 [useAuth] login() - setToken(cleanToken, decoded) called with:', cleanToken);
      setTokenState(cleanToken);
      console.debug('🔍 [useAuth] login() - setTokenState(cleanToken) called with:', cleanToken);
      setUser(decoded);
      console.log('User set successfully:', decoded);
      return { success: true, user: decoded };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }, [isTokenValid]);

  // Logout function
  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
    
    // Note: clearToken already dispatches the logout event
  }, []);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      const currentToken = getToken();
      if (currentToken && isTokenValid(currentToken)) {
        const decoded = jwtDecode(currentToken);
        setTokenState(currentToken);
        setUser(decoded);
      } else if (currentToken) {
        // Token exists but is invalid, clear it
        clearToken();
        setTokenState(null);
        setUser(null);
      }
      setLoading(false);
    };
    
    initAuth();
  }, [isTokenValid]);

  // Listen for auto-logout events
  useEffect(() => {
    const handleAutoLogout = () => {
      console.log('Auto-logout event received');
      logout();
    };

    window.addEventListener('auth:logout', handleAutoLogout);
    return () => window.removeEventListener('auth:logout', handleAutoLogout);
  }, [logout]);

  return {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    getToken: getTokenCallback,
  };
}

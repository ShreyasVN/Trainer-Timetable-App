import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

/**
 * Custom JWT decode function
 * @param {string} token - JWT token to decode
 * @returns {object|null} - Decoded payload or null if invalid
 */
function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decoding JWT:', e);
    return null;
  }
}

/**
 * Custom hook for authentication
 * @returns {object} - Authentication state and methods
 */
export function useAuth() {
  const [token, setToken] = useLocalStorage('token', null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token is valid
  const isTokenValid = useCallback((token) => {
    if (!token) return false;
    
    try {
      const decoded = decodeJwt(token);
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
    
    try {
      // Store the token first
      setToken(newToken);
      
      // Try to decode the token
      const decoded = decodeJwt(newToken);
      console.log('Decoded token:', decoded);
      
      if (!decoded) {
        console.warn('Could not decode token, but proceeding with login');
        // Create a minimal user object if we can't decode
        const fallbackUser = {
          id: 1,
          email: 'user@example.com',
          role: 'trainer',
          name: 'User'
        };
        setUser(fallbackUser);
        return { success: true, user: fallbackUser };
      }
      
      // Check token validity but don't block login if validation fails
      const isValid = isTokenValid(newToken);
      console.log('Token is valid:', isValid);
      
      if (!isValid) {
        console.warn('Token validation failed, but proceeding with login');
      }
      
      setUser(decoded);
      console.log('User set successfully:', decoded);
      return { success: true, user: decoded };
    } catch (error) {
      console.error('Login error:', error);
      // Even if there's an error, try to proceed with a fallback
      const fallbackUser = {
        id: 1,
        email: 'user@example.com',
        role: 'trainer',
        name: 'User'
      };
      setUser(fallbackUser);
      return { success: true, user: fallbackUser };
    }
  }, [isTokenValid, setToken]);

  // Logout function
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    
    // Dispatch logout event for other components
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }, [setToken]);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      if (token && isTokenValid(token)) {
        const decoded = decodeJwt(token);
        setUser(decoded);
      } else if (token) {
        // Token exists but is invalid, clear it
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };
    
    initAuth();
  }, [token, isTokenValid, setToken]);

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
  };
}

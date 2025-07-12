/**
 * Token Management Utility
 * Handles secure token storage, validation, and debugging
 */

// Token storage keys
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * Safely store token in localStorage
 * @param {string} token - JWT token
 * @param {object} user - User object
 */
export const setToken = (token, user) => {
  try {
    if (!token) {
      console.error('❌ Cannot store empty token');
      return false;
    }
    
    // Clean the token (remove any extra whitespace or formatting)
    const cleanToken = token.trim();
    
    // Validate token format (basic JWT structure check)
    if (!cleanToken.includes('.') || cleanToken.split('.').length !== 3) {
      console.error('❌ Invalid JWT token format:', cleanToken.substring(0, 20) + '...');
      return false;
    }
    
    // Store the token exactly as received
    // NOTE: This is the ONLY place where direct localStorage.setItem() for tokens should occur
    // ESLint rules prevent this pattern elsewhere to enforce centralized token management
    localStorage.setItem(TOKEN_KEY, cleanToken);
    console.debug('🔍 [tokenManager] setToken() - localStorage.setItem("token", cleanToken):', cleanToken);
    
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    
    console.log('✅ Token stored successfully:', cleanToken.substring(0, 30) + '...');
    console.log('✅ Token length:', cleanToken.length);
    return true;
  } catch (error) {
    console.error('❌ Error storing token:', error);
    return false;
  }
};

/**
 * Safely retrieve token from localStorage
 * @returns {string|null} Token or null if not found
 */
export const getToken = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      console.log('⚠️ No token found in localStorage');
      return null;
    }
    
    const cleanToken = token.trim();
    
    // Validate token format
    if (!cleanToken.includes('.') || cleanToken.split('.').length !== 3) {
      console.error('❌ Invalid token format found in storage, clearing...');
      clearToken();
      return null;
    }
    
    return cleanToken;
  } catch (error) {
    console.error('❌ Error retrieving token:', error);
    return null;
  }
};

/**
 * Get stored user data
 * @returns {object|null} User object or null
 */
export const getUser = () => {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('❌ Error retrieving user data:', error);
    return null;
  }
};

/**
 * Clear all auth data
 */
export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    console.log('🗑️ Auth data cleared');
    
    // Dispatch custom event for logout
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  } catch (error) {
    console.error('❌ Error clearing token:', error);
  }
};

/**
 * Check if token exists and appears valid
 * @returns {boolean}
 */
export const hasValidToken = () => {
  const token = getToken();
  return token !== null;
};

/**
 * Decode JWT token payload (without verification)
 * @param {string} token - JWT token
 * @returns {object|null} Decoded payload or null
 */
export const decodeTokenPayload = (token) => {
  try {
    const cleanToken = token || getToken();
    if (!cleanToken) return null;
    
    const parts = cleanToken.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    
    return decoded;
  } catch (error) {
    console.error('❌ Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token (optional, uses stored token if not provided)
 * @returns {boolean}
 */
export const isTokenExpired = (token) => {
  try {
    const payload = decodeTokenPayload(token);
    if (!payload || !payload.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('❌ Error checking token expiration:', error);
    return true;
  }
};

/**
 * Get token expiration info
 * @param {string} token - JWT token (optional)
 * @returns {object} Expiration info
 */
export const getTokenInfo = (token) => {
  try {
    const payload = decodeTokenPayload(token);
    if (!payload) {
      return { valid: false, expired: true };
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    const expired = payload.exp < currentTime;
    const expiresAt = new Date(payload.exp * 1000);
    const timeLeft = payload.exp - currentTime;
    
    return {
      valid: true,
      expired,
      expiresAt,
      timeLeft,
      user: {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        name: payload.name
      }
    };
  } catch (error) {
    console.error('❌ Error getting token info:', error);
    return { valid: false, expired: true };
  }
};

/**
 * Debug token for troubleshooting
 * @param {string} token - JWT token (optional)
 */
export const debugToken = (token) => {
  const targetToken = token || getToken();
  
  console.group('🔍 Token Debug Info');
  
  if (!targetToken) {
    console.log('❌ No token found');
    console.groupEnd();
    return;
  }
  
  console.log('📄 Token (first 30 chars):', targetToken.substring(0, 30) + '...');
  console.log('📏 Token length:', targetToken.length);
  console.log('🔗 Token parts:', targetToken.split('.').length);
  
  const info = getTokenInfo(targetToken);
  if (info.valid) {
    console.log('✅ Token is valid');
    console.log('👤 User:', info.user);
    console.log('⏰ Expires at:', info.expiresAt);
    console.log('⏳ Time left (seconds):', info.timeLeft);
    console.log('💀 Expired:', info.expired);
  } else {
    console.log('❌ Token is invalid');
  }
  
  console.groupEnd();
};

/**
 * Verify token with backend server
 * @param {object} api - Axios instance with auto-attached token
 * @returns {Promise<object>} - Verification result
 */
export const verifyTokenWithBackend = async (api) => {
  try {
    const token = getToken();
    if (!token) {
      return { success: false, error: 'No token found' };
    }
    
    const response = await api.get('/auth/verify');
    const user = response.data.user;
    
    console.log('✅ Token verified with backend, user:', user);
    return { success: true, user };
  } catch (error) {
    console.error('❌ Backend token verification failed:', error);
    clearToken();
    return { success: false, error: error.message || 'Token verification failed' };
  }
};

// Auto-clear expired tokens on module load
if (typeof window !== 'undefined') {
  const token = getToken();
  if (token && isTokenExpired(token)) {
    console.log('🗑️ Clearing expired token on app load');
    clearToken();
  }
}

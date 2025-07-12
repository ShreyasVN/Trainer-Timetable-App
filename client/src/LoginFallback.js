// Fallback Login component with vanilla React and CSS animations
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { authService } from './api';
import './App.css';
import { validateForm } from './utils/formValidation';

function LoginFallback({ onLogin, onGoToRegister }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateForm(formData, ['email', 'password']);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(formData);
      console.log('Login response:', response.data);
      
      // Handle the API response structure: {success: true, data: {token, user}}
      if (response.data.success && response.data.data.token) {
        const { token, user } = response.data.data;
        
        // Use token manager to store token safely
        const { setToken, debugToken } = await import('./utils/tokenManager');
        const success = setToken(token, user);
        
        if (success) {
          alert('Login success');
          
          // Debug token in development
          if (process.env.NODE_ENV === 'development') {
            debugToken(token);
          }
          
          if (onLogin) {
            onLogin(token);
          }
        } else {
          throw new Error('Failed to store authentication token');
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      alert(`Login failed: ${err.message}`);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="css-particles" />
        <div className="login-form glassmorphism glass-shimmer">
          <div className="shimmer-pulse" style={{ height: '32px', marginBottom: '2rem', borderRadius: '4px' }}></div>
          <div className="shimmer-pulse" style={{ height: '44px', marginBottom: '1rem', borderRadius: '8px' }}></div>
          <div className="shimmer-pulse" style={{ height: '44px', marginBottom: '1rem', borderRadius: '8px' }}></div>
          <div className="shimmer-pulse" style={{ height: '48px', marginBottom: '1rem', borderRadius: '12px' }}></div>
          <div className="shimmer-pulse" style={{ height: '20px', width: '60%', borderRadius: '4px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="css-particles" />
      <div className={`login-form glassmorphism glass-shimmer ${isVisible ? 'fade-in-up' : ''}`}>
        <h2 className="login-title">Trainer Login</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              className={`form-input ${errors.email ? 'border-red-600 error-pulse' : ''}`}
            />
            {errors.email && (
              <span className="text-red-600 text-sm fade-in">{errors.email}</span>
            )}
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
              className={`form-input ${errors.password ? 'border-red-600 error-pulse' : ''}`}
            />
            {errors.password && (
              <span className="text-red-600 text-sm fade-in">{errors.password}</span>
            )}
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="login-button hover-lift"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="register-link">
          Don&apos;t have an account?
          <button 
            onClick={onGoToRegister}
            className="register-button"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

LoginFallback.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onGoToRegister: PropTypes.func.isRequired
};

export default LoginFallback;

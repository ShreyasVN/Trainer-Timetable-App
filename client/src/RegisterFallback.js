// Fallback Register component with vanilla React and CSS animations
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { authService } from './api';
import './App.css';
import { validateForm } from './utils/formValidation';

function RegisterFallback({ onRegisterSuccess, onGoToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'trainer'
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
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateForm(formData, ['email', 'password', 'name', 'role']);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register(formData);
      const userData = response.data;
      alert(userData.message);

      // Notify parent component
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (err) {
      alert(`Registration failed: ${err.message}`);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="register-container">
        <div className="css-particles" />
        <div className="register-form glassmorphism glass-shimmer">
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
    <div className="register-container">
      <div className="css-particles" />
      <div className={`register-form glassmorphism glass-shimmer ${isVisible ? 'fade-in-up' : ''}`}>
        <h2 className="register-title">Register</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <input 
              type="text" 
              name="name"
              placeholder="Name" 
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
              className={`form-input ${errors.name ? 'border-red-600 error-pulse' : ''}`}
            />
            {errors.name && (
              <span className="text-red-600 text-sm fade-in">{errors.name}</span>
            )}
          </div>
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
          <div className="form-group">
            <select 
              name="role"
              onChange={handleInputChange} 
              value={formData.role}
              disabled={loading}
              className={`form-select ${errors.role ? 'border-red-600 error-pulse' : ''}`}
            >
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && (
              <span className="text-red-600 text-sm fade-in">{errors.role}</span>
            )}
          </div>
          <button type="submit" disabled={loading} className="register-button hover-lift">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="register-link">
          Already have an account? 
          <button 
            onClick={onGoToLogin}
            className="login-button"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

RegisterFallback.propTypes = {
  onRegisterSuccess: PropTypes.func.isRequired,
  onGoToLogin: PropTypes.func.isRequired
};

export default RegisterFallback;


// src/components/Login.js
import React from 'react';
import PropTypes from 'prop-types';
import { authService } from './api';
import './App.css';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import ParticleBackground from './components/ParticleBackground';
import { FormSkeleton } from './components/SkeletonLoader';

function Login({ onLogin, onGoToRegister }) {
  const validationSchema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authService.login(data);
      console.log('Login response:', response.data);
      
      // Handle the API response structure: {success: true, data: {token, user}}
      if (response.data.success && response.data.data.token) {
        const { token, user } = response.data.data;
        alert('Login success');

        // Save the token and notify parent component
        localStorage.setItem('token', token);
        if (onLogin) {
          onLogin(token);
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

  return (
    <div className="login-container">
      <ParticleBackground particleCount={100} useCSSFallback={true} />
      {loading ? (
        <FormSkeleton showTitle={false} />
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="login-form glassmorphism"
        >
          <h2 className="login-title">Trainer Login</h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                {...register('email')}
                disabled={loading}
                className={`form-input ${errors.email ? 'border-red-600' : ''}`}
              />
              {errors.email && (
                <span className="text-red-600 text-sm">{errors.email.message}</span>
              )}
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                {...register('password')}
                disabled={loading}
                className={`form-input ${errors.password ? 'border-red-600' : ''}`}
              />
              {errors.password && (
                <span className="text-red-600 text-sm">{errors.password.message}</span>
              )}
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="login-button"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="register-link">
            Don't have an account?
            <button 
              onClick={onGoToRegister}
              className="register-button"
            >
              Register
            </button>
          </p>
        </motion.div>
      )}
    </div>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func,
  onGoToRegister: PropTypes.func,
};

export default Login;

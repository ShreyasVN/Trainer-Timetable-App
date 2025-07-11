// src/components/Register.js
import React from 'react';
import { authService } from './api';
import './App.css';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import ParticleBackground from './components/ParticleBackground';
import { FormSkeleton } from './components/SkeletonLoader';

function Register({ onRegisterSuccess, onGoToLogin }) {
  const validationSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    role: yup.string().required('Role is required'),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      role: 'trainer',
    },
  });

  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authService.register(data);
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

  return (
    <div className="register-container">
      <ParticleBackground particleCount={100} useCSSFallback={true} />
      {loading ? (
        <FormSkeleton showTitle={false} />
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="register-form glassmorphism"
        >
          <h2 className="register-title">Register</h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Name" 
                {...register('name')}
                disabled={loading}
                className={`form-input ${errors.name ? 'border-red-600' : ''}`}
              />
              {errors.name && (
                <span className="text-red-600 text-sm">{errors.name.message}</span>
              )}
            </div>
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
            <div className="form-group">
              <select 
                {...register('role')}
                disabled={loading}
                className={`form-select ${errors.role ? 'border-red-600' : ''}`}
              >
                <option value="trainer">Trainer</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && (
                <span className="text-red-600 text-sm">{errors.role.message}</span>
              )}
            </div>
            <button type="submit" disabled={loading} className="register-button">
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
        </motion.div>
      )}
    </div>
  );
}

export default Register;

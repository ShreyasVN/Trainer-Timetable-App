import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from "framer-motion";
import api, { authService } from '../../api';
import { setToken, clearToken } from '../../utils/tokenManager';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  SparklesIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useForm, validators, createValidationSchema } from '../../hooks/useForm';
import { toast } from 'react-toastify';

const loginValidationSchema = createValidationSchema({
  email: [validators.required, validators.email],
  password: [validators.required, validators.minLength(6)]
});

const ModernLoginForm = ({ onLogin, onGoToRegister }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState('trainer'); // 'trainer' or 'admin'
  
  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm(
    { email: '', password: '' },
    loginValidationSchema
  );

  const handleLoginSubmit = async (formData) => {
    try {
      console.log('Sending login request with data:', formData, 'Mode:', loginMode);
      // Add login mode to the request data
      const loginData = { ...formData, loginMode };
      // Use authService for consistency with other API calls
      const response = await authService.login(loginData);

      console.log('Response status:', response.status);
      const data = response.data;
      console.log('Response data:', data);

      if (response.status === 200 && data.success) {
        const token = data.data.token;
        const user = data.data.user;
        
        console.log('Login successful, token:', token);
        console.log('Login successful, user:', user);
        
        // Store both token and user data
        const tokenStored = setToken(token, user);
        
        if (!tokenStored) {
          console.error('Failed to store token');
          toast.error('Failed to store authentication token. Please try again.', {
            position: "top-center",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
          return;
        }
        
        try {
          // Validate token via backend /api/auth/verify
          const verifyResponse = await api.get('/auth/verify');
          const authenticatedUser = verifyResponse.data.data.user;
          
          console.log('Token verified, user authenticated:', authenticatedUser);
          toast.success('🎉 Login successful!', {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
          console.log('Calling onLogin with token:', token);
          onLogin(token);
        } catch (verificationError) {
          console.error('Token verification failed:', verificationError);
          clearToken();
          toast.error('Token verification failed. Please log in again.', {
            position: "top-center",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
          return;
        }
      } else {
        console.error('Login failed with error:', data.error);
        toast.error(data.error || 'Login failed', {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    } catch (error) {
      // Error handling is now done by the API interceptor
      // Just show a simple toast with the error message from the interceptor
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.', {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Glass Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
            {/* Card glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl"></div>
            
            {/* Header */}
            <div className="text-center mb-8 relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
                className="relative w-20 h-20 mx-auto mb-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full animate-spin-slow"></div>
                <div className="absolute inset-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-bold text-white mb-2"
              >
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Welcome Back
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-gray-300 text-lg"
              >
                Sign in to your {loginMode} account
              </motion.p>
            </div>

            {/* Login Mode Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mb-6 relative z-10"
            >
              <div className="flex bg-white/5 backdrop-blur-sm rounded-xl p-1 border border-white/20">
                <button
                  type="button"
                  onClick={() => setLoginMode('trainer')}
                  className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg transition-all duration-300 ${
                    loginMode === 'trainer'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Trainer
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode('admin')}
                  className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg transition-all duration-300 ${
                    loginMode === 'admin'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <ShieldCheckIcon className="w-4 h-4 mr-2" />
                  Admin
                </button>
              </div>
            </motion.div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onSubmit={handleSubmit(handleLoginSubmit)}
              className="space-y-6 relative z-10"
            >
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-white font-medium text-sm">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 pl-12 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                  <EnvelopeIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-white font-medium text-sm">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pl-12 pr-12 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                  <LockClosedIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    className="rounded bg-white/5 border-white/20 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <span className="ml-2 text-sm">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  loginMode === 'admin'
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500'
                    : 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </motion.button>

              {/* Sign Up Link */}
              <div className="text-center">
                <span className="text-gray-300 text-sm">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={onGoToRegister}
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    Sign up
                  </button>
                </span>
              </div>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

ModernLoginForm.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onGoToRegister: PropTypes.func.isRequired,
};

export default ModernLoginForm;

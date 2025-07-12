import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Button, Input, Card } from '../ui';
import { useForm, validators, createValidationSchema } from '../../hooks/useForm';
import { toast } from 'react-toastify';
import { authService } from '../../api';

const registerValidationSchema = createValidationSchema({
  name: [validators.required],
  email: [validators.required, validators.email],
  password: [validators.required, validators.minLength(6)]
});

const RegisterForm = ({ onRegisterSuccess, onGoToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm(
    { name: '', email: '', password: '' },
    registerValidationSchema
  );

  const handleRegisterSubmit = async (formData) => {
    try {
      const response = await authService.register(formData);
      const data = response.data;

      if (response.status === 201 && data.success) {
        toast.success('Registration successful!');
        onRegisterSuccess();
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Network error. Please try again.';
      
      // Handle axios error response
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 p-4"
    >
      <Card className="w-full max-w-md" variant="elevated">
        <Card.Body className="p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
              className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <UserIcon className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">
              Sign up to become a trainer
            </p>
          </div>

          <form onSubmit={handleSubmit(handleRegisterSubmit)} className="space-y-6">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.name}
              placeholder="Enter your full name"
              leftIcon={<UserIcon className="h-5 w-5" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              placeholder="Enter your email"
              leftIcon={<EnvelopeIcon className="h-5 w-5" />}
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              placeholder="Create a password"
              leftIcon={<LockClosedIcon className="h-5 w-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              }
              required
            />

            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? 'Signing up...' : 'Sign Up'}
            </Button>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onGoToLogin}
                  className="text-teal-600 hover:text-teal-500 font-medium"
                >
                  Sign in
                </button>
              </span>
            </div>
          </form>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

RegisterForm.propTypes = {
  onRegisterSuccess: PropTypes.func.isRequired,
  onGoToLogin: PropTypes.func.isRequired,
};

export default RegisterForm;


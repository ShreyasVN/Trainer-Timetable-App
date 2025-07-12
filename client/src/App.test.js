import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the useAuth hook
jest.mock('./hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    isAuthenticated: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Mock components to avoid complex rendering
jest.mock('./components/auth/ModernLoginForm', () => {
  return function MockLoginForm() {
    return <div data-testid="login-form">Login Form</div>;
  };
});

jest.mock('./components/auth/RegisterForm', () => {
  return function MockRegisterForm() {
    return <div data-testid="register-form">Register Form</div>;
  };
});

jest.mock('./TestDashboard', () => {
  return function MockTestDashboard() {
    return <div data-testid="test-dashboard">Test Dashboard</div>;
  };
});

jest.mock('./TrainerDashboard', () => {
  return function MockTrainerDashboard() {
    return <div data-testid="trainer-dashboard">Trainer Dashboard</div>;
  };
});

jest.mock('./AdminDashboard', () => {
  return function MockAdminDashboard() {
    return <div data-testid="admin-dashboard">Admin Dashboard</div>;
  };
});

jest.mock('./components/ui', () => ({
  Loading: ({ text }) => <div data-testid="loading">{text}</div>,
}));

jest.mock('./context/ThemeContext', () => ({
  ThemeProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
}));

test('renders login form when not authenticated', async () => {
  render(<App />);
  
  await waitFor(() => {
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });
});


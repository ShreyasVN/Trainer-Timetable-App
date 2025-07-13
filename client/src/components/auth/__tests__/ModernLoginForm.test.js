import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import MockAdapter from 'axios-mock-adapter';
import { toast } from 'react-toastify';
import ModernLoginForm from '../ModernLoginForm';
import api from '../../../api/axios';

// Mock dependencies
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../../utils/tokenManager', () => ({
  setToken: jest.fn(),
  clearToken: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, whileTap, initial, animate, exit, transition, ...props }) => <div {...props}>{children}</div>,
    input: ({ children, whileFocus, whileHover, whileTap, initial, animate, exit, transition, ...props }) => <input {...props}>{children}</input>,
    button: ({ children, whileHover, whileTap, initial, animate, exit, transition, ...props }) => <button {...props}>{children}</button>,
    p: ({ children, whileHover, whileTap, initial, animate, exit, transition, ...props }) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

jest.mock('../../../api/axios', () => ({
  get: jest.fn(),
  defaults: {
    headers: {
      common: {},
    },
  },
}));

jest.mock('../../../api', () => ({
  authService: {
    login: jest.fn(),
  },
  default: {
    get: jest.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
  },
}));

const mockOnLogin = jest.fn();
const mockOnGoToRegister = jest.fn();

describe('ModernLoginForm', () => {
  let mockAxios;

  beforeEach(() => {
    mockAxios = new MockAdapter(api);
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  const renderComponent = (props = {}) => {
    return render(
      <ModernLoginForm
        onLogin={mockOnLogin}
        onGoToRegister={mockOnGoToRegister}
        {...props}
      />
    );
  };

  describe('Rendering', () => {
    test('renders login form with all essential elements', () => {
      renderComponent();

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your trainer account')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
      expect(screen.getByText('Trainer')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    test('renders password toggle button', () => {
      renderComponent();

      const passwordToggle = screen.getByRole('button', { name: /show password/i });
      expect(passwordToggle).toBeInTheDocument();
    });

    test('renders remember me checkbox', () => {
      renderComponent();

      const rememberMe = screen.getByLabelText('Remember me');
      expect(rememberMe).toBeInTheDocument();
    });

    test('renders forgot password link', () => {
      renderComponent();

      const forgotPassword = screen.getByText('Forgot password?');
      expect(forgotPassword).toBeInTheDocument();
    });

    test('renders sign up link', () => {
      renderComponent();

      const signUpLink = screen.getByText('Sign up');
      expect(signUpLink).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    test('allows user to type in email field', async () => {
      const user = userEvent.setup();
      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    test('allows user to type in password field', async () => {
      const user = userEvent.setup();
      renderComponent();

      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    test('toggles password visibility', async () => {
      const user = userEvent.setup();
      renderComponent();

      const passwordInput = screen.getByLabelText('Password');
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('switches between trainer and admin mode', async () => {
      const user = userEvent.setup();
      renderComponent();

      const adminButton = screen.getByText('Admin');
      const trainerButton = screen.getByText('Trainer');

      // Initial state should be trainer
      expect(screen.getByText('Sign in to your trainer account')).toBeInTheDocument();

      await user.click(adminButton);
      expect(screen.getByText('Sign in to your admin account')).toBeInTheDocument();

      await user.click(trainerButton);
      expect(screen.getByText('Sign in to your trainer account')).toBeInTheDocument();
    });

    test('calls onGoToRegister when sign up link is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const signUpLink = screen.getByText('Sign up');
      await user.click(signUpLink);

      expect(mockOnGoToRegister).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Validation', () => {
    test('shows validation error for empty email', async () => {
      const user = userEvent.setup();
      renderComponent();

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('This field is required')).toBeInTheDocument();
      });
    });

    test('shows validation error for invalid email format', async () => {
      const user = userEvent.setup();
      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    test('shows validation error for short password', async () => {
      const user = userEvent.setup();
      renderComponent();

      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, '123');

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    let authService;
    
    beforeEach(() => {
      authService = require('../../../api').authService;
    });

    test('submits form with valid data and calls onLogin on success', async () => {
      const user = userEvent.setup();
      const mockToken = 'mock-token';
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' };

      authService.login.mockResolvedValue({
        status: 200,
        data: {
          success: true,
          data: {
            token: mockToken,
            user: mockUser,
          },
        },
      });

      mockAxios.onGet('/auth/verify').reply(200, {
        success: true,
        data: {
          user: mockUser,
        },
      });

      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          loginMode: 'trainer',
        });
      });

      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledWith(mockToken);
      });

      expect(toast.success).toHaveBeenCalledWith('🎉 Login successful!', expect.any(Object));
    });

    test('handles login failure with error message', async () => {
      const user = userEvent.setup();

      authService.login.mockResolvedValue({
        status: 400,
        data: {
          success: false,
          error: 'Invalid credentials',
        },
      });

      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Invalid credentials', expect.any(Object));
      });

      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    test('handles network error', async () => {
      const user = userEvent.setup();

      authService.login.mockRejectedValue(new Error('Network error'));

      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error', expect.any(Object));
      });

      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    test('handles token verification failure', async () => {
      const user = userEvent.setup();
      const mockToken = 'mock-token';
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' };

      authService.login.mockResolvedValue({
        status: 200,
        data: {
          success: true,
          data: {
            token: mockToken,
            user: mockUser,
          },
        },
      });

      mockAxios.onGet('/auth/verify').reply(401, {
        success: false,
        error: 'Invalid token',
      });

      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Token verification failed. Please log in again.', expect.any(Object));
      });

      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    test('shows loading state during submission', async () => {
      const user = userEvent.setup();

      authService.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(screen.getByText('Signing in...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    test('submits with admin mode selected', async () => {
      const user = userEvent.setup();

      authService.login.mockResolvedValue({
        status: 200,
        data: {
          success: true,
          data: {
            token: 'mock-token',
            user: { id: 1, email: 'test@example.com', name: 'Test User' },
          },
        },
      });

      mockAxios.onGet('/auth/verify').reply(200, {
        success: true,
        data: {
          user: { id: 1, email: 'test@example.com', name: 'Test User' },
        },
      });

      renderComponent();

      const adminButton = screen.getByText('Admin');
      await user.click(adminButton);

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await user.type(emailInput, 'admin@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          email: 'admin@example.com',
          password: 'password123',
          loginMode: 'admin',
        });
      });
    });
  });
});

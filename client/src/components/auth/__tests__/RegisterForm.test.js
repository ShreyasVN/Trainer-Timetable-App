import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { toast } from 'react-toastify';
import RegisterForm from '../RegisterForm';

// Mock dependencies
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../../api/services', () => ({
  authService: {
    register: jest.fn(),
  },
}));

const mockOnRegisterSuccess = jest.fn();
const mockOnGoToLogin = jest.fn();

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <RegisterForm
        onRegisterSuccess={mockOnRegisterSuccess}
        onGoToLogin={mockOnGoToLogin}
        {...props}
      />
    );
  };

  describe('Rendering', () => {
    test('renders registration form with all essential elements', () => {
      renderComponent();

      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByText('Sign up to become a trainer')).toBeInTheDocument();
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    });

    test('renders password toggle button', () => {
      renderComponent();

      const passwordField = screen.getByLabelText('Password');
      expect(passwordField).toBeInTheDocument();
      expect(passwordField).toHaveAttribute('type', 'password');
    });

    test('renders sign in link', () => {
      renderComponent();

      const signInLink = screen.getByText('Sign in');
      expect(signInLink).toBeInTheDocument();
    });

    test('renders user icon', () => {
      renderComponent();

      const userIcon = document.querySelector('[data-testid="user-icon"]');
      expect(userIcon).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    test('allows user to type in name field', async () => {
      const user = userEvent.setup();
      renderComponent();

      const nameInput = screen.getByLabelText('Full Name');
      await user.type(nameInput, 'John Doe');

      expect(nameInput).toHaveValue('John Doe');
    });

    test('allows user to type in email field', async () => {
      const user = userEvent.setup();
      renderComponent();

      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'john@example.com');

      expect(emailInput).toHaveValue('john@example.com');
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
      const toggleButton = screen.getByRole('button', { name: '' }); // Password toggle button

      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('calls onGoToLogin when sign in link is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const signInLink = screen.getByText('Sign in');
      await user.click(signInLink);

      expect(mockOnGoToLogin).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Validation', () => {
    test('shows validation error for empty name', async () => {
      const user = userEvent.setup();
      renderComponent();

      const submitButton = screen.getByRole('button', { name: 'Sign Up' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('This field is required')).toBeInTheDocument();
      });
    });

    test('shows validation error for empty email', async () => {
      const user = userEvent.setup();
      renderComponent();

      const nameInput = screen.getByLabelText('Full Name');
      await user.type(nameInput, 'John Doe');

      const submitButton = screen.getByRole('button', { name: 'Sign Up' });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText('This field is required');
        expect(errorMessages).toHaveLength(2); // email and password
      });
    });

    test('shows validation error for invalid email format', async () => {
      const user = userEvent.setup();
      renderComponent();

      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email Address');
      
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: 'Sign Up' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    test('shows validation error for short password', async () => {
      const user = userEvent.setup();
      renderComponent();

      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, '123');

      const submitButton = screen.getByRole('button', { name: 'Sign Up' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    const { authService } = require('../../../api/services');

    test('submits form with valid data and calls onRegisterSuccess', async () => {
      const user = userEvent.setup();

      authService.register.mockResolvedValue({
        status: 201,
        data: {
          success: true,
          data: {
            user: { id: 1, name: 'John Doe', email: 'john@example.com' }
          }
        },
      });

      renderComponent();

      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign Up' });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        });
      });

      expect(toast.success).toHaveBeenCalledWith('Registration successful!');
      expect(mockOnRegisterSuccess).toHaveBeenCalledTimes(1);
    });

    test('handles registration failure with error message', async () => {
      const user = userEvent.setup();

      authService.register.mockResolvedValue({
        status: 400,
        data: {
          success: false,
          error: 'Email already exists',
        },
      });

      renderComponent();

      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign Up' });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Email already exists');
      });

      expect(mockOnRegisterSuccess).not.toHaveBeenCalled();
    });

    test('handles network error', async () => {
      const user = userEvent.setup();

      authService.register.mockRejectedValue(new Error('Network error'));

      renderComponent();

      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign Up' });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error');
      });

      expect(mockOnRegisterSuccess).not.toHaveBeenCalled();
    });

    test('handles axios error response', async () => {
      const user = userEvent.setup();

      const errorResponse = {
        response: {
          data: {
            error: 'User already exists'
          }
        }
      };

      authService.register.mockRejectedValue(errorResponse);

      renderComponent();

      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign Up' });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('User already exists');
      });

      expect(mockOnRegisterSuccess).not.toHaveBeenCalled();
    });

    test('shows loading state during submission', async () => {
      const user = userEvent.setup();

      authService.register.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      renderComponent();

      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign Up' });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(screen.getByText('Signing up...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    test('disables submit button during submission', async () => {
      const user = userEvent.setup();

      authService.register.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      renderComponent();

      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign Up' });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');

      expect(submitButton).not.toBeDisabled();

      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    test('form has proper labels and accessibility attributes', () => {
      renderComponent();

      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');

      expect(nameInput).toHaveAttribute('type', 'text');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');

      expect(nameInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });

    test('form can be submitted with keyboard', async () => {
      const user = userEvent.setup();

      authService.register.mockResolvedValue({
        status: 201,
        data: {
          success: true,
          data: {
            user: { id: 1, name: 'John Doe', email: 'john@example.com' }
          }
        },
      });

      renderComponent();

      const nameInput = screen.getByLabelText('Full Name');
      
      await user.type(nameInput, 'John Doe');
      await user.tab();
      await user.type(screen.getByLabelText('Email Address'), 'john@example.com');
      await user.tab();
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(authService.register).toHaveBeenCalled();
      });
    });
  });
});

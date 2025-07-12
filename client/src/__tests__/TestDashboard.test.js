import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TestDashboard from '../TestDashboard';

const mockOnLogout = jest.fn();
const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'trainer'
};

describe('TestDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <TestDashboard
        user={mockUser}
        onLogout={mockOnLogout}
        {...props}
      />
    );
  };

  describe('Rendering', () => {
    test('renders dashboard with user information', () => {
      renderComponent();

      expect(screen.getByText('Welcome, Test User!')).toBeInTheDocument();
      expect(screen.getByText('🎉 Login Successful!')).toBeInTheDocument();
      expect(screen.getByText('You have successfully logged in to the trainer dashboard.')).toBeInTheDocument();
    });

    test('renders user information section', () => {
      renderComponent();

      expect(screen.getByText('User Information')).toBeInTheDocument();
      expect(screen.getByText('Name:')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Email:')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Role:')).toBeInTheDocument();
      expect(screen.getByText('trainer')).toBeInTheDocument();
      expect(screen.getByText('ID:')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    test('renders logout button', () => {
      renderComponent();

      const logoutButton = screen.getByRole('button', { name: 'Logout' });
      expect(logoutButton).toBeInTheDocument();
    });

    test('renders navigation test section', () => {
      renderComponent();

      expect(screen.getByText('Navigation Test')).toBeInTheDocument();
      expect(screen.getByText('If you can see this page, the login navigation is working correctly!')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('calls onLogout when logout button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const logoutButton = screen.getByRole('button', { name: 'Logout' });
      await user.click(logoutButton);

      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });

    test('logout button has correct styling', () => {
      renderComponent();

      const logoutButton = screen.getByRole('button', { name: 'Logout' });
      expect(logoutButton).toHaveClass('px-4', 'py-2', 'bg-red-500', 'text-white', 'rounded');
    });
  });

  describe('Edge Cases', () => {
    test('handles user without name', () => {
      const userWithoutName = { ...mockUser, name: undefined };
      renderComponent({ user: userWithoutName });

      expect(screen.getByText('Welcome, User!')).toBeInTheDocument();
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    test('handles user without email', () => {
      const userWithoutEmail = { ...mockUser, email: undefined };
      renderComponent({ user: userWithoutEmail });

      // Should still render with N/A for missing email
      expect(screen.getAllByText('N/A')).toHaveLength(1);
    });

    test('handles user without role', () => {
      const userWithoutRole = { ...mockUser, role: undefined };
      renderComponent({ user: userWithoutRole });

      // Should still render with N/A for missing role
      expect(screen.getAllByText('N/A')).toHaveLength(1);
    });

    test('handles user without id', () => {
      const userWithoutId = { ...mockUser, id: undefined };
      renderComponent({ user: userWithoutId });

      // Should still render with N/A for missing id
      expect(screen.getAllByText('N/A')).toHaveLength(1);
    });

    test('handles null user', () => {
      renderComponent({ user: null });

      expect(screen.getByText('Welcome, User!')).toBeInTheDocument();
      expect(screen.getAllByText('N/A')).toHaveLength(4); // name, email, role, id
    });
  });

  describe('Styling and Layout', () => {
    test('has correct main container styling', () => {
      renderComponent();

      const mainContainer = screen.getByText('Welcome, Test User!').closest('div').closest('div');
      expect(mainContainer).toHaveClass('min-h-screen', 'bg-gray-100', 'p-8');
    });

    test('has correct card styling', () => {
      renderComponent();

      const cardContainer = screen.getByText('🎉 Login Successful!').closest('div').closest('div').closest('div');
      expect(cardContainer).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'p-6');
    });

    test('has correct grid layout', () => {
      renderComponent();

      const gridContainer = screen.getByText('🎉 Login Successful!').closest('div').parentElement;
      expect(gridContainer).toHaveClass('grid', 'md:grid-cols-2', 'gap-6');
    });

    test('success section has correct styling', () => {
      renderComponent();

      const successSection = screen.getByText('🎉 Login Successful!').closest('div');
      expect(successSection).toHaveClass('bg-green-50', 'p-4', 'rounded-lg');
    });

    test('user info section has correct styling', () => {
      renderComponent();

      const userInfoSection = screen.getByText('User Information').closest('div');
      expect(userInfoSection).toHaveClass('bg-blue-50', 'p-4', 'rounded-lg');
    });

    test('navigation test section has correct styling', () => {
      renderComponent();

      const navTestSection = screen.getByText('Navigation Test').closest('div');
      expect(navTestSection).toHaveClass('mt-6', 'p-4', 'bg-gray-50', 'rounded-lg');
    });
  });

  describe('Accessibility', () => {
    test('dashboard has proper heading structure', () => {
      renderComponent();

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Welcome, Test User!');

      const subHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(subHeadings).toHaveLength(2);
      expect(subHeadings[0]).toHaveTextContent('🎉 Login Successful!');
      expect(subHeadings[1]).toHaveTextContent('User Information');

      const tertiaryHeading = screen.getByRole('heading', { level: 3 });
      expect(tertiaryHeading).toHaveTextContent('Navigation Test');
    });

    test('logout button is accessible', () => {
      renderComponent();

      const logoutButton = screen.getByRole('button', { name: 'Logout' });
      expect(logoutButton).toBeInTheDocument();
      expect(logoutButton).toBeEnabled();
    });

    test('user information is properly structured', () => {
      renderComponent();

      const userInfoSection = screen.getByText('User Information').closest('div');
      const strongElements = userInfoSection.querySelectorAll('strong');
      
      expect(strongElements).toHaveLength(4);
      expect(strongElements[0]).toHaveTextContent('Name:');
      expect(strongElements[1]).toHaveTextContent('Email:');
      expect(strongElements[2]).toHaveTextContent('Role:');
      expect(strongElements[3]).toHaveTextContent('ID:');
    });
  });

  describe('PropTypes Validation', () => {
    test('renders without errors with valid props', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderComponent();
      
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('user prop is required', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<TestDashboard onLogout={mockOnLogout} />);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: Failed prop type')
      );
      consoleSpy.mockRestore();
    });

    test('onLogout prop is required', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<TestDashboard user={mockUser} />);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: Failed prop type')
      );
      consoleSpy.mockRestore();
    });
  });
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TrainerDashboard from '../TrainerDashboard';

// Mock dependencies
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

jest.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    toggleTheme: jest.fn(),
  }),
}));

jest.mock('../api/services', () => ({
  sessionService: {
    getAllSessions: jest.fn(),
    updateAttendance: jest.fn(),
    createSession: jest.fn(),
  },
  busySlotService: {
    getAllBusySlots: jest.fn(),
    createBusySlot: jest.fn(),
  },
  userService: {
    updateProfile: jest.fn(),
  },
}));

// Mock FullCalendar
jest.mock('@fullcalendar/react', () => {
  return function MockFullCalendar(props) {
    return <div data-testid="fullcalendar" {...props} />;
  };
});

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Bar: ({ data }) => <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)} />,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
    tr: ({ children, ...props }) => <tr {...props}>{children}</tr>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

const mockOnLogout = jest.fn();
const mockUser = {
  id: 1,
  name: 'Test Trainer',
  email: 'trainer@example.com',
  role: 'trainer'
};

const mockSessions = [
  {
    id: 1,
    course_name: 'React Basics',
    date: '2024-01-15',
    time: '10:00',
    location: 'Room A',
    attended: true,
    approval_status: 'approved',
  },
  {
    id: 2,
    course_name: 'JavaScript Advanced',
    date: '2024-01-16',
    time: '14:00',
    location: 'Room B',
    attended: false,
    approval_status: 'pending',
  },
];

const mockBusySlots = [
  {
    id: 1,
    start_time: '2024-01-15T09:00:00',
    end_time: '2024-01-15T10:00:00',
    reason: 'Meeting',
  },
];

describe('TrainerDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API responses
    const { sessionService, busySlotService } = require('../api/services');
    sessionService.getAllSessions.mockResolvedValue({
      data: mockSessions,
    });
    busySlotService.getAllBusySlots.mockResolvedValue({
      data: mockBusySlots,
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <TrainerDashboard
        user={mockUser}
        onLogout={mockOnLogout}
        {...props}
      />
    );
  };

  describe('Loading State', () => {
    test('shows loading spinner initially', () => {
      const { sessionService } = require('../api/services');
      sessionService.getAllSessions.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderComponent();
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Dashboard Tab', () => {
    test('renders dashboard content by default', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Total Sessions')).toBeInTheDocument();
        expect(screen.getByText('Attendance')).toBeInTheDocument();
        expect(screen.getByText('Busy Hours Today')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
      });
    });

    test('displays session statistics', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Total sessions
        expect(screen.getByText('50%')).toBeInTheDocument(); // Attendance percentage
      });
    });

    test('displays today\'s sessions', async () => {
      const todayDate = new Date().toISOString().slice(0, 10);
      const todaySession = {
        ...mockSessions[0],
        date: todayDate,
      };
      
      const { sessionService } = require('../api/services');
      sessionService.getAllSessions.mockResolvedValue({
        data: [todaySession],
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Today\'s Sessions')).toBeInTheDocument();
        expect(screen.getByText('React Basics')).toBeInTheDocument();
      });
    });

    test('shows no sessions message when no sessions today', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('No sessions today.')).toBeInTheDocument();
      });
    });

    test('renders analytics chart', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      });
    });
  });

  describe('Calendar Tab', () => {
    test('renders calendar when tab is selected', async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Calendar')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Calendar'));

      await waitFor(() => {
        expect(screen.getByText('Your Timetable')).toBeInTheDocument();
        expect(screen.getByTestId('fullcalendar')).toBeInTheDocument();
      });
    });
  });

  describe('Sessions Tab', () => {
    test('renders sessions table when tab is selected', async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Sessions')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Sessions'));

      await waitFor(() => {
        expect(screen.getByText('Session List')).toBeInTheDocument();
        expect(screen.getByText('React Basics')).toBeInTheDocument();
        expect(screen.getByText('JavaScript Advanced')).toBeInTheDocument();
      });
    });

    test('allows searching sessions', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByText('Sessions'));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search sessions...')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search sessions...');
      await user.type(searchInput, 'React');

      // The search functionality should filter results
      expect(searchInput).toHaveValue('React');
    });

    test('allows toggling attendance', async () => {
      const user = userEvent.setup();
      const { sessionService } = require('../api/services');
      sessionService.updateAttendance.mockResolvedValue({});

      renderComponent();

      await user.click(screen.getByText('Sessions'));

      await waitFor(() => {
        expect(screen.getByText('Toggle Attendance')).toBeInTheDocument();
      });

      const toggleButton = screen.getAllByText('Toggle Attendance')[0];
      await user.click(toggleButton);

      await waitFor(() => {
        expect(sessionService.updateAttendance).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Profile Tab', () => {
    test('renders profile information when tab is selected', async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Profile'));

      await waitFor(() => {
        expect(screen.getByText('Profile Settings')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Trainer')).toBeInTheDocument();
        expect(screen.getByDisplayValue('trainer@example.com')).toBeInTheDocument();
      });
    });

    test('allows opening profile edit modal', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByText('Profile'));

      await waitFor(() => {
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Edit Profile'));

      await waitFor(() => {
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      });
    });
  });

  describe('Settings Tab', () => {
    test('renders settings when tab is selected', async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Settings'));

      await waitFor(() => {
        expect(screen.getByText('Dark Mode')).toBeInTheDocument();
        expect(screen.getByText('Export Data')).toBeInTheDocument();
        expect(screen.getByText('CSV')).toBeInTheDocument();
        expect(screen.getByText('PDF')).toBeInTheDocument();
      });
    });

    test('allows logout from settings', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByText('Settings'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Logout' }));

      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('FAB Menu', () => {
    test('renders FAB menu button', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Open FAB menu' })).toBeInTheDocument();
      });
    });

    test('opens FAB menu on click', async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        const fabButton = screen.getByRole('button', { name: 'Open FAB menu' });
        expect(fabButton).toBeInTheDocument();
      });

      const fabButton = screen.getByRole('button', { name: 'Open FAB menu' });
      await user.click(fabButton);

      await waitFor(() => {
        expect(screen.getByText('Add Busy Slot')).toBeInTheDocument();
        expect(screen.getByText('Schedule Class')).toBeInTheDocument();
      });
    });
  });

  describe('Modals', () => {
    test('opens busy slot modal', async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        const fabButton = screen.getByRole('button', { name: 'Open FAB menu' });
        expect(fabButton).toBeInTheDocument();
      });

      // Open FAB menu
      const fabButton = screen.getByRole('button', { name: 'Open FAB menu' });
      await user.click(fabButton);

      // Click Add Busy Slot
      await user.click(screen.getByText('Add Busy Slot'));

      await waitFor(() => {
        expect(screen.getByText('Add Busy Slot')).toBeInTheDocument();
      });
    });

    test('opens schedule class modal', async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        const fabButton = screen.getByRole('button', { name: 'Open FAB menu' });
        expect(fabButton).toBeInTheDocument();
      });

      // Open FAB menu
      const fabButton = screen.getByRole('button', { name: 'Open FAB menu' });
      await user.click(fabButton);

      // Click Schedule Class
      await user.click(screen.getByText('Schedule Class'));

      await waitFor(() => {
        expect(screen.getByText('Schedule Class')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles session loading error', async () => {
      const { sessionService } = require('../api/services');
      sessionService.getAllSessions.mockRejectedValue(new Error('Failed to load sessions'));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Failed to load sessions/)).toBeInTheDocument();
      });
    });

    test('handles busy slots loading error', async () => {
      const { busySlotService } = require('../api/services');
      busySlotService.getAllBusySlots.mockRejectedValue(new Error('Failed to load busy slots'));

      renderComponent();

      await waitFor(() => {
        // Should still render dashboard without busy slots
        expect(screen.getByText('Total Sessions')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    test('toggles sidebar on mobile', async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Toggle sidebar' })).toBeInTheDocument();
      });

      const toggleButton = screen.getByRole('button', { name: 'Toggle sidebar' });
      await user.click(toggleButton);

      // Sidebar should be visible
      expect(screen.getByText('Trainer Portal')).toBeInTheDocument();
    });

    test('switches tabs correctly', async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Total Sessions')).toBeInTheDocument();
      });

      // Click Calendar tab
      await user.click(screen.getByText('Calendar'));

      await waitFor(() => {
        expect(screen.getByText('Your Timetable')).toBeInTheDocument();
      });

      // Click Sessions tab
      await user.click(screen.getByText('Sessions'));

      await waitFor(() => {
        expect(screen.getByText('Session List')).toBeInTheDocument();
      });

      // Click Dashboard tab
      await user.click(screen.getByText('Dashboard'));

      await waitFor(() => {
        expect(screen.getByText('Total Sessions')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Test tab navigation
      await user.tab();
      expect(screen.getByText('Dashboard')).toHaveFocus();

      await user.tab();
      expect(screen.getByText('Calendar')).toHaveFocus();
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
      
      render(<TrainerDashboard onLogout={mockOnLogout} />);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: Failed prop type')
      );
      consoleSpy.mockRestore();
    });

    test('onLogout prop is required', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<TrainerDashboard user={mockUser} />);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: Failed prop type')
      );
      consoleSpy.mockRestore();
    });
  });
});

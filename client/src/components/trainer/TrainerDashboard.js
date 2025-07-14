import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import { sessionService, busySlotService, userService } from '../../api';

// Import sub-components
import Navigation from './Navigation';
import FABMenu from './FABMenu';
import DashboardOverview from './DashboardOverview';
import CalendarView from './CalendarView';
import SessionsView from './SessionsView';
import ProfileSettings from './ProfileSettings';
import AppSettings from './AppSettings';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorBoundary from '../ui/ErrorBoundary';

// Import modals
import ProfileModal from './modals/ProfileModal';
import BusySlotModal from './modals/BusySlotModal';
import ScheduleClassModal from './modals/ScheduleClassModal';

// Custom hooks
import useTrainerData from '../../hooks/useTrainerData';
import useNotifications from '../../hooks/useNotifications';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const TrainerDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFABOpen, setIsFABOpen] = useState(false);
  
  // Modal states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [busyModalOpen, setBusyModalOpen] = useState(false);
  const [classModalOpen, setClassModalOpen] = useState(false);

  // Custom hooks
  const {
    sessions,
    busySlots,
    loading,
    error,
    refetchSessions,
    refetchBusySlots,
    updateSession,
    addBusySlot,
    scheduleClass
  } = useTrainerData(user.id);

  const { notifications } = useNotifications(user.id);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+d': () => setActiveTab('dashboard'),
    'ctrl+c': () => setActiveTab('calendar'),
    'ctrl+s': () => setActiveTab('sessions'),
    'ctrl+p': () => setActiveTab('profile'),
    'ctrl+shift+s': () => setActiveTab('settings'),
    'ctrl+n': () => setIsFABOpen(true),
    'escape': () => {
      setIsFABOpen(false);
      setProfileModalOpen(false);
      setBusyModalOpen(false);
      setClassModalOpen(false);
    }
  });

  // Memoized calculations
  const dashboardStats = useMemo(() => {
    const totalSessions = sessions.length;
    const attendedSessions = sessions.filter(s => s.attended).length;
    const attendancePercentage = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;
    
    const today = new Date().toISOString().slice(0, 10);
    const todaySessions = sessions.filter(s => s.date === today);
    const busyHoursToday = todaySessions.length; // Simplified calculation
    
    return {
      totalSessions,
      attendedSessions,
      attendancePercentage,
      todaySessions,
      busyHoursToday
    };
  }, [sessions]);

  // Calendar events (sessions + busy slots)
  const calendarEvents = useMemo(() => {
    const sessionEvents = sessions.map(session => ({
      id: session.id,
      title: `${session.course_name} (${session.location})`,
      start: `${session.date}T${session.time}`,
      course: session.course_name,
      date: session.date,
      time: session.time,
      location: session.location,
      color: getSessionColor(session),
      type: 'session',
      extendedProps: {
        attended: session.attended,
        approval_status: session.approval_status,
        created_by_trainer: session.created_by_trainer
      }
    }));

    const busyEvents = busySlots.map(slot => ({
      id: `busy-${slot.id}`,
      title: slot.reason ? `Busy: ${slot.reason}` : 'Busy',
      start: slot.start_time,
      end: slot.end_time,
      color: '#f87171',
      type: 'busy'
    }));

    return [...sessionEvents, ...busyEvents];
  }, [sessions, busySlots]);

  // Helper function to get session color
  const getSessionColor = (session) => {
    if (session.approval_status === 'pending') return '#fbbf24';
    if (session.approval_status === 'rejected') return '#f87171';
    return session.attended ? '#4caf50' : '#3f51b5';
  };

  // Event handlers
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false); // Close sidebar on mobile
  }, []);

  const handleToggleAttendance = useCallback(async (sessionId) => {
    try {
      await updateSession(sessionId, { attended: !sessions.find(s => s.id === sessionId)?.attended });
      toast.success('Attendance updated successfully');
    } catch (error) {
      toast.error('Failed to update attendance');
    }
  }, [sessions, updateSession]);

  const handleSaveProfile = useCallback(async (formData) => {
    try {
      await userService.updateProfile(user.id, formData);
      toast.success('Profile updated successfully');
      setProfileModalOpen(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  }, [user.id]);

  const handleAddBusySlot = useCallback(async (slotData) => {
    try {
      await addBusySlot(slotData);
      toast.success('Busy slot added successfully');
      setBusyModalOpen(false);
    } catch (error) {
      toast.error('Failed to add busy slot');
    }
  }, [addBusySlot]);

  const handleScheduleClass = useCallback(async (classData) => {
    try {
      await scheduleClass(classData);
      toast.success('Class scheduled successfully (pending approval)');
      setClassModalOpen(false);
    } catch (error) {
      toast.error('Failed to schedule class');
    }
  }, [scheduleClass]);

  // Render methods
  const renderContent = () => {
    const contentProps = {
      user,
      sessions,
      busySlots,
      calendarEvents,
      dashboardStats,
      onToggleAttendance: handleToggleAttendance,
      onRefresh: refetchSessions
    };

    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview {...contentProps} />;
      case 'calendar':
        return <CalendarView {...contentProps} />;
      case 'sessions':
        return <SessionsView {...contentProps} />;
      case 'profile':
        return <ProfileSettings {...contentProps} onEditProfile={() => setProfileModalOpen(true)} />;
      case 'settings':
        return <AppSettings {...contentProps} onLogout={onLogout} />;
      default:
        return <DashboardOverview {...contentProps} />;
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading trainer dashboard..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-blue-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <div className="bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen ">
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          
          <div className="flex">
            <Navigation
              activeTab={activeTab}
              setActiveTab={handleTabChange}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              notifications={notifications}
            />
            
            <main className="flex-1 lg:ml-0" role="main">
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </div>

          {/* FAB Menu */}
          <FABMenu
            isOpen={isFABOpen}
            setIsOpen={setIsFABOpen}
            setBusyModalOpen={setBusyModalOpen}
            setClassModalOpen={setClassModalOpen}
          />

          {/* Modals */}
          <ProfileModal
            isOpen={profileModalOpen}
            onClose={() => setProfileModalOpen(false)}
            onSave={handleSaveProfile}
            userData={user}
          />
          <BusySlotModal
            isOpen={busyModalOpen}
            onClose={() => setBusyModalOpen(false)}
            onSave={handleAddBusySlot}
          />
          <ScheduleClassModal
            isOpen={classModalOpen}
            onClose={() => setClassModalOpen(false)}
            onSave={handleScheduleClass}
            defaultTrainerId={user.id}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

TrainerDashboard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired
  }).isRequired,
  onLogout: PropTypes.func.isRequired
};

export default TrainerDashboard;

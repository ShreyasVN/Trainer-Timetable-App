// client/src/TrainerDashboard.js
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { sessionService, userService, busySlotService } from './api';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/calendarStyles.css';  // ✅ Correct
import Modal from 'react-modal';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import './styles/dashboardStyles.css';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

// Framer Motion imports
import { motion, AnimatePresence } from 'framer-motion';

// Heroicons imports
import {
  CalendarDaysIcon,
  ClockIcon,
  ChartBarIcon,
  UserIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  PlusIcon,
  Bars3Icon,
  CalendarIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

// Custom hook for theme context
import { useTheme } from './useTheme';

function ProfileModal({ isOpen, onClose, onSave, userData }) {
  const [form, setForm] = useState(userData || { name: '', email: '', password: '' });
  useEffect(() => { setForm(userData || { name: '', email: '', password: '' }); }, [userData, isOpen]);
  if (!isOpen) return null;
  const handleChange = e => { const { name, value } = e.target; setForm(f => ({ ...f, [name]: value })); };
  const handleSubmit = e => { e.preventDefault(); onSave(form); };
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} ariaHideApp={false} className="modal" overlayClassName="modal-overlay">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full border p-2 rounded" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full border p-2 rounded" required type="email" />
        <input name="password" value={form.password} onChange={handleChange} placeholder="New Password (leave blank to keep current)" className="w-full border p-2 rounded" type="password" minLength={0} />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          <button type="submit" className="bg-indigo-500 text-white px-4 py-2 rounded">Save</button>
        </div>
      </form>
    </Modal>
  );
}

ProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  userData: PropTypes.object.isRequired
};

function BusySlotModal({ isOpen, onClose, onSave }) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setStart('');
    setEnd('');
    setReason('');
    setError('');
    setLoading(false);
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!start || !end) {
      setError('Start and end time are required.');
      return;
    }
    if (new Date(end) <= new Date(start)) {
      setError('End time must be after start time.');
      return;
    }
    setLoading(true);
    try {
      await onSave({ start, end, reason });
    } catch (err) {
      setError(err.message || 'Failed to add busy slot');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} ariaHideApp={false} className="modal" overlayClassName="modal-overlay">
      <h2 className="text-xl font-bold mb-4">Add Busy Slot</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} className="w-full border p-2 rounded" required />
        <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} className="w-full border p-2 rounded" required />
        <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason (optional)" className="w-full border p-2 rounded" />
        {error && <div className="text-red-500 text-sm font-semibold">{error}</div>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          <button type="submit" className="bg-indigo-500 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

BusySlotModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

function ScheduleClassModal({ isOpen, onClose, onSave, defaultTrainerId }) {
  const [form, setForm] = useState({ course_name: '', date: '', time: '', location: '', duration: 60 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => { setForm({ course_name: '', date: '', time: '', location: '', duration: 60 }); setError(''); setLoading(false); }, [isOpen]);
  if (!isOpen) return null;
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.course_name || !form.date || !form.time || !form.location || !form.duration) {
      setError('All fields are required.');
      return;
    }
    if (isNaN(form.duration) || form.duration <= 0) {
      setError('Duration must be a positive number.');
      return;
    }
    setLoading(true);
    try {
      await onSave({ ...form, trainer_id: defaultTrainerId });
    } catch (err) {
      setError(err.message || 'Failed to schedule class');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} ariaHideApp={false} className="modal" overlayClassName="modal-overlay">
      <h2 className="text-xl font-bold mb-4">Schedule Class</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="course_name" value={form.course_name} onChange={handleChange} placeholder="Course Name" className="w-full border p-2 rounded" required />
        <input name="date" type="date" value={form.date} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="time" type="time" value={form.time} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="w-full border p-2 rounded" required />
        <input name="duration" type="number" min="1" value={form.duration} onChange={handleChange} className="w-full border p-2 rounded" required />
        {error && <div className="text-red-500 text-sm font-semibold">{error}</div>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          <button type="submit" className="bg-indigo-500 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

ScheduleClassModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  defaultTrainerId: PropTypes.number.isRequired
};

// Navigation Component
function Navigation({ activeTab, setActiveTab, isDark, toggleTheme, isSidebarOpen, setIsSidebarOpen }) {
  Navigation.propTypes = {
    activeTab: PropTypes.string.isRequired,
    setActiveTab: PropTypes.func.isRequired,
    isDark: PropTypes.bool.isRequired,
    toggleTheme: PropTypes.func.isRequired,
    isSidebarOpen: PropTypes.bool.isRequired,
    setIsSidebarOpen: PropTypes.func.isRequired
  };
const navItems = [ // eslint-disable-line no-unused-vars
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'calendar', label: 'Calendar', icon: CalendarDaysIcon },
    { id: 'sessions', label: 'Sessions', icon: ClipboardDocumentListIcon },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-900 shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Trainer Dashboard</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isSidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl z-50 lg:relative lg:translate-x-0"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Trainer Portal</h2>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Theme Toggle - Desktop */}
        <div className="hidden lg:block absolute bottom-4 left-4 right-4">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </motion.div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        />
      )}
    </>
  );
}

// FAB Menu Component
function FABMenu({ isOpen, setIsOpen, setBusyModalOpen, setClassModalOpen }) {
  const [ripples, setRipples] = useState([]);
  const createRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      x,
      y,
      size,
      id: Date.now(),
    };
    
    setRipples((prev) => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
    }, 600);
  };

  const handleMainFABClick = (e) => {
    createRipple(e);
    setIsOpen(!isOpen);
  };

  const fabItems = [
    {
      label: 'Add Busy Slot',
      icon: ClockIcon,
      onClick: () => {
        setBusyModalOpen(true);
        setIsOpen(false);
      },
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      label: 'Schedule Class',
      icon: CalendarIcon,
      onClick: () => {
        setClassModalOpen(true);
        setIsOpen(false);
      },
      color: 'bg-green-500 hover:bg-green-600',
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {fabItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={item.onClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-full ${item.color} text-white shadow-lg hover:shadow-xl transition-all`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleMainFABClick}
        className="relative overflow-hidden w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
      >
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute bg-white rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        ))}
        
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <PlusIcon className="h-6 w-6" />
        </motion.div>
      </motion.button>
    </div>
  );
}

FABMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  setBusyModalOpen: PropTypes.func.isRequired,
  setClassModalOpen: PropTypes.func.isRequired
};

function TrainerDashboard({ user, onLogout }) {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFABOpen, setIsFABOpen] = useState(false);
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage] = useState(1);
  const rowsPerPage = 5;
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({ name: user.name || '', email: user.email || '', password: '' });
  const [busyStatus, setBusyStatus] = useState(() => {
    // Default: available, but persist in localStorage
    const stored = localStorage.getItem('busyStatus');
    return stored ? JSON.parse(stored) : { today: false };
  });
  const [busySlots, setBusySlots] = useState([]);
  const [busyModalOpen, setBusyModalOpen] = useState(false);
  const [classModalOpen, setClassModalOpen] = useState(false);

  // Make fetchSessions available for refresh
  const fetchSessions = async () => {
    try {
      const res = await sessionService.getAllSessions();
      const filtered = res.data.filter((s) => s.trainer_id === user.id);
      const mapped = filtered.map((s) => ({
        id: s.id,
        title: `${s.course_name} (${s.location})`,
        start: `${s.date}T${s.time}`,
        course: s.course_name,
        date: s.date,
        time: s.time,
        location: s.location,
        color: s.attended ? '#4caf50' : '#3f51b5',
        extendedProps: { attended: s.attended, approval_status: s.approval_status, created_by_trainer: s.created_by_trainer }
      }));
      setEvents(mapped);
      const attendanceMap = Object.fromEntries(
        filtered.map((s) => [s.id, s.attended])
      );
      setAttendance(attendanceMap);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      let message = 'Failed to load sessions';
      if (err.response && err.response.data && err.response.data.error) {
        message += `: ${err.response.data.error}`;
      }
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Replace useEffect for fetching sessions to use fetchSessions
  useEffect(() => {
    fetchSessions();
  }, [user]);

  useEffect(() => {
    const now = new Date();
    const reminderWindow = new Date(now.getTime() + 30 * 60 * 1000); // next 30 minutes
    const upcomingSessions = events.filter(event => {
      const sessionTime = new Date(event.start);
      return sessionTime > now && sessionTime <= reminderWindow;
    });
    if (upcomingSessions.length > 0) {
      toast.info(`You have ${upcomingSessions.length} session(s) starting soon.`);
    }
  }, [events]);

  const toggleAttendance = async (sessionId) => {
    try {
      await sessionService.updateAttendance(sessionId);
      setAttendance((prev) => ({ ...prev, [sessionId]: !prev[sessionId] }));
      toast.success('Attendance status updated');
    } catch (err) {
      console.error('Failed to update attendance', err);
      toast.error('Could not update attendance');
    }
  };

  const exportCSV = () => {
    const csv = Papa.unparse(events.map(e => ({
      Course: e.course,
      Date: e.date,
      Time: e.time,
      Location: e.location,
      Attendance: attendance[e.id] ? 'Attended' : 'Not Attended'
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'trainer_sessions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Trainer Sessions', 14, 16);
    doc.autoTable({
      startY: 20,
      head: [['Course', 'Date', 'Time', 'Location', 'Attendance']],
      body: events.map(e => [
        e.course,
        e.date,
        e.time,
        e.location,
        attendance[e.id] ? 'Attended' : 'Not Attended'
      ])
    });
    doc.save('trainer_sessions.pdf');
  };

  const totalSessions = events.length;
  const attendedSessions = Object.values(attendance).filter(Boolean).length;
  const attendancePercentage = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;

  // Calculate busy hours
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const busyEventsToday = events.filter(e => e.date === todayStr);
  const busyHoursToday = busyEventsToday.reduce((sum) => sum + 1, 0); // 1 hour per event

  // Busy toggle handler
  const handleBusyToggle = () => {
    const newStatus = { ...busyStatus, today: !busyStatus.today };
    setBusyStatus(newStatus);
    localStorage.setItem('busyStatus', JSON.stringify(newStatus));
  };



  // Handle sessions and busy slots merging for calendar
  const calendarEvents = [
    ...events.map(e => ({
      ...e,
      color: e.extendedProps?.approval_status === 'pending' ? '#fbbf24' : (e.extendedProps?.approval_status === 'rejected' ? '#f87171' : '#4caf50'),
      title: `${e.title} (${e.extendedProps?.approval_status || 'approved'})\n${e.date} ${e.time}`,
      type: 'session',
    })),
    ...busySlots.map(b => ({
      id: `busy-${b.id}`,
      title: b.reason ? `Busy: ${b.reason}` : 'Busy',
      start: b.start_time,
      end: b.end_time,
      color: '#f87171',
      type: 'busy',
    }))
  ];

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedEvents = filteredEvents.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSaveProfile = async (form) => {
    try {
      await userService.updateProfile(form);
      toast.success('Profile updated successfully');
      setProfileModalOpen(false);
      setProfileData({ ...profileData, ...form, password: '' });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  // Fetch busy slots
  useEffect(() => {
    const fetchBusySlots = async () => {
      try {
        const res = await busySlotService.getBusySlots();
        setBusySlots(res.data);
      } catch (err) {
        toast.error('Failed to load busy slots');
      }
    };
    fetchBusySlots();
  }, [user]);

  // Add busy slot
  const handleAddBusySlot = async ({ start, end, reason }) => {
    try {
      await busySlotService.createBusySlot({ start_time: start, end_time: end, reason });
      toast.success('Busy slot added');
      setBusyModalOpen(false);
      // Refresh busy slots
      const res = await busySlotService.getBusySlots();
      setBusySlots(res.data);
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to add busy slot');
    }
  };
  // Schedule class
  const handleScheduleClass = async (form) => {
    try {
      await sessionService.createSession({ ...form, created_by_trainer: true });
      toast.success('Class scheduled (pending approval)');
      setClassModalOpen(false);
      // Refresh sessions so the new class appears in the calendar
      fetchSessions();
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to schedule class');
    }
  };


  // Analytics data
  const analyticsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sessions',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: '#6366f1',
      },
      {
        label: 'Busy Slots',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: '#f87171',
      }
    ]
  };
  events.forEach(e => {
    const d = new Date(e.date);
    analyticsData.datasets[0].data[d.getDay()]++;
  });
  busySlots.forEach(b => {
    const d = new Date(b.start_time);
    analyticsData.datasets[1].data[d.getDay()]++;
  });

  function getTodayAndUpcomingSessions(events) {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const upcomingLimit = new Date(today);
    upcomingLimit.setDate(today.getDate() + 7);
    const todaySessions = events.filter(e => e.date === todayStr);
    const upcomingSessions = events.filter(e => {
      const d = new Date(e.date);
      return d > today && d <= upcomingLimit;
    });
    return { todaySessions, upcomingSessions };
  }

  const { todaySessions } = getTodayAndUpcomingSessions(events);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'calendar':
        return renderCalendar();
      case 'sessions':
        return renderSessions();
      case 'profile':
        return renderProfile();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <motion.div
      key="dashboard"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          variants={cardVariants}
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{events.length}</p>
            </div>
            <CalendarDaysIcon className="h-8 w-8 text-indigo-600" />
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Attendance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{attendancePercentage}%</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Busy Hours Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{busyHoursToday}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-orange-600" />
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Status</p>
              <p className={`text-2xl font-bold ${busyStatus.today ? 'text-red-600' : 'text-green-600'}`}>
                {busyStatus.today ? 'Busy' : 'Available'}
              </p>
            </div>
            <button
              onClick={handleBusyToggle}
              className={`h-8 w-8 rounded-full ${busyStatus.today ? 'bg-red-600' : 'bg-green-600'}`}
            />
          </div>
        </motion.div>
      </div>

      {/* Today's Sessions */}
      <motion.div
        variants={cardVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today&apos;s Sessions</h3>
        {todaySessions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No sessions today.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todaySessions.map((session) => (
              <motion.div
                key={session.id}
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg"
              >
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">{session.course}</h4>
                <p className="text-sm text-indigo-600 dark:text-indigo-300">{session.time} - {session.location}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Analytics */}
      <motion.div
        variants={cardVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Analytics</h3>
        <Bar data={analyticsData} />
      </motion.div>
    </motion.div>
  );

  const renderCalendar = () => (
    <motion.div
      key="calendar"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Timetable</h3>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
        initialView="timeGridWeek"
        events={calendarEvents}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listWeek'
        }}
        eventContent={arg => (
          <div style={{
            background: arg.event.extendedProps?.type === 'busy' ? 'linear-gradient(90deg,#f87171 0%,#fbbf24 100%)' : (arg.event.extendedProps?.approval_status === 'pending' ? '#fbbf24' : (arg.event.extendedProps?.approval_status === 'rejected' ? '#f87171' : '#4caf50')),
            color: '#fff',
            borderRadius: 8,
            padding: 4,
            fontWeight: 600,
            boxShadow: '0 2px 8px #fbbf2440',
            border: (new Date(arg.event.start).toDateString() === new Date().toDateString()) ? '2.5px solid #6366f1' : '',
            outline: (new Date(arg.event.start) > new Date() && new Date(arg.event.start) <= new Date(Date.now() + 7*24*60*60*1000)) ? '2.5px dashed #a5b4fc' : ''
          }}>
            {arg.event.title}
          </div>
        )}
      />
    </motion.div>
  );

  const renderSessions = () => (
    <motion.div
      key="sessions"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Session List</h3>
      <input
        type="text"
        placeholder="Search sessions..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-3 text-gray-900 dark:text-white">Course</th>
              <th className="text-left p-3 text-gray-900 dark:text-white">Date</th>
              <th className="text-left p-3 text-gray-900 dark:text-white">Time</th>
              <th className="text-left p-3 text-gray-900 dark:text-white">Location</th>
              <th className="text-left p-3 text-gray-900 dark:text-white">Attendance</th>
              <th className="text-left p-3 text-gray-900 dark:text-white">Status</th>
              <th className="text-left p-3 text-gray-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEvents.map((event) => (
              <motion.tr
                key={event.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="p-3 text-gray-900 dark:text-white">{event.course}</td>
                <td className="p-3 text-gray-900 dark:text-white">{event.date}</td>
                <td className="p-3 text-gray-900 dark:text-white">{event.time}</td>
                <td className="p-3 text-gray-900 dark:text-white">{event.location}</td>
                <td className="p-3 text-gray-900 dark:text-white">{attendance[event.id] ? 'Attended' : 'Not Attended'}</td>
                <td className="p-3 text-gray-900 dark:text-white">{event.extendedProps?.approval_status || 'approved'}</td>
                <td className="p-3">
                  <button
                    onClick={() => toggleAttendance(event.id)}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    Toggle Attendance
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const renderProfile = () => (
    <motion.div
      key="profile"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
          <input
            type="text"
            value={profileData.name}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={profileData.email}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            readOnly
          />
        </div>
        <button
          onClick={() => setProfileModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          Edit Profile
        </button>
      </div>
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div
      key="settings"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
          <button
            onClick={toggleTheme}
            className={`w-12 h-6 rounded-full ${isDark ? 'bg-indigo-600' : 'bg-gray-300'} relative transition-colors`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${isDark ? 'translate-x-6' : 'translate-x-0.5'} absolute top-0.5`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300">Export Data</span>
          <div className="space-x-2">
            <button
              onClick={exportCSV}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              CSV
            </button>
            <button
              onClick={exportPDF}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              PDF
            </button>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center text-red-500 p-4">{error}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
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
          theme={isDark ? 'dark' : 'light'}
        />
        
        <div className="flex">
          <Navigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isDark={isDark}
            toggleTheme={toggleTheme}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
          
          <main className="flex-1 lg:ml-0">
            <div className="p-6">
              <AnimatePresence mode="wait">
                {renderContent()}
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
          userData={profileData}
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
  );
}

TrainerDashboard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string,
    email: PropTypes.string
  }).isRequired,
  onLogout: PropTypes.func.isRequired
};

export default TrainerDashboard;

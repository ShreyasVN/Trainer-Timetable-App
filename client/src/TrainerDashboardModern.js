// client/src/TrainerDashboardModern.js
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { sessionService, busySlotService, userService } from './api';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import { toast, ToastContainer } from 'react-toastify';
import { ThemeToggle, Button, Modal } from './components/ui';
import { useTheme } from './context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

// Chart.js registration
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Enhanced Icons from Heroicons
import {
  CalendarDaysIcon,
  ClockIcon,
  PlusIcon,
  Bars3Icon,
  CalendarIcon,
  ChartBarIcon,
  UserIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  FireIcon,
  SparklesIcon,
  PresentationChartBarIcon
} from '@heroicons/react/24/outline';

// Modern Profile Modal with enhanced UI
function ModernProfileModal({ isOpen, onClose, onSave, userData }) {
  const [form, setForm] = useState(userData || { name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setForm(userData || { name: '', email: '', password: '' });
  }, [userData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(form);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XCircleIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                  type="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password (optional)
                </label>
                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  type="password"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {isLoading && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

ModernProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  userData: PropTypes.object.isRequired
};

// Enhanced Stats Card with glassmorphism effect
function StatsCard({ title, value, icon: Icon, color, trend, isLoading }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`} />
      
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
          {isLoading ? (
            <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
          ) : (
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
              {trend && (
                <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend > 0 ? '+' : ''}{trend}%
                </span>
              )}
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </motion.div>
  );
}

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string.isRequired,
  trend: PropTypes.number,
  isLoading: PropTypes.bool
};

// Modern Navigation with better mobile experience
function ModernNavigation({ activeTab, setActiveTab, isDark, toggleTheme, isSidebarOpen, setIsSidebarOpen, user }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: PresentationChartBarIcon, color: 'from-indigo-500 to-purple-600' },
    { id: 'calendar', label: 'Calendar', icon: CalendarDaysIcon, color: 'from-blue-500 to-cyan-600' },
    { id: 'sessions', label: 'Sessions', icon: ClipboardDocumentListIcon, color: 'from-green-500 to-emerald-600' },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon, color: 'from-orange-500 to-red-600' },
    { id: 'profile', label: 'Profile', icon: UserIcon, color: 'from-purple-500 to-pink-600' },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon, color: 'from-gray-500 to-gray-600' },
  ];

  return (
    <>
      {/* Mobile Header */}
      <motion.div 
        className="lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 p-4 flex justify-between items-center sticky top-0 z-40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Trainer Portal</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {user?.name?.split(' ')[0]}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Bars3Icon className="h-5 w-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isSidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="fixed left-0 top-0 h-full w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl z-50 lg:relative lg:translate-x-0 border-r border-gray-200/50 dark:border-gray-700/50"
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <SparklesIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Trainer Portal</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Professional Dashboard</p>
            </div>
          </div>
          
          {/* User Profile Quick View */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">{user?.name?.charAt(0)}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{user?.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 shadow-lg'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl"
                  />
                )}
                <div className={`p-2 rounded-lg ${isActive ? `bg-gradient-to-r ${item.color} text-white` : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 text-center">
            <FireIcon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Stay Productive!</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Keep up the great work</p>
          </div>
          <ThemeToggle />
        </div>
      </motion.div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}

ModernNavigation.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  isDark: PropTypes.bool.isRequired,
  toggleTheme: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired
};

// Modern FAB with enhanced animations
function ModernFAB({ isOpen, setIsOpen, setBusyModalOpen, setClassModalOpen }) {
  const [ripples, setRipples] = useState([]);

  const createRipple = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      x, y, size,
      id: Date.now(),
    };
    
    setRipples((prev) => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
    }, 800);
  }, []);

  const fabItems = [
    {
      label: 'Mark Busy Time',
      icon: ClockIcon,
      onClick: () => {
        setBusyModalOpen(true);
        setIsOpen(false);
      },
      color: 'from-red-500 to-pink-600',
      description: 'Block time slots'
    },
    {
      label: 'Schedule Session',
      icon: CalendarIcon,
      onClick: () => {
        setClassModalOpen(true);
        setIsOpen(false);
      },
      color: 'from-green-500 to-emerald-600',
      description: 'Add new class'
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 space-y-4"
          >
            {fabItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, x: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={item.onClick}
                  className={`group flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-r ${item.color} text-white shadow-2xl hover:shadow-3xl transition-all backdrop-blur-lg`}
                >
                  <Icon className="h-6 w-6" />
                  <div className="text-left">
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs opacity-90">{item.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          createRipple(e);
          setIsOpen(!isOpen);
        }}
        className="relative overflow-hidden w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center"
      >
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
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
          transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
        >
          <PlusIcon className="h-8 w-8" />
        </motion.div>
      </motion.button>
    </div>
  );
}

ModernFAB.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  setBusyModalOpen: PropTypes.func.isRequired,
  setClassModalOpen: PropTypes.func.isRequired
};

// Export the enhanced modern dashboard (this will continue in the next part due to length)
export { ModernProfileModal, StatsCard, ModernNavigation, ModernFAB };

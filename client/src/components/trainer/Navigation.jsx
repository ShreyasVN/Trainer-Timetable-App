import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon, 
  SparklesIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UserIcon,
  Cog6ToothIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const Navigation = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, notifications }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: SparklesIcon, color: 'from-blue-500 to-purple-600' },
    { id: 'calendar', label: 'Calendar', icon: CalendarDaysIcon, color: 'from-emerald-500 to-teal-600' },
    { id: 'sessions', label: 'Sessions', icon: ClipboardDocumentListIcon, color: 'from-orange-500 to-red-600' },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon, color: 'from-purple-500 to-pink-600' },
    { id: 'profile', label: 'Profile', icon: UserIcon, color: 'from-indigo-500 to-blue-600' },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon, color: 'from-gray-500 to-gray-600' },
  ];

  const totalNotifications = notifications ? Object.values(notifications).filter(Boolean).length : 0;

  return (
    <>
      {/* Mobile Header */}
      <motion.div 
        className="lg:hidden bg-gradient-to-r from-blue-600 to-purple-700 shadow-2xl p-4 flex justify-between items-center sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg">
            <SparklesIcon className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Trainer Pro</h1>
            <p className="text-sm text-blue-100">Professional Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="relative p-3 rounded-xl bg-white/20 backdrop-blur-sm shadow-md"
          >
            <BellIcon className="h-5 w-5 text-white" />
            {totalNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {totalNotifications}
              </span>
            )}
          </motion.button>
          
          {/* Menu Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-3 rounded-xl bg-white/20 backdrop-blur-sm shadow-md"
          >
            <Bars3Icon className="h-6 w-6 text-white" />
          </motion.button>
        </div>
      </motion.div>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isSidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-white via-blue-50 to-purple-50 backdrop-blur-xl shadow-2xl z-50 lg:relative lg:translate-x-0 border-r border-blue-200/50"
      >
        {/* Sidebar Header */}
        <div className="p-8 border-b border-blue-200/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Trainer Pro
              </h2>
              <p className="text-blue-600 font-medium">Professional Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-6 space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02, x: 6 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 shadow-lg border-2 border-blue-300/50'
                    : 'hover:bg-blue-100/70 text-gray-700 hover:text-blue-700 hover:shadow-md'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl"
                  />
                )}
                <div className={`p-3 rounded-xl ${
                  isActive 
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                    : 'bg-blue-100/60 text-blue-600'
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="font-semibold text-lg">{item.label}</span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6 text-center shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm font-bold text-blue-800">Stay Productive!</p>
            <p className="text-xs text-blue-600">Excellence in every session</p>
          </div>
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
};

Navigation.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
  notifications: PropTypes.object,
};

export default Navigation;

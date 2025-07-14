import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import {
  Bars3Icon,
  BellIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

function MobileHeader({ 
  user, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  notificationBadge 
}) {
  const totalNotifications = Object.values(notificationBadge).filter(Boolean).length;

  return (
    <motion.div
      className="lg:hidden bg-gradient-to-r from-blue-50 to-indigo-100 backdrop-blur-lg shadow-xl border-b border-white/20 p-4 flex justify-between items-center sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      {/* Left side - Logo and User */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <SparklesIcon className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Trainer Portal</h1>
          <p className="text-sm text-gray-600">
            Welcome back, {user?.name?.split(' ')[0]}
          </p>
        </div>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-3 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white shadow-md hover:shadow-lg transition-all duration-200"
          aria-label="Notifications"
        >
          <BellIcon className="h-5 w-5 text-gray-700" />
          {totalNotifications > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium"
            >
              {totalNotifications}
            </motion.span>
          )}
        </motion.button>

        {/* Menu Toggle - Fixed visibility */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-3 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white shadow-md hover:shadow-lg transition-all duration-200 z-50"
          aria-label="Toggle sidebar"
          aria-expanded={isSidebarOpen}
          style={{ minWidth: '48px', minHeight: '48px' }}
        >
          <Bars3Icon className="h-6 w-6 text-gray-700" />
        </motion.button>
      </div>
    </motion.div>
  );
}

MobileHeader.propTypes = {
  user: PropTypes.object.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
  notificationBadge: PropTypes.object.isRequired,
};

export default MobileHeader;

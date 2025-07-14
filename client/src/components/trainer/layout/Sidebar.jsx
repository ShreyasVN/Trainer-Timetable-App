import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UserIcon,
  Cog6ToothIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

function Sidebar({ activeTab, setActiveTab, isSidebarOpen, user, notificationBadge }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: SparklesIcon, color: 'from-indigo-500 to-purple-600' },
    { id: 'calendar', label: 'Calendar', icon: CalendarDaysIcon, color: 'from-blue-500 to-cyan-600' },
    { id: 'sessions', label: 'Sessions', icon: ClipboardDocumentListIcon, color: 'from-green-500 to-emerald-600' },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon, color: 'from-orange-500 to-red-600' },
    { id: 'profile', label: 'Profile', icon: UserIcon, color: 'from-purple-500 to-pink-600' },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon, color: 'from-gray-500 to-gray-600' },
  ];

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: isSidebarOpen ? 0 : -280 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed left-0 top-0 h-full w-72 bg-white/95 backdrop-blur-xl shadow-2xl z-50 lg:relative lg:translate-x-0 border-r border-blue-200/50"
    >
      {/* Sidebar Header */}
      <div className="p-6 border-b border-blue-200/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <SparklesIcon className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-900">Trainer Portal</h2>
            <p className="text-sm text-blue-700">Professional Dashboard</p>
          </div>
        </div>

        {/* User Profile Quick View */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">{user?.name?.charAt(0)}</span>
            </div>
            <div>
              <p className="font-semibold text-blue-900 text-sm">{user?.name}</p>
              <p className="text-xs text-blue-700">{user?.email}</p>
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
              aria-label={item.label}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 shadow-lg border border-blue-200/50'
                  : 'hover:bg-blue-50 text-gray-700 hover:text-blue-700'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl"
                />
              )}
              <div className={`p-2 rounded-lg ${isActive ? `bg-gradient-to-r ${item.color} text-white shadow-sm` : 'bg-blue-100 text-blue-600'}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="font-medium">{item.label}</span>
              {notificationBadge[item.id] && (
                <span className="ml-auto inline-block w-2 h-2 bg-red-500 rounded-full" />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="absolute bottom-4 left-4 right-4 space-y-3">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 text-center shadow-sm">
          <p className="text-sm font-semibold text-blue-900">Stay Productive!</p>
          <p className="text-xs text-blue-700">Keep up the great work</p>
        </div>
      </div>
    </motion.div>
  );
}

Sidebar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
  notificationBadge: PropTypes.object.isRequired,
};

export default Sidebar;


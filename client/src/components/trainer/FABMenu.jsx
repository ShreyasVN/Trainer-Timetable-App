import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  CalendarIcon, 
  ClockIcon,
  BookOpenIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const FABMenu = ({ isOpen, setIsOpen, setBusyModalOpen, setClassModalOpen }) => {
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
      color: 'from-emerald-500 to-teal-600',
      description: 'Add new class'
    },
    {
      label: 'Quick Note',
      icon: BookOpenIcon,
      onClick: () => {
        // Add quick note functionality here
        setIsOpen(false);
      },
      color: 'from-blue-500 to-indigo-600',
      description: 'Add quick note'
    },
    {
      label: 'Contact Client',
      icon: UserGroupIcon,
      onClick: () => {
        // Add contact client functionality here
        setIsOpen(false);
      },
      color: 'from-purple-500 to-violet-600',
      description: 'Reach out to client'
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
            className="absolute bottom-24 right-0 space-y-4"
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
                  whileHover={{ scale: 1.05, x: -8 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={item.onClick}
                  className={`group flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-r ${item.color} text-white shadow-2xl hover:shadow-3xl transition-all backdrop-blur-lg border border-white/20`}
                >
                  <Icon className="h-6 w-6" />
                  <div className="text-left">
                    <p className="font-bold text-sm">{item.label}</p>
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
        className="relative overflow-hidden w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center border-2 border-white/20"
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
};

FABMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  setBusyModalOpen: PropTypes.func.isRequired,
  setClassModalOpen: PropTypes.func.isRequired
};

export default FABMenu;

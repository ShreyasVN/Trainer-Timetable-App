import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'spinner', 
  color = 'indigo', 
  fullScreen = false, 
  message = 'Loading...',
  className = ''
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colors = {
    indigo: 'border-indigo-600',
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    yellow: 'border-yellow-600',
    purple: 'border-purple-600'
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.7, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const dotsVariants = {
    animate: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'spinner':
        return (
          <motion.div
            className={`${sizes[size]} border-4 ${colors[color]} border-t-transparent rounded-full`}
            variants={spinnerVariants}
            animate="animate"
            role="status"
            aria-label={message}
          />
        );
      
      case 'pulse':
        return (
          <motion.div
            className={`${sizes[size]} ${colors[color].replace('border-', 'bg-')} rounded-full`}
            variants={pulseVariants}
            animate="animate"
            role="status"
            aria-label={message}
          />
        );
      
      case 'dots':
        return (
          <div className="flex space-x-1" role="status" aria-label={message}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 ${colors[color].replace('border-', 'bg-')} rounded-full`}
                variants={dotsVariants}
                animate="animate"
                style={{
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        );
      
      case 'bars':
        return (
          <div className="flex space-x-1" role="status" aria-label={message}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`w-1 h-4 ${colors[color].replace('border-', 'bg-')} rounded-full`}
                animate={{
                  scaleY: [1, 2, 1],
                  transition: {
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.1
                  }
                }}
              />
            ))}
          </div>
        );
      
      default:
        return (
          <motion.div
            className={`${sizes[size]} border-4 ${colors[color]} border-t-transparent rounded-full`}
            variants={spinnerVariants}
            animate="animate"
            role="status"
            aria-label={message}
          />
        );
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {renderSpinner()}
      {message && (
        <motion.p 
          className="text-sm text-gray-600 dark:text-gray-400 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['spinner', 'pulse', 'dots', 'bars']),
  color: PropTypes.oneOf(['indigo', 'blue', 'green', 'red', 'yellow', 'purple']),
  fullScreen: PropTypes.bool,
  message: PropTypes.string,
  className: PropTypes.string
};

export default LoadingSpinner;

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  headerClassName = '',
  contentClassName = '',
  variant = 'default',
  ...props 
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full m-4',
  };

  const variants = {
    default: 'bg-white',
    destructive: 'bg-white border-t-4 border-red-500',
    success: 'bg-white border-t-4 border-green-500',
    warning: 'bg-white border-t-4 border-yellow-500',
    info: 'bg-white border-t-4 border-blue-500',
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[1050] flex items-center justify-center p-4"
            onClick={handleOverlayClick}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ 
                type: 'spring',
                stiffness: 300,
                damping: 30
              }}
              className={`
                ${variants[variant]} rounded-lg shadow-2xl w-full ${sizes[size]} 
                max-h-[90vh] overflow-hidden ${className}
              `}
              onClick={(e) => e.stopPropagation()}
              {...props}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${headerClassName}`}>
                  {title && (
                    <h2 className="text-xl font-semibold text-gray-900">
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Close modal"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-400" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className={`max-h-[calc(90vh-100px)] overflow-y-auto ${contentClassName}`}>
                {children}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  showCloseButton: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'destructive', 'success', 'warning', 'info']),
};

const ModalBody = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

ModalBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const ModalFooter = ({ children, className = '' }) => (
  <div className={`p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 ${className}`}>
    {children}
  </div>
);

ModalFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;

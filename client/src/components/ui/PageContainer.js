import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const PageContainer = ({ 
  children, 
  variant = 'default',
  className = '',
  animation = true,
  maxWidth = 'max-w-7xl',
  padding = 'p-4 md:p-6 lg:p-8',
  ...props 
}) => {

  const baseClasses = `min-h-screen w-full transition-all duration-300 ${padding}`;
  
  const variants = {
    default: `bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800`,
    glass: `bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-xl`,
    solid: `bg-white dark:bg-slate-900`,
    gradient: `bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900/20`
  };

  const containerClasses = `${baseClasses} ${variants[variant]} ${className}`;

  const contentClasses = `mx-auto ${maxWidth} w-full`;

  const animationProps = animation ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
  } : {};

  if (animation) {
    return (
      <motion.div 
        className={containerClasses}
        {...animationProps}
        {...props}
      >
        <div className={contentClasses}>
          {children}
        </div>
      </motion.div>
    );
  }

  return (
    <div className={containerClasses} {...props}>
      <div className={contentClasses}>
        {children}
      </div>
    </div>
  );
};

PageContainer.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'glass', 'solid', 'gradient']),
  className: PropTypes.string,
  animation: PropTypes.bool,
  maxWidth: PropTypes.string,
  padding: PropTypes.string,
};

// Sub-components for better organization
const PageHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-6 lg:mb-8 ${className}`} {...props}>
    {children}
  </div>
);

PageHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const PageTitle = ({ children, className = '', ...props }) => (
  <h1 className={`text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2 ${className}`} {...props}>
    {children}
  </h1>
);

PageTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const PageSubtitle = ({ children, className = '', ...props }) => (
  <p className={`text-lg text-slate-600 dark:text-slate-400 ${className}`} {...props}>
    {children}
  </p>
);

PageSubtitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const PageContent = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

PageContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// Attach sub-components
PageContainer.Header = PageHeader;
PageContainer.Title = PageTitle;
PageContainer.Subtitle = PageSubtitle;
PageContainer.Content = PageContent;

export default PageContainer;

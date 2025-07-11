import React from 'react';
import PropTypes from 'prop-types';

const SkeletonLoader = ({ 
  type = 'text', 
  width = '100%', 
  height = '40px', 
  borderRadius = '8px', 
  className = '',
  count = 1 
}) => {
  const skeletonStyle = {
    width,
    height,
    borderRadius,
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 2s infinite',
  };

  const renderSkeleton = () => {
    switch (type) {
      case 'button':
        return (
          <div
            className={`${className} transition-all duration-300`}
            style={{
              ...skeletonStyle,
              height: '48px',
              borderRadius: '12px',
            }}
          />
        );
      case 'input':
        return (
          <div
            className={`${className} transition-all duration-300`}
            style={{
              ...skeletonStyle,
              height: '44px',
              borderRadius: '8px',
            }}
          />
        );
      case 'title':
        return (
          <div
            className={`${className} transition-all duration-300`}
            style={{
              ...skeletonStyle,
              height: '32px',
              borderRadius: '4px',
              width: '70%',
              margin: '0 auto',
            }}
          />
        );
      case 'text':
      default:
        return (
          <div
            className={`${className} transition-all duration-300`}
            style={skeletonStyle}
          />
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="mb-4">
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

SkeletonLoader.propTypes = {
  type: PropTypes.oneOf(['text', 'button', 'input', 'title']),
  width: PropTypes.string,
  height: PropTypes.string,
  borderRadius: PropTypes.string,
  className: PropTypes.string,
  count: PropTypes.number,
};

// Form skeleton loader
export const FormSkeleton = ({ showTitle = true }) => (
  <div className="animate-pulse">
    {showTitle && (
      <div className="mb-8">
        <SkeletonLoader type="title" />
      </div>
    )}
    <div className="space-y-4">
      <SkeletonLoader type="input" />
      <SkeletonLoader type="input" />
      <SkeletonLoader type="input" />
      <SkeletonLoader type="button" />
      <SkeletonLoader type="text" height="20px" width="60%" />
    </div>
  </div>
);

FormSkeleton.propTypes = {
  showTitle: PropTypes.bool,
};

// Button skeleton loader
export const ButtonSkeleton = ({ className = '' }) => (
  <SkeletonLoader 
    type="button" 
    className={`${className} animate-pulse`}
  />
);

ButtonSkeleton.propTypes = {
  className: PropTypes.string,
};

// Input skeleton loader
export const InputSkeleton = ({ className = '' }) => (
  <SkeletonLoader 
    type="input" 
    className={`${className} animate-pulse`}
  />
);

InputSkeleton.propTypes = {
  className: PropTypes.string,
};

export default SkeletonLoader;

/**
 * Animation Utilities - Main Export
 * Provides easy access to all animation utilities
 */

// Export all animation utilities
export * from './animationUtils.js';

// Export examples and demo functions
export * from './animationExamples.js';

// Re-export as default for convenience
export { default as AnimationUtils } from './animationUtils.js';
export { default as AnimationExamples } from './animationExamples.js';

// Common initialization function
export const initializeAllAnimationUtilities = () => {
  // Import the initialization function
  import('./animationUtils.js').then(({ initializeAnimations }) => {
    initializeAnimations();
  });
  
  // Also import and run example initializations if in development
  if (process.env.NODE_ENV === 'development') {
    import('./animationExamples.js').then(({ initializeAllAnimations }) => {
      // Only initialize examples if explicitly requested
      if (window.location.search.includes('demo=true')) {
        initializeAllAnimations();
      }
    });
  }
};

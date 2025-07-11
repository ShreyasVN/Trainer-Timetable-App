/**
 * Animation Utilities - Main Export
 * Provides easy access to all animation utilities
 */

import { isDevelopment, getEnvBool } from '../config/env.js';

// Export all animation utilities
export * from './animationUtils.js';

// Export examples and demo functions
export * from './animationExamples.js';

// Re-export as default for convenience
export { default as AnimationUtils } from './animationUtils.js';
export { default as AnimationExamples } from './animationExamples.js';

// Common initialization function
export const initializeAllAnimationUtilities = () => {
  try {
    // Import the initialization function
    import('./animationUtils.js').then(({ initializeAnimations }) => {
      initializeAnimations();
    }).catch(error => {
      console.error('Failed to initialize animation utilities:', error);
    });
    
    // Also import and run example initializations if in development
    if (isDevelopment()) {
      import('./animationExamples.js').then(({ initializeAllAnimations }) => {
        // Only initialize examples if explicitly requested
        if (typeof window !== 'undefined' && window.location.search.includes('demo=true')) {
          initializeAllAnimations();
        }
      }).catch(error => {
        console.error('Failed to initialize animation examples:', error);
      });
    }
  } catch (error) {
    console.error('Failed to initialize animation utilities:', error);
  }
};

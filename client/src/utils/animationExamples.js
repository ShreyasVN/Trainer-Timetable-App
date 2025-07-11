/**
 * Animation Utilities - Usage Examples
 * This file demonstrates how to use the animation utilities in your components
 */

import { 
  countUp, 
  revealOnScroll, 
  addRippleEffect, 
  addRippleToElements,
  initializeAnimations,
  staggerAnimation,
  setupScrollAnimations
} from './animationUtils.js';

/**
 * Example 1: Count-up numbers
 * Perfect for dashboard stats, counters, etc.
 */
export const exampleCountUp = () => {
  // Basic count-up
  const basicCounter = document.getElementById('basic-counter');
  if (basicCounter) {
    countUp(basicCounter, 0, 1250, 2000);
  }

  // Advanced count-up with formatting
  const advancedCounter = document.getElementById('advanced-counter');
  if (advancedCounter) {
    countUp(advancedCounter, 0, 98.5, 2500, {
      formatter: (value) => value.toFixed(1),
      suffix: '%',
      easing: 'easeOutCubic',
      onUpdate: (value, progress) => {
        // Update a progress bar or other UI element
        console.log(`Progress: ${(progress * 100).toFixed(1)}%`);
      },
      onComplete: () => {
        console.log('Count-up animation completed!');
      }
    });
  }

  // Currency example
  const currencyCounter = document.getElementById('currency-counter');
  if (currencyCounter) {
    countUp(currencyCounter, 0, 15750, 3000, {
      prefix: '$',
      formatter: (value) => Math.round(value).toLocaleString(),
      easing: 'easeOutQuart'
    });
  }
};

/**
 * Example 2: Reveal on scroll animations
 * Great for hero sections, cards, feature lists
 */
export const exampleRevealOnScroll = () => {
  // Basic reveal with default settings
  const basicRevealElements = document.querySelectorAll('.reveal-basic');
  if (basicRevealElements.length > 0) {
    revealOnScroll(basicRevealElements);
  }

  // Advanced reveal with custom options
  const advancedRevealElements = document.querySelectorAll('.reveal-advanced');
  if (advancedRevealElements.length > 0) {
    revealOnScroll(advancedRevealElements, {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px',
      triggerOnce: true,
      animationClass: 'slide-in-active',
      staggerDelay: 150,
      onReveal: (element) => {
        console.log('Element revealed:', element);
      }
    });
  }

  // Card grid with staggered reveal
  const cardGrid = document.querySelectorAll('.card-grid .card');
  if (cardGrid.length > 0) {
    revealOnScroll(cardGrid, {
      threshold: 0.1,
      staggerDelay: 100,
      animationClass: 'fade-in-up'
    });
  }
};

/**
 * Example 3: Ripple effects
 * Adds Material Design-like ripple effects to buttons
 */
export const exampleRippleEffects = () => {
  // Single button ripple
  const primaryButton = document.getElementById('primary-button');
  if (primaryButton) {
    addRippleEffect(primaryButton, {
      color: 'rgba(255, 255, 255, 0.4)',
      duration: 500
    });
  }

  // Multiple buttons with different colors
  const actionButtons = document.querySelectorAll('.action-button');
  if (actionButtons.length > 0) {
    addRippleToElements(actionButtons, {
      color: 'rgba(0, 0, 0, 0.1)',
      duration: 600
    });
  }

  // FAB (Floating Action Button) with custom ripple
  const fabButton = document.getElementById('fab-button');
  if (fabButton) {
    addRippleEffect(fabButton, {
      color: 'rgba(255, 255, 255, 0.6)',
      duration: 800
    });
  }
};

/**
 * Example 4: Staggered animations
 * Animate multiple elements with delays
 */
export const exampleStaggeredAnimations = () => {
  // Navigation items
  const navItems = document.querySelectorAll('.nav-item');
  if (navItems.length > 0) {
    staggerAnimation(navItems, 'fade-in-up', 100);
  }

  // Feature cards
  const featureCards = document.querySelectorAll('.feature-card');
  if (featureCards.length > 0) {
    staggerAnimation(featureCards, 'scale-in', 150);
  }
};

/**
 * Example 5: Complete initialization
 * Call this when your app starts
 */
export const initializeAllAnimations = () => {
  // Initialize all animation utilities
  const observer = initializeAnimations();

  // Setup specific scroll animations
  setupScrollAnimations('.reveal', {
    threshold: 0.15,
    staggerDelay: 100
  });

  // Custom initialization for specific elements
  setTimeout(() => {
    exampleCountUp();
    exampleRevealOnScroll();
    exampleRippleEffects();
  }, 100);

  return observer;
};

/**
 * React Hook Example (if using React)
 * This shows how to integrate with React components
 */
export const useAnimationUtils = () => {
  const React = window.React; // Assuming React is available globally
  
  if (!React) {
    console.warn('React not found. This hook requires React.');
    return {};
  }

  const { useEffect, useRef, useCallback } = React;

  // Count-up hook
  const useCountUp = (end, duration = 2000, options = {}) => {
    const elementRef = useRef(null);

    useEffect(() => {
      if (elementRef.current) {
        countUp(elementRef.current, 0, end, duration, options);
      }
    }, [end, duration, options]);

    return elementRef;
  };

  // Reveal on scroll hook
  const useRevealOnScroll = (options = {}) => {
    const elementRef = useRef(null);

    useEffect(() => {
      if (elementRef.current) {
        const observer = revealOnScroll(elementRef.current, options);
        return () => observer?.disconnect();
      }
    }, [options]);

    return elementRef;
  };

  // Ripple effect hook
  const useRippleEffect = (options = {}) => {
    const elementRef = useRef(null);

    useEffect(() => {
      if (elementRef.current) {
        const cleanup = addRippleEffect(elementRef.current, options);
        return cleanup;
      }
    }, [options]);

    return elementRef;
  };

  return {
    useCountUp,
    useRevealOnScroll,
    useRippleEffect
  };
};

/**
 * HTML Examples
 * These are example HTML structures that work with the animations
 */
export const htmlExamples = `
<!-- Count-up Examples -->
<div class="stats-container">
  <div class="stat-item">
    <span id="basic-counter">0</span>
    <label>Total Users</label>
  </div>
  <div class="stat-item">
    <span id="advanced-counter">0</span>
    <label>Success Rate</label>
  </div>
  <div class="stat-item">
    <span id="currency-counter">$0</span>
    <label>Revenue</label>
  </div>
</div>

<!-- Reveal on Scroll Examples -->
<section class="hero">
  <div class="hero-content reveal fade-in-up">
    <h1>Welcome to Our App</h1>
    <p>Experience smooth animations</p>
  </div>
</section>

<div class="card-grid">
  <div class="card reveal">Card 1</div>
  <div class="card reveal">Card 2</div>
  <div class="card reveal">Card 3</div>
  <div class="card reveal">Card 4</div>
</div>

<!-- Ripple Effect Examples -->
<button id="primary-button" class="btn btn-primary">
  Primary Action
</button>

<button class="action-button">Action 1</button>
<button class="action-button">Action 2</button>
<button class="action-button">Action 3</button>

<button id="fab-button" class="fab">
  <i class="icon-plus"></i>
</button>

<!-- Staggered Animation Examples -->
<nav class="navigation">
  <a href="#" class="nav-item">Home</a>
  <a href="#" class="nav-item">About</a>
  <a href="#" class="nav-item">Services</a>
  <a href="#" class="nav-item">Contact</a>
</nav>

<div class="features">
  <div class="feature-card stagger-item">Feature 1</div>
  <div class="feature-card stagger-item">Feature 2</div>
  <div class="feature-card stagger-item">Feature 3</div>
</div>
`;

export default {
  exampleCountUp,
  exampleRevealOnScroll,
  exampleRippleEffects,
  exampleStaggeredAnimations,
  initializeAllAnimations,
  useAnimationUtils,
  htmlExamples
};

/**
 * Animation Utilities Library
 * Provides JavaScript helpers for animations and interactive effects
 */

// Check if user prefers reduced motion
const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Count-up animation utility
 * Animates a number from start to end value
 * @param {HTMLElement} element - The element to animate
 * @param {number} start - Starting number
 * @param {number} end - Ending number
 * @param {number} duration - Animation duration in milliseconds
 * @param {Object} options - Additional options
 */
export const countUp = (element, start = 0, end = 100, duration = 2000, options = {}) => {
  // Skip animation if user prefers reduced motion
  if (prefersReducedMotion()) {
    element.textContent = options.formatter ? options.formatter(end) : end;
    return Promise.resolve();
  }

  const {
    formatter = (value) => Math.round(value),
    easing = 'easeOutQuart',
    prefix = '',
    suffix = '',
    separator = '',
    onUpdate = null,
    onComplete = null
  } = options;

  return new Promise((resolve) => {
    const startTime = performance.now();
    const range = end - start;

    // Easing functions
    const easingFunctions = {
      linear: (t) => t,
      easeInQuad: (t) => t * t,
      easeOutQuad: (t) => t * (2 - t),
      easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      easeInCubic: (t) => t * t * t,
      easeOutCubic: (t) => (--t) * t * t + 1,
      easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
      easeInQuart: (t) => t * t * t * t,
      easeOutQuart: (t) => 1 - (--t) * t * t * t,
      easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
    };

    const easingFn = easingFunctions[easing] || easingFunctions.easeOutQuart;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easedProgress = easingFn(progress);
      const currentValue = start + (range * easedProgress);
      
      let displayValue = formatter(currentValue);
      
      // Add separator for large numbers
      if (separator && typeof displayValue === 'number') {
        displayValue = displayValue.toLocaleString();
      }
      
      element.textContent = `${prefix}${displayValue}${suffix}`;
      
      // Call update callback
      if (onUpdate) {
        onUpdate(currentValue, progress);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        if (onComplete) {
          onComplete();
        }
        resolve();
      }
    };

    requestAnimationFrame(animate);
  });
};

/**
 * Intersection Observer based reveal animation
 * Reveals elements when they enter the viewport
 * @param {string|NodeList|HTMLElement} elements - Elements to observe
 * @param {Object} options - Intersection observer options
 */
export const revealOnScroll = (elements, options = {}) => {
  // Skip if reduced motion is preferred
  if (prefersReducedMotion()) {
    const targetElements = typeof elements === 'string' 
      ? document.querySelectorAll(elements) 
      : elements.length !== undefined ? elements : [elements];
    
    targetElements.forEach(el => {
      el.classList.add('active');
    });
    return null;
  }

  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
    animationClass = 'active',
    staggerDelay = 0,
    onReveal = null
  } = options;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const delay = staggerDelay * index;
        
        setTimeout(() => {
          entry.target.classList.add(animationClass);
          
          if (onReveal) {
            onReveal(entry.target);
          }
        }, delay);
        
        if (triggerOnce) {
          observer.unobserve(entry.target);
        }
      } else if (!triggerOnce) {
        entry.target.classList.remove(animationClass);
      }
    });
  }, {
    threshold,
    rootMargin
  });

  // Convert elements to NodeList if needed
  const targetElements = typeof elements === 'string' 
    ? document.querySelectorAll(elements) 
    : elements.length !== undefined ? elements : [elements];

  targetElements.forEach(el => {
    observer.observe(el);
  });

  return observer;
};

/**
 * Ripple effect utility
 * Creates a ripple effect on button clicks
 * @param {HTMLElement} element - The element to add ripple to
 * @param {Object} options - Ripple options
 */
export const addRippleEffect = (element, options = {}) => {
  // Skip if reduced motion is preferred
  if (prefersReducedMotion()) {
    return;
  }

  const {
    color = 'rgba(255, 255, 255, 0.6)',
    duration = 600,
    className = 'ripple-effect'
  } = options;

  // Ensure element has proper positioning
  if (getComputedStyle(element).position === 'static') {
    element.style.position = 'relative';
  }

  // Ensure element has overflow hidden
  element.style.overflow = 'hidden';

  const createRipple = (event) => {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = className;
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background-color: ${color};
      border-radius: 50%;
      transform: scale(0);
      animation: ripple ${duration}ms linear;
      pointer-events: none;
    `;

    element.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, duration);
  };

  element.addEventListener('click', createRipple);

  // Return cleanup function
  return () => {
    element.removeEventListener('click', createRipple);
  };
};

/**
 * Batch add ripple effects to multiple elements
 * @param {string|NodeList|HTMLElement[]} elements - Elements to add ripple to
 * @param {Object} options - Ripple options
 */
export const addRippleToElements = (elements, options = {}) => {
  const targetElements = typeof elements === 'string' 
    ? document.querySelectorAll(elements) 
    : elements;

  const cleanupFunctions = [];

  targetElements.forEach(el => {
    const cleanup = addRippleEffect(el, options);
    if (cleanup) {
      cleanupFunctions.push(cleanup);
    }
  });

  // Return cleanup function for all elements
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
};

/**
 * Auto-initialize ripple effects on buttons and FABs
 * Call this after DOM is loaded
 */
export const initializeRippleEffects = () => {
  const buttonSelectors = [
    'button',
    '.btn',
    '.button',
    '.fab',
    '.floating-action-button',
    '[role="button"]'
  ];

  buttonSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      // Only add ripple if not already present
      if (!el.hasAttribute('data-ripple-initialized')) {
        addRippleEffect(el);
        el.setAttribute('data-ripple-initialized', 'true');
      }
    });
  });
};

/**
 * Animate element with CSS class
 * @param {HTMLElement} element - Element to animate
 * @param {string} animationClass - CSS class to add
 * @param {number} duration - Duration to keep class (optional)
 */
export const animateElement = (element, animationClass, duration = null) => {
  if (prefersReducedMotion()) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    element.classList.add(animationClass);

    const handleAnimationEnd = () => {
      element.removeEventListener('animationend', handleAnimationEnd);
      resolve();
    };

    element.addEventListener('animationend', handleAnimationEnd);

    // Fallback timeout
    if (duration) {
      setTimeout(() => {
        element.classList.remove(animationClass);
        resolve();
      }, duration);
    }
  });
};

/**
 * Stagger animation for multiple elements
 * @param {NodeList|HTMLElement[]} elements - Elements to animate
 * @param {string} animationClass - CSS class to add
 * @param {number} delay - Delay between each element
 */
export const staggerAnimation = (elements, animationClass, delay = 100) => {
  if (prefersReducedMotion()) {
    elements.forEach(el => el.classList.add(animationClass));
    return Promise.resolve();
  }

  const promises = [];

  elements.forEach((element, index) => {
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        animateElement(element, animationClass).then(resolve);
      }, delay * index);
    });
    promises.push(promise);
  });

  return Promise.all(promises);
};

/**
 * Scroll-triggered animations helper
 * @param {string} selector - CSS selector for elements to animate
 * @param {Object} options - Animation options
 */
export const setupScrollAnimations = (selector = '.reveal', options = {}) => {
  const elements = document.querySelectorAll(selector);
  
  if (elements.length === 0) {
    return null;
  }

  return revealOnScroll(elements, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    triggerOnce: true,
    staggerDelay: 100,
    ...options
  });
};

/**
 * Utility to check if animations are supported
 */
export const supportsAnimations = () => {
  return typeof window !== 'undefined' && 
         'requestAnimationFrame' in window &&
         'IntersectionObserver' in window;
};

/**
 * Initialize all animation utilities
 * Call this when DOM is ready
 */
export const initializeAnimations = () => {
  if (!supportsAnimations()) {
    console.warn('Animation utilities: Some features may not be supported in this browser');
    return;
  }

  // Initialize ripple effects
  initializeRippleEffects();

  // Initialize scroll animations
  setupScrollAnimations();

  // Listen for dynamically added elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if the added element or its children need ripple effects
          const buttons = node.matches?.('button, .btn, .button, .fab') 
            ? [node] 
            : node.querySelectorAll?.('button, .btn, .button, .fab') || [];
          
          buttons.forEach(btn => {
            if (!btn.hasAttribute('data-ripple-initialized')) {
              addRippleEffect(btn);
              btn.setAttribute('data-ripple-initialized', 'true');
            }
          });
          
          // Check for elements that need scroll animations
          const revealElements = node.matches?.('.reveal') 
            ? [node] 
            : node.querySelectorAll?.('.reveal') || [];
          
          if (revealElements.length > 0) {
            revealOnScroll(revealElements);
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  return observer;
};

// Export default object with all utilities
export default {
  countUp,
  revealOnScroll,
  addRippleEffect,
  addRippleToElements,
  initializeRippleEffects,
  animateElement,
  staggerAnimation,
  setupScrollAnimations,
  supportsAnimations,
  initializeAnimations,
  prefersReducedMotion
};

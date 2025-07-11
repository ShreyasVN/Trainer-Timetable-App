# Animation Utilities Library

A comprehensive collection of reusable CSS animations and JavaScript utilities for modern web applications, with full accessibility support and reduced-motion preferences.

## Features

- ✨ **CSS Keyframes**: Fade-in, slide-up, shimmer, ripple animations
- 🔢 **Count-up Numbers**: Smooth animated number counters with easing
- 👁️ **Intersection Observer**: Reveal elements on scroll with staggered animations
- 🌊 **Ripple Effects**: Material Design-like ripple effects for buttons and FABs
- ♿ **Accessibility**: Full support for `prefers-reduced-motion` media query
- 🎯 **TypeScript Ready**: Well-documented APIs with clear parameter types
- 📱 **Mobile Optimized**: Performant animations that work on all devices

## Installation

1. Import the CSS animations:
```css
@import './styles/animations.css';
```

2. Import the JavaScript utilities:
```javascript
import { countUp, revealOnScroll, addRippleEffect, initializeAnimations } from './utils/animationUtils.js';
```

## Quick Start

### Initialize All Animations
```javascript
import { initializeAnimations } from './utils/animationUtils.js';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeAnimations();
});
```

## CSS Animations

### Basic Usage
```html
<!-- Fade animations -->
<div class="fade-in">Fades in smoothly</div>
<div class="fade-in-up">Fades in from bottom</div>
<div class="fade-in-delayed">Fades in with delay</div>

<!-- Slide animations -->
<div class="slide-up">Slides up from bottom</div>
<div class="slide-left">Slides in from right</div>

<!-- Scale animations -->
<div class="scale-in">Scales in smoothly</div>

<!-- Hover effects -->
<button class="hover-lift">Lifts on hover</button>
<div class="hover-scale">Scales on hover</div>
```

### Loading States
```html
<!-- Shimmer loading -->
<div class="shimmer" style="width: 200px; height: 20px;"></div>

<!-- Skeleton loading -->
<div class="loading-skeleton" style="width: 100%; height: 40px;"></div>

<!-- Loading dots -->
<span class="loading-dots">Loading</span>
```

### Staggered Animations
```html
<div class="card-container">
  <div class="card stagger-item">Card 1</div>
  <div class="card stagger-item">Card 2</div>
  <div class="card stagger-item">Card 3</div>
</div>
```

## JavaScript Utilities

### Count-up Numbers

Perfect for dashboard statistics, counters, and progress indicators.

```javascript
import { countUp } from './utils/animationUtils.js';

// Basic usage
const element = document.getElementById('counter');
countUp(element, 0, 100, 2000);

// Advanced usage with options
countUp(element, 0, 98.5, 2500, {
  formatter: (value) => value.toFixed(1),
  prefix: '$',
  suffix: '%',
  easing: 'easeOutCubic',
  onUpdate: (value, progress) => {
    console.log(`Current: ${value}, Progress: ${progress * 100}%`);
  },
  onComplete: () => {
    console.log('Animation completed!');
  }
});
```

#### Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `formatter` | Function | `Math.round` | Format the displayed value |
| `easing` | String | `'easeOutQuart'` | Easing function name |
| `prefix` | String | `''` | Text before the number |
| `suffix` | String | `''` | Text after the number |
| `separator` | String | `''` | Thousands separator |
| `onUpdate` | Function | `null` | Callback during animation |
| `onComplete` | Function | `null` | Callback when complete |

### Reveal on Scroll

Animate elements when they enter the viewport using Intersection Observer.

```javascript
import { revealOnScroll } from './utils/animationUtils.js';

// Basic usage
const elements = document.querySelectorAll('.reveal');
revealOnScroll(elements);

// Advanced usage
revealOnScroll(elements, {
  threshold: 0.2,
  rootMargin: '0px 0px -100px 0px',
  triggerOnce: true,
  animationClass: 'slide-in-active',
  staggerDelay: 150,
  onReveal: (element) => {
    console.log('Element revealed:', element);
  }
});
```

#### Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `threshold` | Number | `0.1` | Intersection threshold (0-1) |
| `rootMargin` | String | `'0px 0px -50px 0px'` | Root margin for intersection |
| `triggerOnce` | Boolean | `true` | Trigger animation only once |
| `animationClass` | String | `'active'` | CSS class to add when revealed |
| `staggerDelay` | Number | `0` | Delay between elements (ms) |
| `onReveal` | Function | `null` | Callback when element is revealed |

### Ripple Effects

Add Material Design-like ripple effects to buttons and interactive elements.

```javascript
import { addRippleEffect, addRippleToElements } from './utils/animationUtils.js';

// Single element
const button = document.getElementById('my-button');
addRippleEffect(button);

// Multiple elements
const buttons = document.querySelectorAll('.ripple-button');
addRippleToElements(buttons, {
  color: 'rgba(255, 255, 255, 0.4)',
  duration: 600
});
```

#### Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `color` | String | `'rgba(255, 255, 255, 0.6)'` | Ripple color |
| `duration` | Number | `600` | Animation duration (ms) |
| `className` | String | `'ripple-effect'` | CSS class for ripple element |

## React Integration

### Custom Hooks

```javascript
import { useCountUp, useRevealOnScroll, useRippleEffect } from './utils/animationExamples.js';

function MyComponent() {
  // Count-up hook
  const counterRef = useCountUp(1250, 2000, {
    formatter: (value) => Math.round(value).toLocaleString()
  });

  // Reveal on scroll hook
  const revealRef = useRevealOnScroll({
    threshold: 0.2,
    animationClass: 'fade-in-up'
  });

  // Ripple effect hook
  const buttonRef = useRippleEffect({
    color: 'rgba(0, 0, 0, 0.1)'
  });

  return (
    <div>
      <span ref={counterRef}>0</span>
      <div ref={revealRef} className="reveal">
        This will animate when scrolled into view
      </div>
      <button ref={buttonRef}>
        Click me for ripple effect
      </button>
    </div>
  );
}
```

## Accessibility

This library fully respects user preferences for reduced motion:

- **CSS**: All animations are disabled when `prefers-reduced-motion: reduce` is set
- **JavaScript**: Animations are skipped and final states are applied immediately
- **Fallbacks**: Static alternatives are provided for all interactive elements

### Manual Accessibility Check

```javascript
import { prefersReducedMotion } from './utils/animationUtils.js';

if (prefersReducedMotion()) {
  // User prefers reduced motion
  // Show static content or minimal animations
} else {
  // Full animations are acceptable
}
```

## Animation Classes Reference

### Fade Animations
- `.fade-in` - Simple fade in
- `.fade-in-up` - Fade in from bottom
- `.fade-in-down` - Fade in from top
- `.fade-in-delayed` - Fade in with delay

### Slide Animations
- `.slide-up` - Slide up from bottom
- `.slide-down` - Slide down from top
- `.slide-left` - Slide in from right
- `.slide-right` - Slide in from left

### Scale Animations
- `.scale-in` - Scale in from smaller
- `.scale-out` - Scale out to smaller

### Interactive Animations
- `.bounce` - Bounce effect
- `.pulse` - Pulsing effect
- `.shake` - Shake effect
- `.rotate` - Continuous rotation

### Hover Effects
- `.hover-lift` - Lift on hover with shadow
- `.hover-scale` - Scale on hover

### Loading States
- `.shimmer` - Shimmer loading effect
- `.shimmer-pulse` - Pulse loading effect
- `.loading-skeleton` - Skeleton loading
- `.loading-dots` - Animated loading dots

## Performance Tips

1. **Use CSS transforms** over changing layout properties
2. **Prefer opacity and transform** for the best performance
3. **Use `will-change`** sparingly and remove it after animations
4. **Batch DOM operations** when applying multiple animations
5. **Respect user preferences** for reduced motion

## Browser Support

- **Modern browsers**: Full support for all features
- **IE11**: Limited support (no Intersection Observer)
- **Mobile**: Optimized for mobile performance
- **Reduced motion**: Supported in all modern browsers

## Contributing

1. Follow the existing code style and patterns
2. Test with reduced motion preferences enabled
3. Ensure all animations have proper fallbacks
4. Document new features with examples

## License

This animation library is part of the Trainer Timetable App project.

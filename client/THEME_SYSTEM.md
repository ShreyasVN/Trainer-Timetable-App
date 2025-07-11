# Global Design System & Theme Documentation

## Overview

This project includes a comprehensive theme system with CSS variables, light/dark mode support, and React context for theme management. The system provides consistent styling across the entire application with easy theme switching capabilities.

## Files Structure

```
src/
├── theme.css              # Main theme file with CSS variables
├── ThemeProvider.js        # React Context Provider for theme management
├── useTheme.js            # Custom hook for accessing theme context
├── ThemeToggle.js         # Theme toggle button component
├── themeUtils.js          # Utility functions for theme management
└── THEME_SYSTEM.md        # This documentation file
```

## Key Features

### 1. CSS Variables for Design Consistency
- **Colors**: Primary, secondary, semantic colors (success, error, warning, info)
- **Typography**: Font families, sizes, weights, line heights, letter spacing
- **Spacing**: Consistent spacing scale from 0-64rem
- **Elevation**: Shadow system for depth and hierarchy
- **Animation**: Timing functions and durations
- **Border Radius**: Consistent radius scale

### 2. Light/Dark Theme Support
- Automatic system preference detection
- Manual theme switching with toggle button
- Persistent theme choice in localStorage
- Smooth transitions between themes

### 3. React Integration
- ThemeProvider context for global theme state
- useTheme hook for easy access to theme functions
- ThemeToggle component for theme switching

## Usage

### Setting Up the Theme System

1. **Wrap your app with ThemeProvider** (already done in `src/index.js`):
```jsx
import ThemeProvider from './ThemeProvider';

<ThemeProvider>
  <App />
</ThemeProvider>
```

2. **Use the theme in components**:
```jsx
import useTheme from './useTheme';

function MyComponent() {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>
        Switch to {isDark ? 'light' : 'dark'} mode
      </button>
    </div>
  );
}
```

### Using CSS Variables

#### In CSS/SCSS files:
```css
.my-component {
  background-color: var(--surface-primary);
  color: var(--text-primary);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--duration-200) var(--ease-in-out);
}

.my-button {
  background: var(--color-primary);
  color: var(--text-inverse);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
}
```

#### In JavaScript/React:
```jsx
import { THEME_VARIABLES } from './themeUtils';

const styles = {
  container: {
    backgroundColor: THEME_VARIABLES.backgrounds.primary,
    padding: THEME_VARIABLES.spacing.md,
    borderRadius: THEME_VARIABLES.radius.lg,
  }
};
```

## Available CSS Variables

### Colors
```css
/* Primary Colors */
--primary-50 to --primary-900

/* Secondary Colors */
--secondary-50 to --secondary-900

/* Semantic Colors */
--success-50 to --success-900
--error-50 to --error-900
--warning-50 to --warning-900
--info-50 to --info-900

/* Theme Colors (change with light/dark mode) */
--color-primary
--color-primary-hover
--color-primary-light
--color-primary-dark
```

### Typography
```css
/* Font Families */
--font-family-primary
--font-family-secondary
--font-family-mono

/* Font Sizes */
--font-size-xs (12px)
--font-size-sm (14px)
--font-size-base (16px)
--font-size-lg (18px)
--font-size-xl (20px)
--font-size-2xl to --font-size-9xl

/* Font Weights */
--font-weight-thin (100)
--font-weight-light (300)
--font-weight-normal (400)
--font-weight-medium (500)
--font-weight-semibold (600)
--font-weight-bold (700)
--font-weight-extrabold (800)
```

### Spacing
```css
--spacing-0 (0)
--spacing-1 (4px)
--spacing-2 (8px)
--spacing-3 (12px)
--spacing-4 (16px)
--spacing-5 (20px)
--spacing-6 (24px)
--spacing-8 (32px)
--spacing-10 (40px)
--spacing-12 (48px)
--spacing-16 (64px)
/* ... up to --spacing-64 (256px) */
```

### Shadows & Elevation
```css
--shadow-xs
--shadow-sm
--shadow-md
--shadow-lg
--shadow-xl
--shadow-2xl
--shadow-inner
--shadow-focus-primary
--shadow-focus-error
/* etc. */
```

### Border Radius
```css
--radius-none (0)
--radius-sm (2px)
--radius-base (4px)
--radius-md (6px)
--radius-lg (8px)
--radius-xl (12px)
--radius-2xl (16px)
--radius-3xl (24px)
--radius-full (9999px)
```

### Animation
```css
/* Durations */
--duration-75 (75ms)
--duration-100 (100ms)
--duration-150 (150ms)
--duration-200 (200ms)
--duration-300 (300ms)
--duration-500 (500ms)
--duration-700 (700ms)
--duration-1000 (1000ms)

/* Easing Functions */
--ease-linear
--ease-in
--ease-out
--ease-in-out
--ease-bounce
--ease-smooth
```

## Theme Structure

### Light Mode
- **Backgrounds**: White and light grays
- **Text**: Dark colors for readability
- **Borders**: Subtle gray borders
- **Shadows**: Light shadows for depth

### Dark Mode
- **Backgrounds**: Dark slate colors
- **Text**: Light colors for readability
- **Borders**: Darker borders
- **Shadows**: Deeper shadows for contrast

## Utility Classes

The theme system includes utility classes for common styling:

```css
/* Typography */
.text-xs, .text-sm, .text-base, .text-lg, etc.
.font-thin, .font-light, .font-normal, etc.
.text-primary, .text-secondary, .text-muted

/* Spacing */
.p-0, .p-1, .p-2, etc. (padding)
.m-0, .m-1, .m-2, etc. (margin)

/* Shadows */
.shadow-xs, .shadow-sm, .shadow-md, etc.

/* Border Radius */
.rounded-none, .rounded-sm, .rounded-lg, etc.

/* Components */
.btn, .btn-primary, .btn-secondary
.card
.input
```

## Best Practices

1. **Always use CSS variables** instead of hard-coded values
2. **Use semantic color names** (--color-primary) rather than specific colors (--blue-500)
3. **Maintain consistent spacing** using the spacing scale
4. **Add theme-transition class** to elements that should animate theme changes
5. **Test both light and dark modes** during development
6. **Use utility classes** for common styling patterns

## Customization

To customize the theme:

1. **Modify CSS variables** in `src/theme.css`
2. **Add new semantic colors** by defining them in both light and dark mode sections
3. **Extend utility classes** by adding new ones to the theme file
4. **Update theme utilities** in `src/themeUtils.js` for new functionality

## Migration Guide

When refactoring existing styles to use the theme system:

1. Replace hard-coded colors with CSS variables
2. Replace hard-coded spacing with spacing variables
3. Replace hard-coded shadows with shadow variables
4. Add theme transitions where appropriate
5. Test in both light and dark modes

## Example Migration

**Before:**
```css
.my-button {
  background-color: #3b82f6;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
}
```

**After:**
```css
.my-button {
  background-color: var(--color-primary);
  color: var(--text-inverse);
  padding: var(--spacing-3) var(--spacing-5);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: background-color var(--duration-200) var(--ease-in-out);
}
```

This migration ensures the button automatically adapts to theme changes and maintains consistency with the design system.

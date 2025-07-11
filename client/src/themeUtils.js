// Theme utility functions and exports

// Theme constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

// Get saved theme from localStorage or default to light
export const getSavedTheme = () => {
  return localStorage.getItem('theme') || THEMES.LIGHT;
};

// Save theme to localStorage
export const saveTheme = (theme) => {
  localStorage.setItem('theme', theme);
};

// Apply theme to the document
export const applyTheme = (theme) => {
  document.body.setAttribute('data-theme', theme);
};

// Check if current theme is dark
export const isDarkTheme = (theme) => {
  return theme === THEMES.DARK;
};

// Toggle between light and dark theme
export const toggleTheme = (currentTheme) => {
  return currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
};

// Check if user prefers dark mode based on system preference
export const getSystemPreference = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT;
  }
  return THEMES.LIGHT;
};

// Initialize theme with system preference fallback
export const initializeTheme = () => {
  const savedTheme = getSavedTheme();
  const systemTheme = getSystemPreference();
  
  // If no saved theme, use system preference
  const initialTheme = savedTheme || systemTheme;
  
  applyTheme(initialTheme);
  saveTheme(initialTheme);
  
  return initialTheme;
};

// CSS variable getters (utility functions to get CSS custom properties)
export const getCSSVariable = (variableName) => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  }
  return '';
};

// Set CSS variable
export const setCSSVariable = (variableName, value) => {
  if (typeof window !== 'undefined') {
    document.documentElement.style.setProperty(variableName, value);
  }
};

// Theme CSS variable categories for easier access
export const THEME_VARIABLES = {
  colors: {
    primary: 'var(--color-primary)',
    secondary: 'var(--color-secondary)',
    success: 'var(--color-success)',
    error: 'var(--color-error)',
    warning: 'var(--color-warning)',
    info: 'var(--color-info)',
  },
  backgrounds: {
    primary: 'var(--bg-primary)',
    secondary: 'var(--bg-secondary)',
    tertiary: 'var(--bg-tertiary)',
  },
  text: {
    primary: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    tertiary: 'var(--text-tertiary)',
    muted: 'var(--text-muted)',
  },
  borders: {
    primary: 'var(--border-primary)',
    secondary: 'var(--border-secondary)',
    focus: 'var(--border-focus)',
  },
  shadows: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
  },
  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    full: 'var(--radius-full)',
  },
  spacing: {
    xs: 'var(--spacing-1)',
    sm: 'var(--spacing-2)',
    md: 'var(--spacing-4)',
    lg: 'var(--spacing-6)',
    xl: 'var(--spacing-8)',
  },
  durations: {
    fast: 'var(--duration-150)',
    normal: 'var(--duration-200)',
    slow: 'var(--duration-300)',
  },
  easings: {
    linear: 'var(--ease-linear)',
    in: 'var(--ease-in)',
    out: 'var(--ease-out)',
    inOut: 'var(--ease-in-out)',
  }
};

export default {
  THEMES,
  getSavedTheme,
  saveTheme,
  applyTheme,
  isDarkTheme,
  toggleTheme,
  getSystemPreference,
  initializeTheme,
  getCSSVariable,
  setCSSVariable,
  THEME_VARIABLES
};

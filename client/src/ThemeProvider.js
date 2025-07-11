import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { initializeTheme, THEMES, applyTheme, saveTheme } from './themeUtils';

// Create a Context for the theme
export const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  // Initialize theme with system preference fallback
  const [theme, setTheme] = useState(() => {
    return initializeTheme();
  });

  useEffect(() => {
    // Apply the theme class to the body
    applyTheme(theme);

    // Save the theme in localStorage
    saveTheme(theme);
  }, [theme]);

  // Toggle between light and dark theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT));
  };

  // Set specific theme
  const setSpecificTheme = (newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      setTheme: setSpecificTheme,
      isDark: theme === THEMES.DARK 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default ThemeProvider;


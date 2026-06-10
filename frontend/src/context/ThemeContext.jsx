import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'classroom-theme';

export const THEMES = [
  { id: 'light', label: 'Light', description: 'Bright neutral workspace' },
  { id: 'dark', label: 'Dark', description: 'Low-glare evening mode' },
  { id: 'blue', label: 'Blue', description: 'Calm academic blue' },
  { id: 'red', label: 'Red', description: 'Bold high-energy red' },
  { id: 'purple', label: 'Purple', description: 'Creative studio purple' },
  { id: 'custom', label: 'School', description: 'Brand-friendly school palette' },
];

const DEFAULT_THEME = 'light';

const ThemeContext = createContext(null);

const isValidTheme = (theme) => THEMES.some((item) => item.id === theme);

export const ThemeProvider = ({ children, initialTheme = DEFAULT_THEME }) => {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') {
      return initialTheme;
    }

    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    if (storedTheme && isValidTheme(storedTheme)) {
      return storedTheme;
    }

    return initialTheme;
  });

  const applyTheme = useCallback((nextTheme) => {
    document.documentElement.setAttribute('data-theme', nextTheme);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [applyTheme, theme]);

  const setTheme = useCallback((nextTheme) => {
    if (!isValidTheme(nextTheme)) {
      return;
    }

    setThemeState(nextTheme);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      themes: THEMES,
      setTheme,
      isThemeActive: (themeId) => themeId === theme,
    }),
    [setTheme, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

export default ThemeContext;

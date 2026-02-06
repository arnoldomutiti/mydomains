import { useState, useEffect } from 'react';
import { STORAGE_KEYS, THEME } from '../config/constants';

export const useTheme = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    return savedTheme === THEME.DARK;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, darkMode ? THEME.DARK : THEME.LIGHT);
    if (darkMode) {
      document.body.setAttribute('data-theme', THEME.DARK);
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(prev => !prev);

  return { darkMode, toggleTheme, setDarkMode };
};

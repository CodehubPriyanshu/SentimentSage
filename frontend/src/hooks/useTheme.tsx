
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isLightTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
  isLightTheme: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check if theme preference is stored in localStorage
    const savedTheme = localStorage.getItem('sentimentsage-theme') as Theme | null;
    
    // If no theme is stored, check system preference
    if (!savedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    
    return savedTheme;
  });

  const isLightTheme = theme === 'light';

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('sentimentsage-theme', theme);
    
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }

    // Add transition class for smooth theme switching
    document.documentElement.classList.add('theme-transition');
    
    // Remove transition class after a delay to prevent transition on page load
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
    
    return () => clearTimeout(timer);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(current => {
      const newTheme = current === 'dark' ? 'light' : 'dark';
      
      // Show toast notification
      toast({
        title: `Theme changed to ${newTheme === 'dark' ? 'Dark' : 'Light'}`,
        description: `Your preference has been saved.`,
        duration: 3000,
      });
      
      return newTheme;
    });
  };

  const setTheme = (newTheme: Theme) => {
    if (newTheme !== theme) {
      // Show toast notification
      toast({
        title: `Theme changed to ${newTheme === 'dark' ? 'Dark' : 'Light'}`,
        description: `Your preference has been saved.`,
        duration: 3000,
      });
    }
    
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isLightTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

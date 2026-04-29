import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { COLORS } from './theme';

export type ThemeMode = 'light' | 'dark' | 'system';

type Colors = typeof COLORS & {
  background: string;
  surface: string;
  card: string;
  border: string;
  text: string;
  textSecondary: string;
  textLight: string;
  primary: string;
};

interface ThemeContextValue {
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: Colors;
}

const ThemeContext = createContext<ThemeContextValue>({} as ThemeContextValue);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const system = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem('theme').then((v) => {
      if (v === 'light' || v === 'dark' || v === 'system') setThemeModeState(v);
    });
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem('theme', mode);
  };

  const isDark = themeMode === 'system' ? system === 'dark' : themeMode === 'dark';

  const colors: Colors = {
    ...COLORS,
    background: isDark ? COLORS.darkBackground : COLORS.background,
    surface: isDark ? COLORS.darkSurface : COLORS.surface,
    card: isDark ? COLORS.darkCard : COLORS.card,
    border: isDark ? COLORS.darkBorder : COLORS.border,
    text: isDark ? COLORS.darkText : COLORS.text,
    textSecondary: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
    textLight: isDark ? COLORS.darkTextSecondary : COLORS.textLight,
    primary: COLORS.primary,
  };

  return (
    <ThemeContext.Provider value={{ isDark, themeMode, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

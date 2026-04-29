import { Platform } from 'react-native';

export const COLORS = {
  // Brand
  primary: '#0A2540',
  primaryLight: '#1E3A5F',
  primaryDark: '#061829',
  accent: '#D4AF37',
  accentLight: '#F4D27A',

  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Backgrounds (light)
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E2E8F0',

  // Text (light)
  text: '#0F172A',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  textInverse: '#FFFFFF',

  // Dark mode
  darkBackground: '#0F172A',
  darkSurface: '#1E293B',
  darkCard: '#334155',
  darkBorder: '#475569',
  darkText: '#F1F5F9',
  darkTextSecondary: '#CBD5E1',

  // Tier colors
  tier: {
    free: '#64748B',
    pro: '#3B82F6',
    ultra: '#8B5CF6',
    vip: '#D4AF37',
  },
};

export const SHADOWS = {
  small: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
    android: { elevation: 2 },
  }) as any,
  medium: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
    android: { elevation: 4 },
  }) as any,
};

export const SIZES = {
  base: 8,
  radius: 12,
  padding: 16,
};

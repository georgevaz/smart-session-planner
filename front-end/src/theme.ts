import { TextStyle, ViewStyle } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const colors = {
  // Base
  background: '#F9FAFB',
  surface: '#FFFFFF',

  // Text
  primary: '#101828',
  secondary: '#364153',
  tertiary: '#4A5565',
  muted: '#6A7282',
  textSecondary: '#6B7280',

  // Borders
  border: '#E5E7EB',
  borderLight: '#D1D5DC',

  // Card backgrounds
  cardPurple: '#F3E8FF',
  cardBlue: '#DBEAFE',
  cardGreen: '#DCFCE7',
  cardMint: '#B9F8CF',
  cardGray: '#E5E7EB',
  cardLavender: '#E9D4FF',
  cardRed: '#FEE2E2',

  // Accent colors
  accentPurple: '#AD46FF',
  accentGreen: '#00C950',
  accentBlue: '#2B7FFF',
  accentDark: '#1E2939',

  // Session type colors
  deepWorkBg: '#E9D4FF',
  deepWorkStroke: '#59168B',
  workoutBg: '#B9F8CF',
  workoutStroke: '#0D542B',

  // Button
  buttonPrimary: '#101828',
  buttonSecondary: '#FFFFFF',
  buttonText: '#0A0A0A',

  // Other
  success: '#10b981',
  danger: '#ef4444',
  iconGray: '#99A1AF',
};

export const typography: { [k: string]: TextStyle } = {
  h1: {
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 36,
    letterSpacing: 0.0703125,
    color: colors.primary,
  },
  h2: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: -0.3125,
    color: colors.primary,
  },
  h3: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 27,
    letterSpacing: -0.439453,
    color: colors.primary,
  },
  h4: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: -0.3125,
    color: colors.primary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.150391,
    color: colors.secondary,
  },
  bodyLarge: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 23,
    letterSpacing: -0.150391,
    color: colors.secondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: colors.tertiary,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.150391,
  },
  statNumber: {
    fontSize: 30,
    fontWeight: '400',
    lineHeight: 36,
    letterSpacing: 0.395508,
    color: colors.primary,
  },
};

export const layout: { card: ViewStyle } = {
  card: { backgroundColor: colors.background, borderRadius: radius.md },
};

export default { spacing, radius, colors, typography, layout };

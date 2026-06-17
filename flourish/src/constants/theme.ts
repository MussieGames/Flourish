// Flourish Design System — Typography, Colors, Spacing

export const Colors = {
  // Core palette
  cream: '#FBF7F2',
  warm: '#FEFCF9',
  blush: '#F2D9CB',
  rose: '#D4A9A0',
  sage: '#B5C4B1',
  sageDark: '#7A9E7E',
  sienna: '#C17B5C',
  ink: '#2C2420',
  inkLight: '#5C4A42',
  inkMedium: '#8C7870',
  gold: '#C9A96E',
  goldLight: '#E8D5B0',

  // Background
  darkBg: '#1A1410',

  // Gradients (used in LinearGradient)
  gradients: {
    memoryPink: ['#E8C4B0', '#C4907A'],
    memorySage: ['#C5D4C0', '#A8BFA8'],
    memoryGold: ['#E8D5B0', '#D4B880'],
    memoryPurple: ['#D4C4D8', '#B4A0C0'],
    darkHero: ['#2C2420', '#1A1410'],
  },

  // Semantic
  success: '#7A9E7E',
  warning: '#C9A96E',
  error: '#C17B5C',
  info: '#B5C4B1',

  // Transparency helpers
  overlay: 'rgba(44,36,32,0.6)',
  whiteAlpha10: 'rgba(255,255,255,0.1)',
  whiteAlpha15: 'rgba(255,255,255,0.15)',
  whiteAlpha40: 'rgba(251,247,242,0.4)',
  siennaAlpha30: 'rgba(193,123,92,0.3)',
  border: 'rgba(196,169,160,0.25)',
  borderDark: 'rgba(196,169,160,0.4)',
} as const;

export const Typography = {
  serif: 'Cormorant_Garamond',
  serifItalic: 'Cormorant_Garamond_Italic',
  sans: 'DM_Sans',
  storySerif: 'Lora_Italic',

  sizes: {
    xs: 9,
    sm: 11,
    base: 13,
    md: 14,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    hero: 42,
  },

  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  mdPlus: 16, // replaces "Spacing.md + 4" arithmetic in styles
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
  '6xl': 52,
  '7xl': 60,
} as const;

export const BorderRadius = {
  sm: 2,
  md: 4,
  lg: 8,
  xl: 16,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#2C2420',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  md: {
    shadowColor: '#2C2420',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 8,
  },
  sienna: {
    shadowColor: '#C17B5C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 40 },
    shadowOpacity: 0.7,
    shadowRadius: 120,
    elevation: 24,
  },
} as const;

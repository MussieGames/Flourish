/**
 * Font family keys. The actual font assets are loaded in `fonts.ts`.
 * - Cormorant Garamond → elegant serif display headings
 * - DM Sans → clean sans body / UI
 * - Lora → italic serif for journal / handwritten feel
 */
export const fonts = {
  display: 'CormorantGaramond_300Light',
  displayItalic: 'CormorantGaramond_400Regular_Italic',
  displaySemibold: 'CormorantGaramond_600SemiBold',
  body: 'DMSans_400Regular',
  bodyLight: 'DMSans_300Light',
  bodyMedium: 'DMSans_500Medium',
  serifItalic: 'Lora_400Regular_Italic',
  serifItalicBold: 'Lora_600SemiBold_Italic',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 2,
  md: 4,
  lg: 12,
  pill: 40,
  round: 999,
} as const;

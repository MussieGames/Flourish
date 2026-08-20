/**
 * Flourish colour palette — ported from the brand design system.
 * Warm, calm, night-friendly tones for exhausted new parents.
 */
export const colors = {
  cream: '#FBF7F2',
  warm: '#FEFCF9',
  blush: '#F2D9CB',
  rose: '#D4A9A0',
  sage: '#B5C4B1',
  sageDark: '#7A9E7E',
  sienna: '#C17B5C',
  ink: '#2C2420',
  inkLight: '#5C4A42',
  inkMuted: '#8C7870',
  gold: '#C9A96E',
  goldLight: '#E8D5B0',
  night: '#1A1410',

  // Functional aliases
  background: '#FBF7F2',
  surface: '#FEFCF9',
  border: 'rgba(196,169,160,0.25)',
  borderStrong: 'rgba(196,169,160,0.4)',
  danger: '#B4544B',
  white: '#FFFFFF',

  // Event dot colours (calendar)
  dotMilestone: '#C17B5C',
  dotMemory: '#7A9E7E',
  dotAppointment: '#C9A96E',

  // On-dark text opacities
  onDark: '#FBF7F2',
  onDark60: 'rgba(251,247,242,0.6)',
  onDark45: 'rgba(251,247,242,0.45)',
  onDark40: 'rgba(251,247,242,0.4)',
  onDark25: 'rgba(251,247,242,0.25)',
} as const;

export type AppColor = keyof typeof colors;

/**
 * Design tokens for Flourish.
 *
 * Ported directly from the original web mockup's CSS custom properties so the
 * native app stays visually faithful to the approved design.
 */

export const colors = {
  cream: "#FBF7F2",
  warm: "#FEFCF9",
  blush: "#F2D9CB",
  rose: "#D4A9A0",
  sage: "#B5C4B1",
  sageDark: "#7A9E7E",
  sienna: "#C17B5C",
  ink: "#2C2420",
  inkLight: "#5C4A42",
  inkMuted: "#8C7870",
  gold: "#C9A96E",
  goldLight: "#E8D5B0",
  /** Near-black used behind the device frame / dark hero sections. */
  night: "#1A1410",
  white: "#FFFFFF",

  // Translucent helpers (RN has no rgba() var support, so precompute the common ones).
  creamOn10: "rgba(251,247,242,0.10)",
  creamOn25: "rgba(251,247,242,0.25)",
  creamOn40: "rgba(251,247,242,0.40)",
  creamOn45: "rgba(251,247,242,0.45)",
  creamOn60: "rgba(251,247,242,0.60)",
  creamOn65: "rgba(251,247,242,0.65)",
  hairline: "rgba(196,169,160,0.25)",
  hairlineStrong: "rgba(196,169,160,0.40)",
  sageTint: "rgba(181,196,177,0.15)",
  siennaTint: "rgba(193,123,92,0.08)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
} as const;

export const radius = {
  sm: 2,
  md: 4,
  lg: 8,
  pill: 40,
  round: 999,
} as const;

export const shadow = {
  soft: {
    shadowColor: "#2C2420",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  lifted: {
    shadowColor: "#C17B5C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

export type AppColors = typeof colors;

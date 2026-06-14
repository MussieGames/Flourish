export const colors = {
  cream: "#FBF7F2",
  warm: "#FEFCF9",
  blush: "#F2D9CB",
  rose: "#D4A9A0",
  sage: "#B5C4B1",
  sageDark: "#7A9E7E",
  sienna: "#C17B5C",
  siennaDark: "#A86040",
  ink: "#2C2420",
  inkLight: "#5C4A42",
  inkMuted: "#8C7870",
  gold: "#C9A96E",
  goldLight: "#E8D5B0",
  white: "#FFFFFF",
  danger: "#A54136",
  overlay: "rgba(44,36,32,0.08)",
} as const;

export const fontFamily = {
  sans: "DMSans_400Regular",
  sansMedium: "DMSans_500Medium",
  serif: "CormorantGaramond_400Regular",
  serifLight: "CormorantGaramond_300Light",
  serifItalic: "CormorantGaramond_400Regular_Italic",
  journal: "Lora_400Regular_Italic",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const shadow = {
  soft: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  glow: {
    shadowColor: colors.sienna,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 26,
    elevation: 5,
  },
} as const;

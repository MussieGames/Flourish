import { Platform, StyleSheet } from "react-native";

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
  white: "#FFFFFF"
};

export const fonts = {
  serif: Platform.select({
    ios: "Georgia",
    android: "serif",
    default: "serif"
  }),
  sans: Platform.select({
    ios: "Avenir Next",
    android: "sans-serif",
    default: "system-ui"
  })
};

export const shadow = StyleSheet.create({
  card: {
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },
  warm: {
    shadowColor: colors.sienna,
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6
  }
});

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32
};

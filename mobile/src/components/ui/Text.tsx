import React from "react";
import { Text as RNText, StyleSheet, type TextProps } from "react-native";

import { colors } from "../../theme/tokens";
import { fonts } from "../../theme/typography";

type Variant =
  | "display"
  | "title"
  | "heading"
  | "serif"
  | "body"
  | "bodyMuted"
  | "label"
  | "caption"
  | "journal";

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  italic?: boolean;
  center?: boolean;
}

const base: Record<Variant, object> = {
  display: { fontFamily: fonts.serif, fontSize: 40, lineHeight: 44, color: colors.ink },
  title: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 34, color: colors.ink },
  heading: { fontFamily: fonts.serif, fontSize: 24, lineHeight: 28, color: colors.ink },
  serif: { fontFamily: fonts.serifRegular, fontSize: 18, color: colors.ink },
  body: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 22, color: colors.inkLight },
  bodyMuted: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: colors.inkMuted },
  label: {
    fontFamily: fonts.sans,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: colors.sienna,
  },
  caption: { fontFamily: fonts.sans, fontSize: 11, color: colors.inkMuted },
  journal: {
    fontFamily: fonts.loraItalic,
    fontSize: 14,
    lineHeight: 24,
    color: colors.inkLight,
  },
};

export function Text({
  variant = "body",
  color,
  italic,
  center,
  style,
  ...rest
}: Props) {
  return (
    <RNText
      {...rest}
      style={[
        base[variant],
        italic && styles.italic,
        center && styles.center,
        color ? { color } : null,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  italic: { fontFamily: fonts.serifItalic },
  center: { textAlign: "center" },
});
